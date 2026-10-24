"""
config.py
---------
Configuration parameters for AETHER Backend.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Security & Tokens
SECRET_KEY = os.getenv("AETHER_SECRET_KEY", "aether_super_secret_jwt_key_2026_student_intelligence")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'aether.db'}")

# Paths to ML Artifacts & Data
MODEL_PATH = BASE_DIR / "models" / "best_model.joblib"
ALL_MODELS_PATH = BASE_DIR / "models" / "all_models.joblib"
RESULTS_PATH = BASE_DIR / "models" / "results.json"
FEATURE_IMP_PATH = BASE_DIR / "models" / "feature_importance.json"
DATASET_PATH = BASE_DIR / "data" / "student-mat.csv"
