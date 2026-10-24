"""
model.py
--------
Trains Linear Regression, Decision Tree, and Random Forest models.
Evaluates each and selects the best one based on RMSE.
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def train_and_evaluate(X_train, X_test, y_train, y_test, preprocessor):
    """
    Train three regression models and evaluate them on the test set.

    Args:
        X_train, X_test: Feature DataFrames (raw, before preprocessing).
        y_train, y_test: Target Series.
        preprocessor: A fitted or unfitted ColumnTransformer.

    Returns:
        results (dict): {model_name: {"MAE": ..., "RMSE": ..., "R2": ...}}
        pipelines (dict): {model_name: fitted Pipeline}
    """
    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
    }

    results = {}
    pipelines = {}

    for name, model in models.items():
        # Create a pipeline: preprocessor -> model
        pipe = Pipeline([
            ("preprocessor", preprocessor),
            ("model", model),
        ])

        # Fit on training data
        pipe.fit(X_train, y_train)

        # Predict on test data
        y_pred = pipe.predict(X_test)

        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        results[name] = {"MAE": mae, "RMSE": rmse, "R2": r2}
        pipelines[name] = pipe

    return results, pipelines


def get_best_model(results):
    """
    Return the name of the model with the lowest RMSE.
    """
    best_name = min(results, key=lambda k: results[k]["RMSE"])
    return best_name
