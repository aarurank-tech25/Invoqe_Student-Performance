"""
routers/admin.py
----------------
Administrative endpoints: User management, cohort analytics, ML model lab,
and audit logs. Strictly protected by get_current_admin dependency.
"""

import io
import csv
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from backend.database import get_db
from backend.models import User, StudentProfile, PredictionRecord, AuditLog
from backend.schemas import (
    AdminStudentOut,
    AdminOverviewStats,
    AuditLogOut,
)
from backend.auth import get_current_admin
from backend.ml_service import load_dataset, load_results, load_feature_importance

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])


@router.get("/overview", response_model=AdminOverviewStats)
def get_admin_overview(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Aggregate high-level platform KPIs, dataset metrics, and model performance."""
    total_students = db.query(User).filter(User.role == "student").count()
    active_students = db.query(User).filter(User.role == "student", User.is_active == True).count()
    total_preds = db.query(PredictionRecord).count()

    # Average predicted grade across all student records
    avg_pred_grade_query = db.query(func.avg(PredictionRecord.predicted_grade)).scalar()
    avg_pred_grade = round(float(avg_pred_grade_query), 2) if avg_pred_grade_query else 0.0

    # Segments breakdown
    segments = {
        "Distinction (≥ 16)": db.query(PredictionRecord).filter(PredictionRecord.predicted_grade >= 16.0).count(),
        "Good (14–15.9)": db.query(PredictionRecord).filter(PredictionRecord.predicted_grade >= 14.0, PredictionRecord.predicted_grade < 16.0).count(),
        "Satisfactory (10–13.9)": db.query(PredictionRecord).filter(PredictionRecord.predicted_grade >= 10.0, PredictionRecord.predicted_grade < 14.0).count(),
        "At Risk (< 10)": db.query(PredictionRecord).filter(PredictionRecord.predicted_grade < 10.0).count(),
    }

    # Model evaluation metrics from actual training run
    results = load_results()
    best_name = results.get("best_model", "Random Forest")
    best_metrics = results.get(best_name, {})

    # Actual UCI dataset statistics
    df = load_dataset()
    dataset_count = len(df)
    dataset_mean = round(float(df["G3"].mean()), 2)
    dataset_pass = round(float((df["G3"] >= 10).mean() * 100), 1)

    return {
        "total_students": total_students,
        "total_predictions": total_preds,
        "active_students_count": active_students,
        "average_predicted_grade": avg_pred_grade,
        "champion_model_name": best_name,
        "champion_rmse": float(best_metrics.get("RMSE", 3.802)),
        "champion_mae": float(best_metrics.get("MAE", 3.00)),
        "champion_r2": float(best_metrics.get("R2", 0.295)),
        "dataset_students_count": dataset_count,
        "dataset_mean_grade": dataset_mean,
        "dataset_pass_rate": dataset_pass,
        "performance_segments": segments,
    }


@router.get("/students")
def list_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    school: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve paginated student directory with search and filter capabilities."""
    query = db.query(User).filter(User.role == "student")

    if search:
        s = f"%{search.lower()}%"
        query = query.filter(or_(User.email.ilike(s), User.full_name.ilike(s)))

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    records = []
    for u in users:
        p = u.profile
        pred_count = len(u.predictions)
        latest_pred = u.predictions[-1].predicted_grade if u.predictions else None
        records.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "school": p.school if p else "GP",
            "student_id_number": p.student_id_number if p else f"STU-{u.id:04d}",
            "target_grade": p.target_grade if p else 15.0,
            "prediction_count": pred_count,
            "latest_predicted_grade": latest_pred,
        })

    return {
        "items": records,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.put("/students/{student_id}/status")
def toggle_student_status(
    student_id: int,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Activate or deactivate student access."""
    target = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not target:
        raise HTTPException(status_code=404, detail="Student user not found")

    target.is_active = not target.is_active

    # Audit Logging
    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="STUDENT_STATUS_TOGGLED",
        resource_type="User",
        details=f"Admin {admin.email} set student {target.email} is_active={target.is_active}",
        ip_address=request.client.host if request.client else "127.0.0.1",
    )
    db.add(audit)
    db.commit()

    return {"message": f"Student account is now {'active' if target.is_active else 'deactivated'}", "is_active": target.is_active}


@router.get("/students/{student_id}/predictions")
def get_student_predictions_for_admin(
    student_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Authorized administrative review of an individual student's prediction records."""
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    records = db.query(PredictionRecord).filter(PredictionRecord.user_id == student_id).order_by(PredictionRecord.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "predicted_grade": r.predicted_grade,
            "confidence_low": r.confidence_low,
            "confidence_high": r.confidence_high,
            "performance_category": r.performance_category,
            "recommendations": r.recommendations,
            "input_features": r.input_features,
            "created_at": r.created_at,
        }
        for r in records
    ]


@router.get("/analytics")
def get_cohort_analytics(admin: User = Depends(get_current_admin)):
    """Retrieve statistical distribution and correlation metadata for the real dataset."""
    df = load_dataset()

    # 1. Grade distribution (0-20)
    grade_counts = df["G3"].value_counts().sort_index()
    dist_data = [{"grade": int(k), "count": int(v)} for k, v in grade_counts.items()]

    # 2. Study time vs Grade
    study_map = {1: "< 2 hours", 2: "2 to 5 hours", 3: "5 to 10 hours", 4: "> 10 hours"}
    study_stats = []
    for st_val, label in study_map.items():
        subset = df[df["studytime"] == st_val]["G3"]
        if len(subset) > 0:
            study_stats.append({
                "bracket": label,
                "mean_grade": round(float(subset.mean()), 2),
                "median_grade": round(float(subset.median()), 2),
                "student_count": len(subset),
            })

    # 3. Absences vs Grade
    absence_sample = df[["absences", "G3", "failures"]].head(100).to_dict(orient="records")

    # 4. Correlation with G3 for numeric columns
    numeric_df = df.select_dtypes(include=["number"])
    corr = numeric_df.corr()["G3"].drop("G3").round(3).to_dict()
    corr_list = sorted([{"feature": k, "correlation": float(v)} for k, v in corr.items()], key=lambda x: abs(x["correlation"]), reverse=True)

    return {
        "grade_distribution": dist_data,
        "study_time_breakdown": study_stats,
        "absence_scatter_sample": absence_sample,
        "correlations_with_grade": corr_list,
        "total_records": len(df),
    }


@router.get("/analytics/export-csv")
def export_students_csv(
    request: Request,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Export registered platform student roster to CSV."""
    students = db.query(User).filter(User.role == "student").order_by(User.id).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Student ID", "Full Name", "Email", "School", "Active Status", "Target Grade", "Predictions Generated", "Registered At"])

    for s in students:
        p = s.profile
        writer.writerow([
            s.id,
            p.student_id_number if p else f"STU-{s.id:04d}",
            s.full_name,
            s.email,
            p.school if p else "N/A",
            "Active" if s.is_active else "Deactivated",
            p.target_grade if p else 15.0,
            len(s.predictions),
            s.created_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
        ])

    # Audit Log
    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="EXPORT_CSV",
        resource_type="StudentList",
        details="Admin exported student roster to CSV",
        ip_address=request.client.host if request.client else "127.0.0.1",
    )
    db.add(audit)
    db.commit()

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=aether_students_export.csv"},
    )


@router.get("/models")
def get_model_benchmarks(admin: User = Depends(get_current_admin)):
    """Retrieve test-set model evaluation metrics and feature importance rankings."""
    results = load_results()
    feat_imp = load_feature_importance()

    models_comparison = []
    for name in ["Linear Regression", "Decision Tree", "Random Forest"]:
        if name in results:
            m = results[name]
            is_best = (name == results.get("best_model"))
            models_comparison.append({
                "model_name": name,
                "mae": m["MAE"],
                "rmse": m["RMSE"],
                "r2": m["R2"],
                "is_champion": is_best,
            })

    return {
        "champion_model": results.get("best_model", "Random Forest"),
        "models": models_comparison,
        "feature_importances": feat_imp[:15],
        "training_metadata": {
            "dataset": "UCI Student Performance (student-mat.csv)",
            "samples_train": 316,
            "samples_test": 79,
            "test_split": "20% Holdout",
            "zero_leakage": "G1 and G2 strictly excluded from feature space",
        }
    }


@router.get("/audit", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve recent administrative audit log events."""
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
