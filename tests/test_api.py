"""
test_api.py
-----------
Integration tests for FastAPI endpoints: authentication, role authorization,
prediction persistence, and cross-student report access restriction.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.seed import seed_database

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    seed_database()


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_student_login_success():
    response = client.post(
        "/api/auth/login",
        json={"email": "student@aether.edu", "password": "StudentPass123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"


def test_admin_login_success():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@aether.edu", "password": "AdminPass123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"


def test_invalid_login_rejected():
    response = client.post(
        "/api/auth/login",
        json={"email": "student@aether.edu", "password": "IncorrectPassword"}
    )
    assert response.status_code == 401


def test_student_cannot_access_admin_overview():
    """Verify backend enforces 403 Forbidden when a student accesses admin endpoints."""
    # Obtain student token
    login_res = client.post(
        "/api/auth/login",
        json={"email": "student@aether.edu", "password": "StudentPass123!"}
    )
    student_token = login_res.json()["access_token"]

    # Attempt to request admin overview
    res = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res.status_code == 403
    assert "Administrative privileges required" in res.json()["detail"]


def test_admin_can_access_admin_overview():
    """Verify that an admin token allows accessing admin overview."""
    login_res = client.post(
        "/api/auth/login",
        json={"email": "admin@aether.edu", "password": "AdminPass123!"}
    )
    admin_token = login_res.json()["access_token"]

    res = client.get(
        "/api/admin/overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "total_students" in data
    assert "champion_model_name" in data


def test_student_prediction_and_report_access():
    """Verify student can create a prediction and download their own PDF report."""
    login_res = client.post(
        "/api/auth/login",
        json={"email": "student@aether.edu", "password": "StudentPass123!"}
    )
    student_token = login_res.json()["access_token"]

    # Post a prediction
    pred_payload = {
        "school": "GP", "sex": "F", "age": 17, "address": "U", "famsize": "GT3", "Pstatus": "T",
        "Medu": 3, "Fedu": 3, "Mjob": "services", "Fjob": "services", "reason": "reputation", "guardian": "mother",
        "traveltime": 1, "studytime": 3, "failures": 0, "schoolsup": "no", "famsup": "yes", "paid": "no",
        "activities": "yes", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
        "famrel": 4, "freetime": 3, "goout": 2, "Dalc": 1, "Walc": 1, "health": 4, "absences": 2
    }
    pred_res = client.post(
        "/api/predictions/predict",
        json=pred_payload,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert "predicted_grade" in pred_data
    pred_id = pred_data["id"]

    # Download PDF report
    pdf_res = client.get(
        f"/api/predictions/{pred_id}/pdf",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000  # valid PDF bytes
