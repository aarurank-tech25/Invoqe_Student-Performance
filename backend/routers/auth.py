"""
routers/auth.py
---------------
Authentication endpoints: Registration, Login, and Profile introspection.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, StudentProfile, AuditLog
from backend.schemas import UserLogin, UserRegister, TokenResponse, UserOut
from backend.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register_student(payload: UserRegister, request: Request, db: Session = Depends(get_db)):
    """Register a new student account with dedicated profile."""
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered.",
        )

    # Student ID collision check
    if payload.student_id_number:
        existing_id = db.query(StudentProfile).filter(StudentProfile.student_id_number == payload.student_id_number).first()
        if existing_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID number already assigned to another profile.",
            )

    new_user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role="student",
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize associated StudentProfile
    profile = StudentProfile(
        user_id=new_user.id,
        student_id_number=payload.student_id_number or f"STU-{new_user.id:04d}",
        school=payload.school or "Gabriel Pereira (GP)",
        target_grade=15.0,
    )
    db.add(profile)

    # Audit Logging
    audit = AuditLog(
        actor_id=new_user.id,
        actor_email=new_user.email,
        action="USER_REGISTER",
        resource_type="User",
        details=f"Registered student account: {new_user.email}",
        ip_address=request.client.host if request.client else "127.0.0.1",
    )
    db.add(audit)
    db.commit()

    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    return {"access_token": token, "token_type": "bearer", "user": new_user}


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate student or admin and issue JWT token."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator.",
        )

    # Audit Logging
    audit = AuditLog(
        actor_id=user.id,
        actor_email=user.email,
        action="USER_LOGIN",
        resource_type="Session",
        details=f"User signed in with role '{user.role}'",
        ip_address=request.client.host if request.client else "127.0.0.1",
    )
    db.add(audit)
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Return currently authenticated actor credentials."""
    return user
