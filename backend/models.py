"""
models.py
---------
SQLAlchemy models for AETHER platform: Users, Profiles, Predictions, Goals, Audit Logs.
"""

from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from backend.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # 'student' or 'admin'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("StudyGoal", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id_number = Column(String(50), unique=True, index=True, nullable=True)
    school = Column(String(100), default="Gabriel Pereira (GP)", nullable=False)
    academic_year = Column(String(50), default="Secondary Year 2", nullable=False)
    target_grade = Column(Float, default=15.0, nullable=False)
    phone = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_grade = Column(Float, nullable=False)
    confidence_low = Column(Float, nullable=False)
    confidence_high = Column(Float, nullable=False)
    performance_category = Column(String(100), nullable=False)  # Distinction, Good, Average, At Risk
    model_name = Column(String(100), default="Random Forest Regressor", nullable=False)
    input_features_json = Column(Text, nullable=False)  # Stored as JSON string
    recommendations_json = Column(Text, nullable=False)  # Stored as JSON string
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    user = relationship("User", back_populates="predictions")

    @property
    def input_features(self):
        return json.loads(self.input_features_json) if self.input_features_json else {}

    @property
    def recommendations(self):
        return json.loads(self.recommendations_json) if self.recommendations_json else []


class StudyGoal(Base):
    __tablename__ = "study_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Mathematics", nullable=False)
    target_hours = Column(Float, default=4.0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    due_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="goals")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True, index=True)
    actor_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False, index=True)  # LOGIN, PREDICTION_CREATED, USER_UPDATED, EXPORT_CSV
    resource_type = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(100), default="127.0.0.1")
    timestamp = Column(DateTime, default=utc_now, nullable=False, index=True)
