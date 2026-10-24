"""
visualization.py
-----------------
Creates and saves EDA charts for the Student Performance dataset.
"""

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for saving plots

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np


def plot_grade_distribution(grades, save_path):
    """Bar chart showing the distribution of final grades (G3)."""
    fig, ax = plt.subplots(figsize=(10, 5))
    counts = grades.value_counts().sort_index()
    ax.bar(counts.index, counts.values, color="#4C72B0", edgecolor="white")
    ax.set_xlabel("Final Grade (G3)", fontsize=12)
    ax.set_ylabel("Number of Students", fontsize=12)
    ax.set_title("Distribution of Final Grades (G3)", fontsize=14, fontweight="bold")
    ax.set_xticks(range(0, 21))
    plt.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)
    print(f"  Saved: {save_path}")


def plot_studytime_vs_grade(df, save_path):
    """Box plot of study time vs final grade."""
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.boxplot(x="studytime", y="G3", data=df, hue="studytime", palette="Blues", legend=False, ax=ax)
    ax.set_xlabel("Weekly Study Time (1=low, 4=high)", fontsize=12)
    ax.set_ylabel("Final Grade (G3)", fontsize=12)
    ax.set_title("Study Time vs Final Grade", fontsize=14, fontweight="bold")
    plt.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)
    print(f"  Saved: {save_path}")


def plot_absences_vs_grade(df, save_path):
    """Scatter plot of absences vs final grade."""
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.scatter(df["absences"], df["G3"], alpha=0.5, color="#DD8452", edgecolors="white", s=50)
    ax.set_xlabel("Number of Absences", fontsize=12)
    ax.set_ylabel("Final Grade (G3)", fontsize=12)
    ax.set_title("Absences vs Final Grade", fontsize=14, fontweight="bold")
    plt.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)
    print(f"  Saved: {save_path}")


def plot_correlation_heatmap(df, save_path):
    """Heatmap of correlations among numeric columns."""
    numeric_df = df.select_dtypes(include=[np.number])
    corr = numeric_df.corr()

    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0,
                square=True, linewidths=0.5, ax=ax, cbar_kws={"shrink": 0.8})
    ax.set_title("Correlation Heatmap (Numeric Features)", fontsize=14, fontweight="bold")
    plt.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)
    print(f"  Saved: {save_path}")


def plot_model_comparison(results, save_path):
    """Grouped bar chart comparing MAE, RMSE, and R2 across models."""
    model_names = list(results.keys())
    mae_vals = [results[m]["MAE"] for m in model_names]
    rmse_vals = [results[m]["RMSE"] for m in model_names]
    r2_vals = [results[m]["R2"] for m in model_names]

    x = np.arange(len(model_names))
    width = 0.25

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.bar(x - width, mae_vals, width, label="MAE", color="#4C72B0")
    ax.bar(x, rmse_vals, width, label="RMSE", color="#DD8452")
    ax.bar(x + width, r2_vals, width, label="R\u00b2", color="#55A868")

    ax.set_xlabel("Model", fontsize=12)
    ax.set_ylabel("Score", fontsize=12)
    ax.set_title("Model Comparison", fontsize=14, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels(model_names, fontsize=10)
    ax.legend(fontsize=11)
    plt.tight_layout()
    fig.savefig(save_path, dpi=150)
    plt.close(fig)
    print(f"  Saved: {save_path}")
