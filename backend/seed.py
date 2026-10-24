"""
seed.py
-------
Database initialization and demo account seeding.
Run directly via: python -m backend.seed
"""

import json
from datetime import datetime, timezone, timedelta
from backend.database import engine, SessionLocal, Base
from backend.models import User, StudentProfile, PredictionRecord, StudyGoal, AuditLog
from backend.auth import hash_password


def seed_database():
    """Create all schema tables and populate demo accounts."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Admin Account
        admin = db.query(User).filter(User.email == "admin@aether.edu").first()
        if not admin:
            admin = User(
                email="admin@aether.edu",
                hashed_password=hash_password("AdminPass123!"),
                full_name="Dr. Eleanor Vance (Dean)",
                role="admin",
                is_active=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

            db.add(AuditLog(
                actor_id=admin.id,
                actor_email=admin.email,
                action="SYSTEM_INIT",
                resource_type="Database",
                details="Seeded default platform administrator account",
            ))
            print("  Created demo admin: admin@aether.edu / AdminPass123!")
        else:
            print("  Demo admin already exists.")

        # 2. Primary Demo Student (Sophia Martinez)
        student = db.query(User).filter(User.email == "student@aether.edu").first()
        if not student:
            student = User(
                email="student@aether.edu",
                hashed_password=hash_password("StudentPass123!"),
                full_name="Sophia Martinez",
                role="student",
                is_active=True,
            )
            db.add(student)
            db.commit()
            db.refresh(student)

            profile = StudentProfile(
                user_id=student.id,
                student_id_number="STU-1001",
                school="Gabriel Pereira (GP)",
                academic_year="Secondary Year 2",
                target_grade=16.0,
                bio="Aspiring aerospace engineering student focusing on advanced mathematics and physics.",
            )
            db.add(profile)

            # Seed realistic historical predictions for trend charts
            now = datetime.now(timezone.utc)
            preds = [
                PredictionRecord(
                    user_id=student.id,
                    predicted_grade=13.4,
                    confidence_low=10.4,
                    confidence_high=16.4,
                    performance_category="Satisfactory / Passing",
                    model_name="Random Forest Regressor",
                    input_features_json=json.dumps({"studytime": 2, "failures": 0, "absences": 8, "higher": "yes", "health": 3}),
                    recommendations_json=json.dumps([
                        {"type": "info", "title": "Scale Study Investment", "detail": "Increase focused study time to 5+ hours weekly."},
                        {"type": "warning", "title": "Monitor Attendance", "detail": "Keep absences below 5 days to avoid missing concepts."}
                    ]),
                    created_at=now - timedelta(days=45),
                ),
                PredictionRecord(
                    user_id=student.id,
                    predicted_grade=14.8,
                    confidence_low=11.8,
                    confidence_high=17.8,
                    performance_category="Good Performance",
                    model_name="Random Forest Regressor",
                    input_features_json=json.dumps({"studytime": 3, "failures": 0, "absences": 4, "higher": "yes", "health": 4}),
                    recommendations_json=json.dumps([
                        {"type": "success", "title": "Positive Momentum", "detail": "Consistent study hours have stabilized performance above class median."},
                        {"type": "info", "title": "Exam Prep Routine", "detail": "Practice timed problem sets under exam conditions."}
                    ]),
                    created_at=now - timedelta(days=15),
                ),
                PredictionRecord(
                    user_id=student.id,
                    predicted_grade=15.7,
                    confidence_low=12.7,
                    confidence_high=18.7,
                    performance_category="Good Performance",
                    model_name="Random Forest Regressor",
                    input_features_json=json.dumps({"studytime": 4, "failures": 0, "absences": 2, "higher": "yes", "health": 5}),
                    recommendations_json=json.dumps([
                        {"type": "success", "title": "Targeting Distinction", "detail": "Score trajectory approaching high honors tier (≥16/20)."},
                        {"type": "info", "title": "Peer Mentorship", "detail": "Participating in study groups reinforces core retention."}
                    ]),
                    created_at=now - timedelta(days=2),
                ),
            ]
            for p in preds:
                db.add(p)

            # Seed Study Goals
            goals = [
                StudyGoal(
                    user_id=student.id,
                    title="Complete Calculus Problem Set Chapter 4",
                    category="Mathematics",
                    target_hours=4.0,
                    completed=True,
                    due_date="2026-10-20",
                    completed_at=now - timedelta(days=4),
                ),
                StudyGoal(
                    user_id=student.id,
                    title="Review Polynomial Trigonometry Identities",
                    category="Mathematics",
                    target_hours=3.5,
                    completed=True,
                    due_date="2026-10-22",
                    completed_at=now - timedelta(days=2),
                ),
                StudyGoal(
                    user_id=student.id,
                    title="Solve 2024 Practice Exam Section A",
                    category="Mathematics",
                    target_hours=5.0,
                    completed=False,
                    due_date="2026-10-28",
                ),
                StudyGoal(
                    user_id=student.id,
                    title="Attend After-School Math Clinic on Probability",
                    category="Academic Clinic",
                    target_hours=2.0,
                    completed=False,
                    due_date="2026-10-30",
                ),
            ]
            for g in goals:
                db.add(g)

            print("  Created demo student: student@aether.edu / StudentPass123!")
        else:
            print("  Demo student already exists.")

        # 3. Additional Sample Students to populate Admin portal tables
        sample_students = [
            ("Lucas Bennett", "lucas.bennett@student.edu", "STU-1002", "Gabriel Pereira (GP)", 14.2, "Good Performance"),
            ("Emma Watson", "emma.watson@student.edu", "STU-1003", "Mousinho da Silveira (MS)", 11.5, "Satisfactory / Passing"),
            ("Mateo Silva", "mateo.silva@student.edu", "STU-1004", "Gabriel Pereira (GP)", 8.9, "At Risk / Intervention Advised"),
            ("Aaliyah Khan", "aaliyah.khan@student.edu", "STU-1005", "Gabriel Pereira (GP)", 17.1, "Distinction / Excellent"),
        ]

        for name, email, stu_id, school, pred_grade, cat in sample_students:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    email=email,
                    hashed_password=hash_password("StudentPass123!"),
                    full_name=name,
                    role="student",
                    is_active=True,
                )
                db.add(u)
                db.commit()
                db.refresh(u)

                db.add(StudentProfile(
                    user_id=u.id,
                    student_id_number=stu_id,
                    school=school,
                    target_grade=15.0,
                ))

                db.add(PredictionRecord(
                    user_id=u.id,
                    predicted_grade=pred_grade,
                    confidence_low=max(0.0, pred_grade - 3.0),
                    confidence_high=min(20.0, pred_grade + 3.0),
                    performance_category=cat,
                    model_name="Random Forest Regressor",
                    input_features_json=json.dumps({"studytime": 2, "absences": 4, "failures": 0}),
                    recommendations_json=json.dumps([{"type": "info", "title": "Guidance", "detail": "Maintain regular attendance."}]),
                ))

        db.commit()
        print("  Database seeded successfully with demo records.")
    except Exception as e:
        db.rollback()
        print(f"  Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
