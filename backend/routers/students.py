"""
routers/students.py
-------------------
Student-specific endpoints: Overview dashboard, profile management, and study goals.
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, StudentProfile, PredictionRecord, StudyGoal
from backend.schemas import (
    StudentProfileOut,
    UserProfileUpdate,
    GoalCreate,
    GoalUpdate,
    GoalOut,
    PredictionResponse,
)
from backend.auth import get_current_student
from backend.ml_service import load_dataset, load_results

router = APIRouter(prefix="/api/students", tags=["Student Portal"])


@router.get("/overview")
def get_student_overview(
    student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Aggregate personalized overview data for the student dashboard."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student.id).first()
    predictions = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == student.id)
        .order_by(PredictionRecord.created_at.desc())
        .all()
    )
    goals = db.query(StudyGoal).filter(StudyGoal.user_id == student.id).all()

    latest_pred = predictions[0] if predictions else None
    predicted_grade = latest_pred.predicted_grade if latest_pred else None
    performance_category = latest_pred.performance_category if latest_pred else "Awaiting Assessment"
    target_grade = profile.target_grade if profile else 15.0

    # Trend calculation
    history = [
        {
            "id": p.id,
            "predicted_grade": p.predicted_grade,
            "created_at": p.created_at.isoformat(),
            "category": p.performance_category,
        }
        for p in reversed(predictions[-5:])
    ]

    # Strengths and areas for improvement
    strengths = []
    improvements = []
    if latest_pred:
        feats = latest_pred.input_features
        if feats.get("studytime", 0) >= 3:
            strengths.append("High Weekly Study Commitment (>5 hours)")
        elif feats.get("studytime", 0) <= 1:
            improvements.append("Study time under 2 hours weekly")

        if feats.get("absences", 0) <= 3:
            strengths.append("Excellent School Attendance")
        elif feats.get("absences", 0) >= 8:
            improvements.append(f"Elevated Absenteeism ({feats.get('absences')} days)")

        if feats.get("failures", 0) == 0:
            strengths.append("Clean Academic Record (Zero Prior Failures)")
        else:
            improvements.append(f"Prior class failures requiring remedial reinforcement ({feats.get('failures')})")

        if feats.get("higher") == "yes":
            strengths.append("Goal-driven Higher Education Aspiration")
    else:
        strengths = ["Ready for initial assessment", "Baseline profile established"]
        improvements = ["Generate your first performance prediction to unlock personalized insights"]

    completed_goals = sum(1 for g in goals if g.completed)

    return {
        "student_name": student.full_name,
        "email": student.email,
        "school": profile.school if profile else "Gabriel Pereira (GP)",
        "student_id": profile.student_id_number if profile else f"STU-{student.id:04d}",
        "predicted_grade": predicted_grade,
        "confidence_low": latest_pred.confidence_low if latest_pred else None,
        "confidence_high": latest_pred.confidence_high if latest_pred else None,
        "performance_category": performance_category,
        "target_grade": target_grade,
        "total_predictions": len(predictions),
        "recent_predictions": history,
        "active_goals_count": len(goals) - completed_goals,
        "completed_goals_count": completed_goals,
        "strengths": strengths[:3],
        "improvements": improvements[:3],
        "latest_recommendations": latest_pred.recommendations if latest_pred else [],
    }


@router.get("/profile", response_model=Dict[str, Any])
def get_student_profile(
    student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Retrieve full student profile."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student.id).first()
    return {
        "id": student.id,
        "email": student.email,
        "full_name": student.full_name,
        "role": student.role,
        "is_active": student.is_active,
        "created_at": student.created_at,
        "student_id_number": profile.student_id_number if profile else None,
        "school": profile.school if profile else "Gabriel Pereira (GP)",
        "academic_year": profile.academic_year if profile else "Secondary Year 2",
        "target_grade": profile.target_grade if profile else 15.0,
        "phone": profile.phone if profile else "",
        "bio": profile.bio if profile else "",
    }


@router.put("/profile")
def update_student_profile(
    payload: UserProfileUpdate,
    student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update profile and academic goals."""
    if payload.full_name:
        student.full_name = payload.full_name.strip()

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student.id).first()
    if not profile:
        profile = StudentProfile(user_id=student.id)
        db.add(profile)

    if payload.school is not None:
        profile.school = payload.school
    if payload.academic_year is not None:
        profile.academic_year = payload.academic_year
    if payload.target_grade is not None:
        profile.target_grade = payload.target_grade
    if payload.phone is not None:
        profile.phone = payload.phone
    if payload.bio is not None:
        profile.bio = payload.bio

    db.commit()
    return {"message": "Profile updated successfully"}


# ──────────────────────────────────────────────
# STUDY GOALS
# ──────────────────────────────────────────────
@router.get("/goals", response_model=List[GoalOut])
def get_goals(
    student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Fetch goals created by the authenticated student."""
    return db.query(StudyGoal).filter(StudyGoal.user_id == student.id).order_by(StudyGoal.created_at.desc()).all()


@router.post("/goals", response_model=GoalOut)
def create_goal(
    payload: GoalCreate,
    student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Create a new study goal."""
    goal = StudyGoal(
        user_id=student.id,
        title=payload.title,
        category=payload.category,
        target_hours=payload.target_hours,
        due_date=payload.due_date,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/goals/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Update or toggle study goal status."""
    goal = db.query(StudyGoal).filter(StudyGoal.id == goal_id, StudyGoal.user_id == student.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Study goal not found")

    if payload.title is not None:
        goal.title = payload.title
    if payload.category is not None:
        goal.category = payload.category
    if payload.target_hours is not None:
        goal.target_hours = payload.target_hours
    if payload.completed is not None:
        goal.completed = payload.completed
        goal.completed_at = datetime.now(timezone.utc) if payload.completed else None
    if payload.due_date is not None:
        goal.due_date = payload.due_date

    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/goals/{goal_id}")
def delete_goal(
    goal_id: int,
    student: User = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    """Remove a study goal."""
    goal = db.query(StudyGoal).filter(StudyGoal.id == goal_id, StudyGoal.user_id == student.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Study goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal removed successfully"}
