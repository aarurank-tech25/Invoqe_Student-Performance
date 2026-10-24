"""
data_preprocess.py
------------------
Handles loading, cleaning, and preprocessing the UCI Student Performance dataset.
"""

import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline


def load_and_preprocess(csv_path):
    """
    Load the Student Performance dataset and return features, target,
    and a preprocessing pipeline.

    Steps:
        1. Read CSV with ';' separator.
        2. Drop duplicate rows.
        3. Check for missing values.
        4. Separate target (G3) and drop G1, G2 to avoid data leakage.
        5. Build a ColumnTransformer for encoding and scaling.

    Returns:
        X (DataFrame): Feature columns.
        y (Series): Target column (G3).
        preprocessor (ColumnTransformer): Fitted preprocessing transformer.
    """
    # 1. Load data
    df = pd.read_csv(csv_path, sep=";")

    # 2. Drop duplicates
    before = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    after = len(df)
    if before != after:
        print(f"  Removed {before - after} duplicate rows.")

    # 3. Check missing values
    missing = df.isnull().sum().sum()
    if missing > 0:
        print(f"  Warning: {missing} missing values found. Dropping rows with NaN.")
        df = df.dropna().reset_index(drop=True)
    else:
        print("  No missing values found.")

    # 4. Separate target and features (drop G1, G2 to prevent leakage)
    y = df["G3"]
    X = df.drop(columns=["G3", "G1", "G2"])

    # 5. Identify column types
    categorical_cols = X.select_dtypes(include=["object"]).columns.tolist()
    numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()

    print(f"  Features: {len(X.columns)} ({len(categorical_cols)} categorical, {len(numeric_cols)} numeric)")
    print(f"  Target: G3 (final grade)")
    print(f"  Samples: {len(X)}")

    # 6. Build preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
            ("num", StandardScaler(), numeric_cols),
        ]
    )

    return X, y, preprocessor
