"""
test_ml.py
----------
Unit tests verifying ML pipeline inference, zero-leakage enforcement,
and confidence interval calculations.
"""

import pytest
from backend.ml_service import predict_student_performance, EXPECTED_FEATURES


def test_prediction_output_range():
    """Verify that a valid feature vector produces a clamped grade between 0 and 20."""
    valid_features = {
        "school": "GP", "sex": "F", "age": 17, "address": "U", "famsize": "GT3", "Pstatus": "T",
        "Medu": 2, "Fedu": 2, "Mjob": "other", "Fjob": "other", "reason": "course", "guardian": "mother",
        "traveltime": 1, "studytime": 2, "failures": 0, "schoolsup": "no", "famsup": "yes", "paid": "no",
        "activities": "no", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
        "famrel": 4, "freetime": 3, "goout": 3, "Dalc": 1, "Walc": 1, "health": 3, "absences": 4
    }

    grade, low, high, category, recs = predict_student_performance(valid_features)
    assert 0.0 <= grade <= 20.0
    assert 0.0 <= low <= grade
    assert grade <= high <= 20.0
    assert category in ["Distinction / Excellent", "Good Performance", "Satisfactory / Passing", "At Risk / Intervention Advised"]
    assert isinstance(recs, list)
    assert len(recs) > 0


def test_zero_leakage_enforcement():
    """Verify that attempting to include G1 or G2 raises a strict ValueError."""
    leakage_features = {
        "school": "GP", "sex": "F", "age": 17, "address": "U", "famsize": "GT3", "Pstatus": "T",
        "Medu": 2, "Fedu": 2, "Mjob": "other", "Fjob": "other", "reason": "course", "guardian": "mother",
        "traveltime": 1, "studytime": 2, "failures": 0, "schoolsup": "no", "famsup": "yes", "paid": "no",
        "activities": "no", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
        "famrel": 4, "freetime": 3, "goout": 3, "Dalc": 1, "Walc": 1, "health": 3, "absences": 4,
        "G1": 14,  # LEAKAGE
    }
    with pytest.raises(ValueError) as excinfo:
        predict_student_performance(leakage_features)
    assert "Data Leakage Violation" in str(excinfo.value)


def test_missing_required_feature():
    """Verify that omitting a mandatory feature triggers a validation error."""
    incomplete_features = {
        "school": "GP", "sex": "F", "age": 17,
    }
    with pytest.raises(ValueError):
        predict_student_performance(incomplete_features)
