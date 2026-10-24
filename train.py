"""
train.py
--------
Main training script for the Student Performance Prediction System.

Usage:
    python train.py

This script:
    1. Loads and preprocesses the UCI Student Performance dataset (student-mat.csv).
    2. Generates EDA visualizations and saves them to outputs/.
    3. Trains Linear Regression, Decision Tree, and Random Forest models.
    4. Evaluates each model using MAE, RMSE, and R2.
    5. Saves the best model (lowest RMSE) to models/best_model.joblib.
"""

import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split

from src.data_preprocess import load_and_preprocess
from src.model import train_and_evaluate, get_best_model
from src.visualization import (
    plot_grade_distribution,
    plot_studytime_vs_grade,
    plot_absences_vs_grade,
    plot_correlation_heatmap,
    plot_model_comparison,
)


def main():
    print("=" * 60)
    print("  Student Performance Prediction System")
    print("=" * 60)

    # --- Paths ---
    data_path = os.path.join("data", "student-mat.csv")
    outputs_dir = "outputs"
    models_dir = "models"
    os.makedirs(outputs_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)

    # --- Step 1: Load & Preprocess ---
    print("\n[Step 1] Loading and preprocessing data...")
    if not os.path.exists(data_path):
        print(f"  ERROR: Dataset not found at '{data_path}'.")
        print("  Please download student-mat.csv from:")
        print("  https://archive.ics.uci.edu/dataset/320/student+performance")
        print("  and place it in the data/ folder.")
        return

    X, y, preprocessor = load_and_preprocess(data_path)

    # --- Step 2: Basic EDA ---
    print("\n[Step 2] Generating EDA visualizations...")
    df_raw = pd.read_csv(data_path, sep=";")

    # Show basic stats
    print(f"  Dataset shape: {df_raw.shape}")
    print(f"  Data types:\n{df_raw.dtypes.value_counts().to_string()}")
    print(f"  G3 statistics:\n{df_raw['G3'].describe().to_string()}")

    plot_grade_distribution(df_raw["G3"], os.path.join(outputs_dir, "grade_distribution.png"))
    plot_studytime_vs_grade(df_raw, os.path.join(outputs_dir, "studytime_vs_grade.png"))
    plot_absences_vs_grade(df_raw, os.path.join(outputs_dir, "absences_vs_grade.png"))
    plot_correlation_heatmap(df_raw, os.path.join(outputs_dir, "correlation_heatmap.png"))

    # --- Step 3: Train-Test Split ---
    print("\n[Step 3] Splitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"  Training samples: {len(X_train)}")
    print(f"  Testing samples:  {len(X_test)}")

    # --- Step 4: Train & Evaluate Models ---
    print("\n[Step 4] Training and evaluating models...")
    results, pipelines = train_and_evaluate(X_train, X_test, y_train, y_test, preprocessor)

    print("\n  Model Performance Summary:")
    print("  " + "-" * 56)
    print(f"  {'Model':<22} {'MAE':>8} {'RMSE':>8} {'R2':>8}")
    print("  " + "-" * 56)
    for name, metrics in results.items():
        print(f"  {name:<22} {metrics['MAE']:>8.3f} {metrics['RMSE']:>8.3f} {metrics['R2']:>8.3f}")
    print("  " + "-" * 56)

    # Save comparison chart
    plot_model_comparison(results, os.path.join(outputs_dir, "model_comparison.png"))

    # --- Step 5: Save Best Model ---
    best_name = get_best_model(results)
    best_pipeline = pipelines[best_name]

    print(f"\n[Step 5] Best model: {best_name} (lowest RMSE: {results[best_name]['RMSE']:.3f})")

    model_path = os.path.join(models_dir, "best_model.joblib")
    joblib.dump(best_pipeline, model_path)
    print(f"  Saved model to: {model_path}")

    # Also save all model pipelines for Model Lab exploration
    all_models_path = os.path.join(models_dir, "all_models.joblib")
    joblib.dump(pipelines, all_models_path)
    print(f"  Saved all models to: {all_models_path}")

    # Save results as JSON for the Streamlit app
    results_path = os.path.join(models_dir, "results.json")
    serializable_results = {
        name: {k: round(v, 4) for k, v in metrics.items()}
        for name, metrics in results.items()
    }
    serializable_results["best_model"] = best_name
    with open(results_path, "w") as f:
        json.dump(serializable_results, f, indent=2)
    print(f"  Saved results to: {results_path}")

    # Save feature importances of best model if supported
    try:
        prep = best_pipeline.named_steps["preprocessor"]
        model_obj = best_pipeline.named_steps["model"]
        if hasattr(model_obj, "feature_importances_"):
            raw_feature_names = prep.get_feature_names_out()
            importances = model_obj.feature_importances_
            feat_imp = [
                {"feature": str(name), "importance": float(imp)}
                for name, imp in sorted(zip(raw_feature_names, importances), key=lambda x: x[1], reverse=True)
            ]
            feat_path = os.path.join(models_dir, "feature_importance.json")
            with open(feat_path, "w") as f:
                json.dump(feat_imp, f, indent=2)
            print(f"  Saved feature importances to: {feat_path}")
    except Exception as e:
        print(f"  Notice: Could not extract feature importance: {e}")

    print("\n" + "=" * 60)
    print("  Training complete! Run the app with:")
    print("    streamlit run app.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
