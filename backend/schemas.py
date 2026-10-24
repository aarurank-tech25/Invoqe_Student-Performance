"""
schemas.py
----------
Pydantic v2 schemas for request validation and response serialization.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ──────────────────────────────────────────────
# AUTH & USER SCHEMAS
# ──────────────────────────────────────────────
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100)
    student_id_number: Optional[str] = None
    school: Optional[str] = "Gabriel Pereira (GP)"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    school: Optional[str] = None
    academic_year: Optional[str] = None
    target_grade: Optional[float] = Field(None, ge=0.0, le=20.0)
    phone: Optional[str] = None
    bio: Optional[str] = None


class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    student_id_number: Optional[str] = None
    school: str
    academic_year: str
    target_grade: float
    phone: Optional[str] = None
    bio: Optional[str] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ──────────────────────────────────────────────
# PREDICTION SCHEMAS (30 Predictors, ZERO Leakage)
# ──────────────────────────────────────────────
class PredictionInput(BaseModel):
    # Demographics
    school: str = Field("GP", description="GP or MS")
    sex: str = Field("F", description="F or M")
    age: int = Field(17, ge=15, le=22)
    address: str = Field("U", description="U (Urban) or R (Rural)")
    famsize: str = Field("GT3", description="LE3 (<=3) or GT3 (>3)")
    Pstatus: str = Field("T", description="T (Together) or A (Apart)")

    # Family Background
    Medu: int = Field(2, ge=0, le=4, description="0=None, 1=Primary, 2=5-9th, 3=Secondary, 4=Higher")
    Fedu: int = Field(2, ge=0, le=4, description="0=None, 1=Primary, 2=5-9th, 3=Secondary, 4=Higher")
    Mjob: str = Field("other", description="teacher, health, services, at_home, other")
    Fjob: str = Field("other", description="teacher, health, services, at_home, other")
    reason: str = Field("course", description="home, reputation, course, other")
    guardian: str = Field("mother", description="mother, father, other")

    # Academic & Study Habits
    traveltime: int = Field(1, ge=1, le=4, description="1: <15m, 2: 15-30m, 3: 30-60m, 4: >60m")
    studytime: int = Field(2, ge=1, le=4, description="1: <2h, 2: 2-5h, 3: 5-10h, 4: >10h")
    failures: int = Field(0, ge=0, le=3, description="Past class failures (0-3)")
    schoolsup: str = Field("no", description="yes or no")
    famsup: str = Field("yes", description="yes or no")
    paid: str = Field("no", description="yes or no")
    activities: str = Field("no", description="yes or no")
    nursery: str = Field("yes", description="yes or no")
    higher: str = Field("yes", description="yes or no")
    internet: str = Field("yes", description="yes or no")
    romantic: str = Field("no", description="yes or no")

    # Lifestyle & Wellbeing
    famrel: int = Field(4, ge=1, le=5, description="1 (Very Bad) to 5 (Excellent)")
    freetime: int = Field(3, ge=1, le=5, description="1 (Very Low) to 5 (Very High)")
    goout: int = Field(3, ge=1, le=5, description="1 (Very Low) to 5 (Very High)")
    Dalc: int = Field(1, ge=1, le=5, description="Workday alcohol consumption (1-5)")
    Walc: int = Field(1, ge=1, le=5, description="Weekend alcohol consumption (1-5)")
    health: int = Field(3, ge=1, le=5, description="Current health status (1-5)")
    absences: int = Field(4, ge=0, le=93, description="School absences (0-93)")


class PredictionResponse(BaseModel):
    id: int
    predicted_grade: float
    confidence_low: float
    confidence_high: float
    performance_category: str
    model_name: str
    recommendations: List[Dict[str, str]]
    input_features: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ──────────────────────────────────────────────
# GOAL SCHEMAS
# ──────────────────────────────────────────────
class GoalCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    category: str = Field("Mathematics", max_length=50)
    target_hours: float = Field(4.0, ge=0.5, le=50.0)
    due_date: Optional[str] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    target_hours: Optional[float] = None
    completed: Optional[bool] = None
    due_date: Optional[str] = None


class GoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    category: str
    target_hours: float
    completed: bool
    due_date: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ──────────────────────────────────────────────
# ADMIN & SYSTEM SCHEMAS
# ──────────────────────────────────────────────
class AdminStudentOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    school: Optional[str] = None
    student_id_number: Optional[str] = None
    target_grade: Optional[float] = None
    prediction_count: int = 0
    latest_predicted_grade: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class AdminOverviewStats(BaseModel):
    total_students: int
    total_predictions: int
    active_students_count: int
    average_predicted_grade: float
    champion_model_name: str
    champion_rmse: float
    champion_mae: float
    champion_r2: float
    dataset_students_count: int
    dataset_mean_grade: float
    dataset_pass_rate: float
    performance_segments: Dict[str, int]


class AuditLogOut(BaseModel):
    id: int
    actor_id: Optional[int] = None
    actor_email: str
    action: str
    resource_type: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
