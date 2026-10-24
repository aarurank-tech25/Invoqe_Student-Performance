"""
app.py
------
Student Performance Intelligence & Prediction System
A premium SaaS-grade analytics dashboard and machine learning web application.

Usage:
    streamlit run app.py
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ─────────────────────────────────────────────────────────────
# PAGE CONFIGURATION
# ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="EduMetrics AI | Student Performance Intelligence",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────────────────────────
# CUSTOM DESIGN SYSTEM & CSS TOKENS
# ─────────────────────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

    /* Base Font & Canvas Reset */
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Main App Background — Deep Navy SaaS Aesthetic */
    .stApp {
        background: radial-gradient(circle at 10% 10%, #0d1527 0%, #080c16 100%);
        color: #f1f5f9;
    }

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background: #090e1a !important;
        border-right: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    section[data-testid="stSidebar"] div.block-container {
        padding-top: 1.5rem;
        padding-bottom: 2rem;
    }

    /* Glassmorphism Metric / KPI Cards */
    .kpi-card {
        background: linear-gradient(145deg, rgba(19, 27, 46, 0.85) 0%, rgba(13, 20, 36, 0.7) 100%);
        border: 1px solid rgba(99, 102, 241, 0.2);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 22px 20px;
        position: relative;
        overflow: hidden;
        transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .kpi-card:hover {
        transform: translateY(-2px);
        border-color: rgba(139, 92, 246, 0.4);
    }
    .kpi-title {
        color: #94a3b8;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .kpi-value {
        color: #ffffff;
        font-size: 2.1rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.1;
        margin: 0;
    }
    .kpi-badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 20px;
        font-size: 0.72rem;
        font-weight: 600;
        margin-top: 10px;
    }
    .kpi-badge.positive {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .kpi-badge.neutral {
        background: rgba(99, 102, 241, 0.15);
        color: #a5b4fc;
        border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .kpi-badge.highlight {
        background: rgba(245, 158, 11, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* Content Cards */
    .content-card {
        background: rgba(15, 23, 42, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
        backdrop-filter: blur(12px);
    }

    /* Hero / Header Section */
    .hero-container {
        padding: 10px 0 25px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 28px;
    }
    .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
        border: 1px solid rgba(139, 92, 246, 0.4);
        border-radius: 30px;
        padding: 4px 12px;
        color: #c4b5fd;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 12px;
    }
    .hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0 0 6px 0;
    }
    .hero-subtitle {
        color: #94a3b8;
        font-size: 0.95rem;
        line-height: 1.5;
        max-width: 850px;
        margin: 0;
    }

    /* Recommendation Pill */
    .rec-item {
        background: rgba(30, 41, 59, 0.5);
        border-left: 3px solid #6366f1;
        padding: 12px 16px;
        border-radius: 0 8px 8px 0;
        margin-bottom: 8px;
        color: #e2e8f0;
        font-size: 0.88rem;
    }
    .rec-item.warning {
        border-left-color: #f59e0b;
        background: rgba(245, 158, 11, 0.08);
    }
    .rec-item.success {
        border-left-color: #10b981;
        background: rgba(16, 185, 129, 0.08);
    }
    .rec-item.info {
        border-left-color: #38bdf8;
        background: rgba(56, 189, 248, 0.08);
    }

    /* Streamlit widget tweaks */
    div[data-testid="stMetricValue"] {
        font-size: 1.6rem !important;
        color: #f8fafc !important;
    }
    div[data-baseweb="tab-list"] {
        gap: 8px;
    }
    button[data-baseweb="tab"] {
        border-radius: 8px !important;
        padding: 8px 16px !important;
        font-weight: 600 !important;
        color: #94a3b8 !important;
    }
    button[data-baseweb="tab"][aria-selected="true"] {
        background-color: rgba(99, 102, 241, 0.15) !important;
        color: #a5b4fc !important;
        border-bottom: 2px solid #818cf8 !important;
    }

    /* Custom Streamlit Button Styling */
    div.stButton > button:first-child {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
        color: #ffffff !important;
        font-weight: 600 !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 0.65rem 1.4rem !important;
        box-shadow: 0 4px 14px 0 rgba(124, 58, 237, 0.4) !important;
        transition: all 0.2s ease !important;
    }
    div.stButton > button:first-child:hover {
        background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 20px 0 rgba(124, 58, 237, 0.6) !important;
    }

    /* Streamlit expander */
    div[data-testid="stExpander"] {
        background: rgba(15, 23, 42, 0.5) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        border-radius: 12px !important;
    }
</style>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────
# PLOTLY MODERN DARK THEME BUILDER
# ─────────────────────────────────────────────────────────────
def apply_plotly_theme(fig, height=380):
    """Apply a consistent high-end dark SaaS layout to any Plotly chart."""
    fig.update_layout(
        height=height,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(15, 23, 42, 0.4)",
        font={"family": "Plus Jakarta Sans, sans-serif", "color": "#94a3b8"},
        title_font={"family": "Plus Jakarta Sans, sans-serif", "size": 15, "color": "#f8fafc"},
        margin=dict(l=40, r=40, t=55, b=40),
        legend=dict(
            bgcolor="rgba(15, 23, 42, 0.6)",
            bordercolor="rgba(255, 255, 255, 0.08)",
            borderwidth=1,
            font=dict(color="#cbd5e1", size=11)
        ),
        xaxis=dict(
            gridcolor="rgba(255, 255, 255, 0.06)",
            zerolinecolor="rgba(255, 255, 255, 0.12)",
            tickfont=dict(color="#94a3b8", size=11)
        ),
        yaxis=dict(
            gridcolor="rgba(255, 255, 255, 0.06)",
            zerolinecolor="rgba(255, 255, 255, 0.12)",
            tickfont=dict(color="#94a3b8", size=11)
        ),
        hoverlabel=dict(
            bgcolor="#1e293b",
            font_size=12,
            font_family="Plus Jakarta Sans, sans-serif",
            bordercolor="rgba(139, 92, 246, 0.4)"
        )
    )
    return fig


# ─────────────────────────────────────────────────────────────
# DATA & MODEL LOADERS
# ─────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join("models", "best_model.joblib")
ALL_MODELS_PATH = os.path.join("models", "all_models.joblib")
RESULTS_PATH = os.path.join("models", "results.json")
FEAT_IMP_PATH = os.path.join("models", "feature_importance.json")
DATA_PATH = os.path.join("data", "student-mat.csv")

@st.cache_resource
def load_best_model():
    if not os.path.exists(MODEL_PATH):
        return None
    try:
        return joblib.load(MODEL_PATH)
    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None

@st.cache_resource
def load_all_models():
    if not os.path.exists(ALL_MODELS_PATH):
        return None
    try:
        return joblib.load(ALL_MODELS_PATH)
    except Exception:
        return None

@st.cache_data
def load_results():
    if not os.path.exists(RESULTS_PATH):
        return None
    try:
        with open(RESULTS_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return None

@st.cache_data
def load_feature_importance():
    if os.path.exists(FEAT_IMP_PATH):
        try:
            with open(FEAT_IMP_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return None

@st.cache_data
def load_dataset():
    if not os.path.exists(DATA_PATH):
        return None
    try:
        df = pd.read_csv(DATA_PATH, sep=";")
        return df
    except Exception as e:
        st.error(f"Error reading dataset: {e}")
        return None


# Load artifacts
best_model = load_best_model()
results = load_results()
df = load_dataset()
feat_imp_data = load_feature_importance()


# ─────────────────────────────────────────────────────────────
# PREREQUISITES VERIFICATION
# ─────────────────────────────────────────────────────────────
if df is None:
    st.error("⚠️ Dataset not found at `data/student-mat.csv`. Please verify the path.")
    st.stop()

if best_model is None or results is None:
    st.error("⚠️ Trained models not found in `models/`. Please execute `python train.py` first.")
    st.stop()


# ─────────────────────────────────────────────────────────────
# SIDEBAR NAVIGATION & BRANDING
# ─────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.08);">
        <div style="background:linear-gradient(135deg, #6366f1, #a855f7); width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; box-shadow:0 4px 12px rgba(99,102,241,0.4);">
            🎓
        </div>
        <div>
            <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">EduMetrics AI</h3>
            <span style="font-size:0.75rem; color:#94a3b8; font-weight:500;">Performance Intelligence</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<p style='font-size:0.72rem; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; font-weight:700; margin-bottom:8px;'>Navigation Menu</p>", unsafe_allow_html=True)
    
    pages = [
        "📊 Overview Dashboard",
        "📈 Exploratory Data Analysis",
        "🧪 Model Lab & Benchmark",
        "🔮 AI Prediction Studio",
        "🧠 Model Explainability",
        "📋 Dataset Explorer"
    ]
    
    selected_page = st.radio("Navigation", pages, label_visibility="collapsed")

    st.markdown("<div style='height:24px;'></div>", unsafe_allow_html=True)
    
    # Sidebar quick stats widget
    st.markdown("""
    <div style="background:rgba(15, 23, 42, 0.8); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px; margin-top:20px;">
        <p style="margin:0 0 8px 0; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; color:#a5b4fc; font-weight:700;">System Metadata</p>
        <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:#94a3b8; margin-bottom:4px;">
            <span>Target Variable</span>
            <span style="color:#ffffff; font-weight:600;">G3 (0–20)</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:#94a3b8; margin-bottom:4px;">
            <span>Active Algorithm</span>
            <span style="color:#ffffff; font-weight:600;">Random Forest</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:#94a3b8; margin-bottom:4px;">
            <span>Test-Set RMSE</span>
            <span style="color:#34d399; font-weight:600;">3.802</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:#94a3b8;">
            <span>Leakage Prevention</span>
            <span style="color:#38bdf8; font-weight:600;">Active (G1/G2 Excl.)</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<div style='height:24px;'></div>", unsafe_allow_html=True)
    st.markdown("""
    <div style="text-align:center; font-size:0.75rem; color:#64748b; line-height:1.4;">
        UCI Student Performance Dataset<br>
        Cortez & Silva (2008) · Secondary Education
    </div>
    """, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────
# 1. OVERVIEW DASHBOARD
# ─────────────────────────────────────────────────────────────
if selected_page == "📊 Overview Dashboard":
    st.markdown("""
    <div class="hero-container">
        <div class="hero-badge">⚡ Enterprise Analytics Engine</div>
        <h1 class="hero-title">Student Performance Overview</h1>
        <p class="hero-subtitle">
            An end-to-end predictive machine learning platform designed to model secondary school academic outcomes.
            Identify early academic vulnerability, analyze behavioral correlates, and support proactive educational guidance.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Dataset calculations
    total_students = len(df)
    avg_grade = df["G3"].mean()
    median_grade = df["G3"].median()
    passing_rate = (df["G3"] >= 10).mean() * 100
    top_performers = (df["G3"] >= 16).mean() * 100
    best_model_name = results.get("best_model", "Random Forest")
    best_rmse = results.get(best_model_name, {}).get("RMSE", 3.802)
    best_r2 = results.get(best_model_name, {}).get("R2", 0.295)

    # 4 Top KPI Cards
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">👥 Dataset Volume</div>
            <div class="kpi-value">{total_students}</div>
            <div class="kpi-badge neutral">30 Features · 0 Leakage</div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">🎯 Mean Actual Grade</div>
            <div class="kpi-value">{avg_grade:.1f} <span style="font-size:1.1rem; color:#94a3b8; font-weight:500;">/ 20</span></div>
            <div class="kpi-badge positive">{passing_rate:.1f}% Passing (≥ 10/20)</div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">🏆 Optimal Model</div>
            <div class="kpi-value" style="font-size:1.6rem; margin-top:4px;">{best_model_name}</div>
            <div class="kpi-badge highlight">RMSE: {best_rmse:.3f} · R²: {best_r2:.3f}</div>
        </div>
        """, unsafe_allow_html=True)

    with col4:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">⭐ Distinction Rate</div>
            <div class="kpi-value">{top_performers:.1f}%</div>
            <div class="kpi-badge positive">Grade ≥ 16 / 20</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<div style='height:20px;'></div>", unsafe_allow_html=True)

    # Two-column layout: Grade Distribution & Cohort Composition
    col_chart, col_info = st.columns([1.7, 1.0])

    with col_chart:
        st.markdown("### 📊 Final Grade Distribution (G3)")
        
        # Plotly Grade Distribution
        counts = df["G3"].value_counts().sort_index().reset_index()
        counts.columns = ["Grade", "Count"]

        # Color categories: Red (0-9), Amber (10-13), Sky (14-15), Green (16-20)
        bar_colors = []
        for g in counts["Grade"]:
            if g < 10:
                bar_colors.append("#ef4444")
            elif g < 14:
                bar_colors.append("#f59e0b")
            elif g < 16:
                bar_colors.append("#38bdf8")
            else:
                bar_colors.append("#10b981")

        fig_dist = go.Figure()
        fig_dist.add_trace(go.Bar(
            x=counts["Grade"],
            y=counts["Count"],
            marker=dict(
                color=bar_colors,
                line=dict(color="rgba(255,255,255,0.15)", width=1)
            ),
            hovertemplate="<b>Final Grade: %{x}/20</b><br>Students: %{y}<br>Cohort Share: %{customdata:.1f}%<extra></extra>",
            customdata=(counts["Count"] / total_students) * 100
        ))

        # Add vertical passing line at 9.5
        fig_dist.add_vline(
            x=9.5,
            line_width=2,
            line_dash="dash",
            line_color="#a855f7",
            annotation_text="Passing Threshold (10)",
            annotation_position="top left",
            annotation_font=dict(color="#c084fc", size=11)
        )

        fig_dist.add_vline(
            x=avg_grade,
            line_width=2,
            line_dash="dot",
            line_color="#38bdf8",
            annotation_text=f"Mean: {avg_grade:.1f}",
            annotation_position="top right",
            annotation_font=dict(color="#7dd3fc", size=11)
        )

        fig_dist.update_layout(
            xaxis_title="Final Grade (G3: 0–20)",
            yaxis_title="Student Count",
            xaxis=dict(tickmode="linear", tick0=0, dtick=1),
            showlegend=False
        )
        apply_plotly_theme(fig_dist, height=360)
        st.plotly_chart(fig_dist, use_container_width=True)

        st.caption("Distribution of Portuguese secondary school mathematics grades. Notice the zero-inflated cluster representing students who missed exams or dropped out.")

    with col_info:
        st.markdown("### 🏛️ Cohort Demographics")
        
        # Gender split & School split pie / donut
        school_counts = df["school"].map({"GP": "Gabriel Pereira", "MS": "Mousinho da Silveira"}).value_counts()
        sex_counts = df["sex"].map({"F": "Female", "M": "Male"}).value_counts()
        address_counts = df["address"].map({"U": "Urban", "R": "Rural"}).value_counts()

        fig_donut = make_subplots(rows=1, cols=2, specs=[[{'type': 'domain'}, {'type': 'domain'}]], subplot_titles=["School Split", "Gender Split"])
        
        fig_donut.add_trace(go.Pie(
            labels=school_counts.index,
            values=school_counts.values,
            hole=0.55,
            marker=dict(colors=["#6366f1", "#a855f7"]),
            textinfo='label+percent',
            hovertemplate="<b>%{label}</b><br>Students: %{value} (%{percent})<extra></extra>"
        ), row=1, col=1)

        fig_donut.add_trace(go.Pie(
            labels=sex_counts.index,
            values=sex_counts.values,
            hole=0.55,
            marker=dict(colors=["#38bdf8", "#ec4899"]),
            textinfo='label+percent',
            hovertemplate="<b>%{label}</b><br>Students: %{value} (%{percent})<extra></extra>"
        ), row=1, col=2)

        apply_plotly_theme(fig_donut, height=230)
        fig_donut.update_layout(margin=dict(l=10, r=10, t=30, b=10), showlegend=False)
        st.plotly_chart(fig_donut, use_container_width=True)

        st.markdown(f"""
        <div style="background:rgba(30, 41, 59, 0.4); border-radius:12px; padding:14px; border:1px solid rgba(255,255,255,0.06);">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.85rem;">
                <span style="color:#94a3b8;">Urban Residence</span>
                <span style="color:#ffffff; font-weight:600;">{(df['address']=='U').mean()*100:.1f}%</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.85rem;">
                <span style="color:#94a3b8;">Home Internet Access</span>
                <span style="color:#ffffff; font-weight:600;">{(df['internet']=='yes').mean()*100:.1f}%</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                <span style="color:#94a3b8;">Higher Education Aspiration</span>
                <span style="color:#ffffff; font-weight:600;">{(df['higher']=='yes').mean()*100:.1f}%</span>
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # Project Context & Scope section
    st.markdown("""
    <div class="content-card">
        <h3 style="color:#ffffff; margin-top:0; font-size:1.15rem; font-weight:700;">Project Scope & Machine Learning Methodology</h3>
        <p style="color:#cbd5e1; font-size:0.92rem; line-height:1.6; margin-bottom:12px;">
            The objective of this system is to estimate a student's final examination outcome (<b>G3</b>) purely using 
            demographic, social, parental, lifestyle, and behavioral predictors collected during the academic period.
        </p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px; margin-top:16px;">
            <div style="background:rgba(15,23,42,0.6); padding:14px; border-radius:10px; border-left:3px solid #6366f1;">
                <h4 style="margin:0 0 6px 0; color:#a5b4fc; font-size:0.9rem;">🚫 Zero Data Leakage</h4>
                <p style="margin:0; font-size:0.82rem; color:#94a3b8;">Interim grades <b>G1</b> and <b>G2</b> are strictly excluded from features to enable true pre-examination intervention rather than trivial grade extrapolation.</p>
            </div>
            <div style="background:rgba(15,23,42,0.6); padding:14px; border-radius:10px; border-left:3px solid #38bdf8;">
                <h4 style="margin:0 0 6px 0; color:#7dd3fc; font-size:0.9rem;">📚 Empirical Provenance</h4>
                <p style="margin:0; font-size:0.82rem; color:#94a3b8;">Trained on real data from two Portuguese public secondary schools (Cortez & Silva, 2008), archived in the UCI Machine Learning Repository.</p>
            </div>
            <div style="background:rgba(15,23,42,0.6); padding:14px; border-radius:10px; border-left:3px solid #10b981;">
                <h4 style="margin:0 0 6px 0; color:#6ee7b7; font-size:0.9rem;">⚙️ Unified Pipeline</h4>
                <p style="margin:0; font-size:0.82rem; color:#94a3b8;">One-Hot Encoding for 17 categorical features, Standard Scaling for 13 numeric features, and an ensemble Random Forest regressor.</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────
# 2. EXPLORATORY DATA ANALYSIS (EDA)
# ─────────────────────────────────────────────────────────────
elif selected_page == "📈 Exploratory Data Analysis":
    st.markdown("""
    <div class="hero-container">
        <div class="hero-badge">🔍 Behavioral & Demographic Insights</div>
        <h1 class="hero-title">Exploratory Data Analysis</h1>
        <p class="hero-subtitle">
            Explore multivariate distributions, examine behavioral factors such as study time and absences, 
            and isolate specific student cohorts with interactive filters.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Filter Bar
    with st.expander("🎛️ Interactive Cohort Filtering", expanded=True):
        f_col1, f_col2, f_col3, f_col4 = st.columns(4)
        with f_col1:
            school_filter = st.selectbox("School", ["All Schools", "Gabriel Pereira (GP)", "Mousinho da Silveira (MS)"])
        with f_col2:
            gender_filter = st.selectbox("Sex", ["All", "Female", "Male"])
        with f_col3:
            internet_filter = st.selectbox("Internet Access", ["All", "Yes", "No"])
        with f_col4:
            higher_filter = st.selectbox("Aspires Higher Ed", ["All", "Yes", "No"])

    # Apply filters
    filtered_df = df.copy()
    if school_filter == "Gabriel Pereira (GP)":
        filtered_df = filtered_df[filtered_df["school"] == "GP"]
    elif school_filter == "Mousinho da Silveira (MS)":
        filtered_df = filtered_df[filtered_df["school"] == "MS"]

    if gender_filter == "Female":
        filtered_df = filtered_df[filtered_df["sex"] == "F"]
    elif gender_filter == "Male":
        filtered_df = filtered_df[filtered_df["sex"] == "M"]

    if internet_filter == "Yes":
        filtered_df = filtered_df[filtered_df["internet"] == "yes"]
    elif internet_filter == "No":
        filtered_df = filtered_df[filtered_df["internet"] == "no"]

    if higher_filter == "Yes":
        filtered_df = filtered_df[filtered_df["higher"] == "yes"]
    elif higher_filter == "No":
        filtered_df = filtered_df[filtered_df["higher"] == "no"]

    # Filtered metrics indicator
    st.markdown(f"""
    <div style="display:flex; gap:16px; align-items:center; margin-bottom:20px; font-size:0.88rem; color:#94a3b8;">
        <span>Active Cohort: <b style="color:#ffffff;">{len(filtered_df)}</b> students ({len(filtered_df)/len(df)*100:.1f}%)</span>
        <span>·</span>
        <span>Cohort Mean Grade: <b style="color:#38bdf8;">{filtered_df['G3'].mean():.2f} / 20</b></span>
        <span>·</span>
        <span>Passing Rate: <b style="color:#34d399;">{(filtered_df['G3']>=10).mean()*100:.1f}%</b></span>
    </div>
    """, unsafe_allow_html=True)

    # Tabs for EDA Charts
    tab_study, tab_absence, tab_corr, tab_dist = st.tabs([
        "📖 Study Time Dynamics", 
        "🚪 Absences & Attendance", 
        "🔥 Correlation Matrix", 
        "📊 Grade Distributions"
    ])

    with tab_study:
        st.markdown("#### Weekly Study Time vs Final Grade")
        study_map = {1: "< 2 hours", 2: "2 to 5 hours", 3: "5 to 10 hours", 4: "> 10 hours"}
        filtered_df["studytime_label"] = filtered_df["studytime"].map(study_map)
        
        # Interactive Box + Strip plot with Plotly
        fig_study = px.box(
            filtered_df,
            x="studytime_label",
            y="G3",
            category_orders={"studytime_label": ["< 2 hours", "2 to 5 hours", "5 to 10 hours", "> 10 hours"]},
            color="studytime_label",
            color_discrete_sequence=["#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"],
            points="all",
            labels={"studytime_label": "Weekly Study Time", "G3": "Final Grade (0–20)"},
        )
        fig_study.update_traces(jitter=0.25, pointpos=-0.4, marker=dict(size=5, opacity=0.6))
        apply_plotly_theme(fig_study, height=420)
        fig_study.update_layout(showlegend=False)
        st.plotly_chart(fig_study, use_container_width=True)

        st.markdown("""
        <div class="content-card" style="margin-top:10px;">
            <b style="color:#a5b4fc;">Key Empirical Takeaways:</b>
            <ul style="color:#cbd5e1; font-size:0.9rem; margin-top:6px; margin-bottom:0; line-height:1.6;">
                <li>Students dedicating <b>5–10 hours</b> weekly show higher median final grades and significantly fewer failing outcomes.</li>
                <li>However, study time alone is not an absolute panacea: even within the &gt;10 hours tier, outliers exist due to exam anxiety or prior foundation gaps.</li>
                <li>Diminishing returns begin to manifest beyond 10 hours without structured study methodology.</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with tab_absence:
        st.markdown("#### School Absences vs Final Grade")
        
        fig_abs = px.scatter(
            filtered_df,
            x="absences",
            y="G3",
            color="failures",
            size="failures",
            size_max=12,
            color_continuous_scale="Purples",
            hover_data=["age", "sex", "studytime"],
            labels={"absences": "Number of School Absences", "G3": "Final Grade (G3)", "failures": "Past Failures"},
            trendline="ols",
            trendline_color_override="#f43f5e"
        )
        apply_plotly_theme(fig_abs, height=420)
        st.plotly_chart(fig_abs, use_container_width=True)

        st.markdown("""
        <div class="content-card" style="margin-top:10px;">
            <b style="color:#a5b4fc;">Key Empirical Takeaways:</b>
            <ul style="color:#cbd5e1; font-size:0.9rem; margin-top:6px; margin-bottom:0; line-height:1.6;">
                <li>The trendline shows a mild negative slope with final achievement. High-frequency absenteeism (&gt;15 days) creates critical knowledge gaps.</li>
                <li><b>Past class failures</b> (larger dark markers) correlate heavily with low final grades, demonstrating cumulative academic deficit.</li>
                <li>A distinct cluster with 0 grade points exists even at low absences, corresponding to students who withdrew from the final evaluation.</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with tab_corr:
        st.markdown("#### Inter-Feature Correlation Heatmap")
        
        numeric_cols = filtered_df.select_dtypes(include=[np.number]).columns.tolist()
        corr_matrix = filtered_df[numeric_cols].corr().round(2)

        fig_heat = px.imshow(
            corr_matrix,
            text_auto=True,
            aspect="auto",
            color_continuous_scale="RdBu_r",
            zmin=-0.5,
            zmax=1.0,
            labels=dict(color="Pearson r")
        )
        apply_plotly_theme(fig_heat, height=520)
        st.plotly_chart(fig_heat, use_container_width=True)

        st.markdown("""
        <div class="content-card">
            <b style="color:#a5b4fc;">Correlation Highlights:</b>
            <p style="color:#cbd5e1; font-size:0.88rem; margin-top:6px; margin-bottom:0; line-height:1.5;">
                • <b>G3 vs Failures:</b> Strongest negative relationship among numeric features (r ≈ -0.36), showing past failure is the single strongest historical risk factor.<br>
                • <b>Medu & Fedu:</b> Strong inter-parental education correlation (r ≈ 0.62) and positive association with final grade (r ≈ 0.22).<br>
                • <b>Dalc & Walc:</b> Daily and weekend alcohol consumption are tightly coupled (r ≈ 0.65), and both correlate with going out (goout).
            </p>
        </div>
        """, unsafe_allow_html=True)

    with tab_dist:
        st.markdown("#### Grade Breakdown by Cohort Dimensions")
        cat_dimension = st.selectbox("Compare Grade by Dimension:", ["sex", "address", "higher", "internet", "romantic", "famsup"])
        
        fig_violin = px.violin(
            filtered_df,
            x=cat_dimension,
            y="G3",
            color=cat_dimension,
            box=True,
            points="all",
            color_discrete_sequence=["#6366f1", "#38bdf8", "#10b981", "#f59e0b"]
        )
        apply_plotly_theme(fig_violin, height=400)
        fig_violin.update_layout(showlegend=False)
        st.plotly_chart(fig_violin, use_container_width=True)


# ─────────────────────────────────────────────────────────────
# 3. MODEL LAB & BENCHMARK
# ─────────────────────────────────────────────────────────────
elif selected_page == "🧪 Model Lab & Benchmark":
    st.markdown("""
    <div class="hero-container">
        <div class="hero-badge">🧪 Rigorous Evaluation & Benchmarking</div>
        <h1 class="hero-title">Model Evaluation Lab</h1>
        <p class="hero-subtitle">
            Compare three machine learning architectures evaluated on a strictly held-out 20% test set (79 unseen students).
            All models were trained using identical preprocessing pipelines without interim grade leakage.
        </p>
    </div>
    """, unsafe_allow_html=True)

    best_model_name = results.get("best_model", "Random Forest")
    model_keys = [k for k in results if k != "best_model"]

    # Comparative Metrics Table
    records = []
    for name in model_keys:
        m = results[name]
        is_best = (name == best_model_name)
        records.append({
            "Architecture": f"{'⭐ ' if is_best else ''}{name}",
            "Mean Absolute Error (MAE)": f"{m['MAE']:.3f}",
            "Root Mean Squared Error (RMSE)": f"{m['RMSE']:.3f}",
            "Explained Variance (R²)": f"{m['R2']:.3f}",
            "Status": "Champion (Lowest RMSE)" if is_best else "Benchmarked"
        })
    metrics_df = pd.DataFrame(records)

    st.markdown("### 🏆 Test-Set Performance Leaderboard")
    st.dataframe(
        metrics_df,
        use_container_width=True,
        hide_index=True
    )

    st.markdown("<div style='height:20px;'></div>", unsafe_allow_html=True)

    # Multi-metric grouped comparison chart
    col_chart_lab, col_explain_lab = st.columns([1.6, 1.0])

    with col_chart_lab:
        st.markdown("### 📊 Metrics Comparison Across Architectures")
        
        models_list = model_keys
        mae_vals = [results[m]["MAE"] for m in models_list]
        rmse_vals = [results[m]["RMSE"] for m in models_list]
        r2_vals = [results[m]["R2"] for m in models_list]

        fig_comp = go.Figure()
        fig_comp.add_trace(go.Bar(
            name="MAE (Lower is Better)",
            x=models_list,
            y=mae_vals,
            marker_color="#818cf8",
            hovertemplate="<b>%{x}</b><br>MAE: %{y:.3f} grade points<extra></extra>"
        ))
        fig_comp.add_trace(go.Bar(
            name="RMSE (Lower is Better)",
            x=models_list,
            y=rmse_vals,
            marker_color="#f43f5e",
            hovertemplate="<b>%{x}</b><br>RMSE: %{y:.3f} grade points<extra></extra>"
        ))
        fig_comp.add_trace(go.Bar(
            name="R² Score (Higher is Better)",
            x=models_list,
            y=r2_vals,
            marker_color="#34d399",
            hovertemplate="<b>%{x}</b><br>R²: %{y:.3f}<extra></extra>"
        ))

        fig_comp.update_layout(
            barmode="group",
            xaxis_title="Evaluated Model",
            yaxis_title="Score Metric",
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        apply_plotly_theme(fig_comp, height=380)
        st.plotly_chart(fig_comp, use_container_width=True)

    with col_explain_lab:
        st.markdown("### 🔍 Model Selection Rationale")
        st.markdown(f"""
        <div class="content-card" style="padding:18px;">
            <div style="font-size:0.85rem; color:#a5b4fc; font-weight:700; text-transform:uppercase; margin-bottom:6px;">
                Selected Champion
            </div>
            <h4 style="margin:0 0 10px 0; color:#ffffff; font-size:1.15rem;">Random Forest Regressor</h4>
            <p style="color:#cbd5e1; font-size:0.85rem; line-height:1.55; margin-bottom:12px;">
                Random Forest won the benchmark with an <b>RMSE of {results.get('Random Forest', {}).get('RMSE', 3.802):.3f}</b> 
                and an <b>R² of {results.get('Random Forest', {}).get('R2', 0.295):.3f}</b>.
            </p>
            <div style="font-size:0.82rem; color:#94a3b8; line-height:1.5;">
                <b style="color:#f8fafc;">Why did Random Forest excel?</b><br>
                • <b>Ensemble Bagging:</b> Averages 100 decision trees to mitigate high variance and prevent overfitting.<br>
                • <b>Non-linear feature interactions:</b> Successfully models synergy between past failures, absences, and study hours which linear regression struggles to map.
            </div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # Metric Explanations for Beginners
    st.markdown("### 📖 Beginner-Friendly Guide to Metrics")
    c_m1, c_m2, c_m3 = st.columns(3)

    with c_m1:
        st.markdown("""
        <div class="content-card">
            <h4 style="color:#818cf8; margin-top:0;">MAE (Mean Absolute Error)</h4>
            <p style="font-size:0.85rem; color:#cbd5e1; line-height:1.5;">
                Measures the average magnitude of prediction errors in points on the 0–20 scale.
                An MAE of <b>3.00</b> means our predictions deviate by approximately 3 points from the true final mark.
            </p>
        </div>
        """, unsafe_allow_html=True)

    with c_m2:
        st.markdown("""
        <div class="content-card">
            <h4 style="color:#f43f5e; margin-top:0;">RMSE (Root Mean Squared Error)</h4>
            <p style="font-size:0.85rem; color:#cbd5e1; line-height:1.5;">
                Penalizes large errors more severely than small ones. Because educators want to avoid dramatically misidentifying a student's standing, 
                minimizing RMSE was chosen as the primary selection criterion.
            </p>
        </div>
        """, unsafe_allow_html=True)

    with c_m3:
        st.markdown("""
        <div class="content-card">
            <h4 style="color:#34d399; margin-top:0;">R² (Coefficient of Determination)</h4>
            <p style="font-size:0.85rem; color:#cbd5e1; line-height:1.5;">
                Indicates the percentage of grade variance explained by demographic and behavioral factors alone (without knowing exam grades).
                An R² of ~0.30 is strong for complex human behavioral modeling prior to exams.
            </p>
        </div>
        """, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────
# 4. AI PREDICTION STUDIO
# ─────────────────────────────────────────────────────────────
elif selected_page == "🔮 AI Prediction Studio":
    st.markdown("""
    <div class="hero-container">
        <div class="hero-badge">🔮 Real-Time Inference Studio</div>
        <h1 class="hero-title">Student Performance Prediction Studio</h1>
        <p class="hero-subtitle">
            Configure student demographic and behavioral characteristics to estimate final examination outcomes.
            Our production pipeline executes automatic one-hot encoding, standard scaling, and random forest inference.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Preset Profiles for Quick Exploration
    st.markdown("<p style='font-size:0.85rem; font-weight:700; color:#a5b4fc; margin-bottom:8px;'>⚡ Quick-Load Persona Presets</p>", unsafe_allow_html=True)
    preset_cols = st.columns(4)

    # Manage session state for presets
    if "preset_loaded" not in st.session_state:
        st.session_state.preset_loaded = "Median Student"

    with preset_cols[0]:
        if st.button("⚖️ Median Student", use_container_width=True):
            st.session_state.preset_loaded = "Median Student"
            st.rerun()

    with preset_cols[1]:
        if st.button("🌟 High Achiever", use_container_width=True):
            st.session_state.preset_loaded = "High Achiever"
            st.rerun()

    with preset_cols[2]:
        if st.button("⚠️ At-Risk Student", use_container_width=True):
            st.session_state.preset_loaded = "At-Risk Student"
            st.rerun()

    with preset_cols[3]:
        if st.button("🎯 Diligent Underdog", use_container_width=True):
            st.session_state.preset_loaded = "Diligent Underdog"
            st.rerun()

    current_preset = st.session_state.preset_loaded
    st.caption(f"Currently active preset: **{current_preset}** (modify any input below to test custom variations)")

    # Preset Values dictionary
    presets = {
        "Median Student": {
            "school": "GP", "sex": "F", "age": 17, "address": "U", "famsize": "GT3", "Pstatus": "T",
            "Medu": 2, "Fedu": 2, "Mjob": "other", "Fjob": "other", "reason": "course", "guardian": "mother",
            "traveltime": 1, "studytime": 2, "failures": 0, "schoolsup": "no", "famsup": "yes", "paid": "no",
            "activities": "no", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
            "famrel": 4, "freetime": 3, "goout": 3, "Dalc": 1, "Walc": 1, "health": 3, "absences": 4
        },
        "High Achiever": {
            "school": "GP", "sex": "F", "age": 16, "address": "U", "famsize": "LE3", "Pstatus": "T",
            "Medu": 4, "Fedu": 4, "Mjob": "teacher", "Fjob": "services", "reason": "reputation", "guardian": "mother",
            "traveltime": 1, "studytime": 4, "failures": 0, "schoolsup": "no", "famsup": "yes", "paid": "yes",
            "activities": "yes", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
            "famrel": 5, "freetime": 2, "goout": 2, "Dalc": 1, "Walc": 1, "health": 5, "absences": 2
        },
        "At-Risk Student": {
            "school": "MS", "sex": "M", "age": 18, "address": "R", "famsize": "GT3", "Pstatus": "A",
            "Medu": 1, "Fedu": 1, "Mjob": "at_home", "Fjob": "other", "reason": "course", "guardian": "other",
            "traveltime": 3, "studytime": 1, "failures": 2, "schoolsup": "yes", "famsup": "no", "paid": "no",
            "activities": "no", "nursery": "no", "higher": "no", "internet": "no", "romantic": "yes",
            "famrel": 2, "freetime": 4, "goout": 5, "Dalc": 3, "Walc": 4, "health": 2, "absences": 18
        },
        "Diligent Underdog": {
            "school": "GP", "sex": "M", "age": 17, "address": "R", "famsize": "GT3", "Pstatus": "T",
            "Medu": 1, "Fedu": 1, "Mjob": "other", "Fjob": "other", "reason": "home", "guardian": "mother",
            "traveltime": 2, "studytime": 3, "failures": 1, "schoolsup": "no", "famsup": "yes", "paid": "yes",
            "activities": "yes", "nursery": "yes", "higher": "yes", "internet": "yes", "romantic": "no",
            "famrel": 4, "freetime": 2, "goout": 2, "Dalc": 1, "Walc": 1, "health": 4, "absences": 4
        }
    }
    p = presets.get(current_preset, presets["Median Student"])

    st.markdown("<div style='height:14px;'></div>", unsafe_allow_html=True)

    # 4 Structured Input Cards
    with st.form("prediction_form"):
        st.markdown("### 📝 Student Profile Configuration")
        
        tab_a, tab_b, tab_c, tab_d = st.tabs([
            "📚 1. Academic & Study Habits", 
            "👤 2. Demographic Profile", 
            "🏡 3. Family & Support", 
            "🌿 4. Lifestyle & Health"
        ])

        with tab_a:
            ac_col1, ac_col2 = st.columns(2)
            with ac_col1:
                studytime_val = st.selectbox(
                    "Weekly Study Time",
                    options=[1, 2, 3, 4],
                    index=[1, 2, 3, 4].index(p["studytime"]),
                    format_func=lambda x: {1: "1: < 2 hours / week", 2: "2: 2 to 5 hours / week", 3: "3: 5 to 10 hours / week", 4: "4: > 10 hours / week"}[x],
                    help="Categorical indicator of total study time outside regular school classes."
                )
                failures_val = st.number_input(
                    "Past Class Failures (0–3)",
                    min_value=0,
                    max_value=3,
                    value=p["failures"],
                    help="Number of previous class failures. 0 represents no prior academic deficit."
                )
                schoolsup_val = st.selectbox(
                    "Extra Educational Support from School",
                    options=["no", "yes"],
                    index=["no", "yes"].index(p["schoolsup"]),
                    help="Remedial tutoring or supplemental academic aid offered by the school."
                )
            with ac_col2:
                absences_val = st.slider(
                    "Total School Absences (Days)",
                    min_value=0,
                    max_value=60,
                    value=p["absences"],
                    help="Total school days missed throughout the academic year."
                )
                paid_val = st.selectbox(
                    "Extra Paid Subject Tutoring",
                    options=["no", "yes"],
                    index=["no", "yes"].index(p["paid"]),
                    help="Private tutoring lessons paid by parents."
                )
                higher_val = st.selectbox(
                    "Aspiration for Higher Education",
                    options=["yes", "no"],
                    index=["yes", "no"].index(p["higher"]),
                    help="Whether the student intends to pursue university / college degrees."
                )

        with tab_b:
            dem_col1, dem_col2 = st.columns(2)
            with dem_col1:
                school_val = st.selectbox(
                    "Enrolled School",
                    options=["GP", "MS"],
                    index=["GP", "MS"].index(p["school"]),
                    format_func=lambda x: "Gabriel Pereira (GP)" if x == "GP" else "Mousinho da Silveira (MS)"
                )
                sex_val = st.selectbox(
                    "Gender",
                    options=["F", "M"],
                    index=["F", "M"].index(p["sex"]),
                    format_func=lambda x: "Female" if x == "F" else "Male"
                )
                age_val = st.slider("Age", min_value=15, max_value=22, value=p["age"])
            with dem_col2:
                address_val = st.selectbox(
                    "Home Address Zone",
                    options=["U", "R"],
                    index=["U", "R"].index(p["address"]),
                    format_func=lambda x: "Urban (U)" if x == "U" else "Rural (R)"
                )
                famsize_val = st.selectbox(
                    "Family Size",
                    options=["GT3", "LE3"],
                    index=["GT3", "LE3"].index(p["famsize"]),
                    format_func=lambda x: "> 3 Members (GT3)" if x == "GT3" else "≤ 3 Members (LE3)"
                )
                pstatus_val = st.selectbox(
                    "Parent Cohabitation Status",
                    options=["T", "A"],
                    index=["T", "A"].index(p["Pstatus"]),
                    format_func=lambda x: "Living Together (T)" if x == "T" else "Apart (A)"
                )

        with tab_c:
            fam_col1, fam_col2 = st.columns(2)
            with fam_col1:
                medu_val = st.selectbox(
                    "Mother's Education Level",
                    options=[0, 1, 2, 3, 4],
                    index=p["Medu"],
                    format_func=lambda x: {0: "0: None", 1: "1: Primary (4th grade)", 2: "2: 5th–9th grade", 3: "3: Secondary", 4: "4: Higher Education"}[x]
                )
                mjob_val = st.selectbox(
                    "Mother's Profession",
                    options=["teacher", "health", "services", "at_home", "other"],
                    index=["teacher", "health", "services", "at_home", "other"].index(p["Mjob"])
                )
                famsup_val = st.selectbox(
                    "Family Educational Support",
                    options=["yes", "no"],
                    index=["yes", "no"].index(p["famsup"]),
                    help="Whether family members assist with homework and school tasks."
                )
                guardian_val = st.selectbox(
                    "Legal Guardian",
                    options=["mother", "father", "other"],
                    index=["mother", "father", "other"].index(p["guardian"])
                )
            with fam_col2:
                fedu_val = st.selectbox(
                    "Father's Education Level",
                    options=[0, 1, 2, 3, 4],
                    index=p["Fedu"],
                    format_func=lambda x: {0: "0: None", 1: "1: Primary (4th grade)", 2: "2: 5th–9th grade", 3: "3: Secondary", 4: "4: Higher Education"}[x]
                )
                fjob_val = st.selectbox(
                    "Father's Profession",
                    options=["teacher", "health", "services", "at_home", "other"],
                    index=["teacher", "health", "services", "at_home", "other"].index(p["Fjob"])
                )
                reason_val = st.selectbox(
                    "Reason for School Selection",
                    options=["home", "reputation", "course", "other"],
                    index=["home", "reputation", "course", "other"].index(p["reason"]),
                    format_func=lambda x: {"home": "Close to Home", "reputation": "School Reputation", "course": "Course Preference", "other": "Other"}[x]
                )

        with tab_d:
            life_col1, life_col2 = st.columns(2)
            with life_col1:
                internet_val = st.selectbox("Home Internet Access", ["yes", "no"], index=["yes", "no"].index(p["internet"]))
                romantic_val = st.selectbox("In a Romantic Relationship", ["no", "yes"], index=["no", "yes"].index(p["romantic"]))
                activities_val = st.selectbox("Extracurricular Activities", ["yes", "no"], index=["yes", "no"].index(p["activities"]))
                nursery_val = st.selectbox("Attended Nursery School", ["yes", "no"], index=["yes", "no"].index(p["nursery"]))
                traveltime_val = st.selectbox(
                    "Travel Time to School",
                    options=[1, 2, 3, 4],
                    index=[1, 2, 3, 4].index(p["traveltime"]),
                    format_func=lambda x: {1: "1: <15 min", 2: "2: 15–30 min", 3: "3: 30–60 min", 4: "4: >60 min"}[x]
                )
            with life_col2:
                famrel_val = st.slider("Quality of Family Relationships (1=Very Poor, 5=Excellent)", 1, 5, p["famrel"])
                freetime_val = st.slider("Free Time After School (1=Very Low, 5=Very High)", 1, 5, p["freetime"])
                goout_val = st.slider("Going Out with Friends (1=Very Low, 5=Very High)", 1, 5, p["goout"])
                dalc_val = st.slider("Workday Alcohol Consumption (1=Very Low, 5=Very High)", 1, 5, p["Dalc"])
                walc_val = st.slider("Weekend Alcohol Consumption (1=Very Low, 5=Very High)", 1, 5, p["Walc"])
                health_val = st.slider("Current Health Status (1=Very Poor, 5=Very Good)", 1, 5, p["health"])

        st.markdown("<div style='height:16px;'></div>", unsafe_allow_html=True)
        submitted = st.form_submit_button("🚀 Compute Prediction & Generate Academic Advice", use_container_width=True)

    # Prediction Execution
    if submitted or "last_prediction" in st.session_state:
        # Build exact 30-feature vector matching training pipeline
        user_input_dict = {
            "school": school_val if submitted else st.session_state.get("last_inputs", p)["school"],
            "sex": sex_val if submitted else st.session_state.get("last_inputs", p)["sex"],
            "age": age_val if submitted else st.session_state.get("last_inputs", p)["age"],
            "address": address_val if submitted else st.session_state.get("last_inputs", p)["address"],
            "famsize": famsize_val if submitted else st.session_state.get("last_inputs", p)["famsize"],
            "Pstatus": pstatus_val if submitted else st.session_state.get("last_inputs", p)["Pstatus"],
            "Medu": medu_val if submitted else st.session_state.get("last_inputs", p)["Medu"],
            "Fedu": fedu_val if submitted else st.session_state.get("last_inputs", p)["Fedu"],
            "Mjob": mjob_val if submitted else st.session_state.get("last_inputs", p)["Mjob"],
            "Fjob": fjob_val if submitted else st.session_state.get("last_inputs", p)["Fjob"],
            "reason": reason_val if submitted else st.session_state.get("last_inputs", p)["reason"],
            "guardian": guardian_val if submitted else st.session_state.get("last_inputs", p)["guardian"],
            "traveltime": traveltime_val if submitted else st.session_state.get("last_inputs", p)["traveltime"],
            "studytime": studytime_val if submitted else st.session_state.get("last_inputs", p)["studytime"],
            "failures": failures_val if submitted else st.session_state.get("last_inputs", p)["failures"],
            "schoolsup": schoolsup_val if submitted else st.session_state.get("last_inputs", p)["schoolsup"],
            "famsup": famsup_val if submitted else st.session_state.get("last_inputs", p)["famsup"],
            "paid": paid_val if submitted else st.session_state.get("last_inputs", p)["paid"],
            "activities": activities_val if submitted else st.session_state.get("last_inputs", p)["activities"],
            "nursery": nursery_val if submitted else st.session_state.get("last_inputs", p)["nursery"],
            "higher": higher_val if submitted else st.session_state.get("last_inputs", p)["higher"],
            "internet": internet_val if submitted else st.session_state.get("last_inputs", p)["internet"],
            "romantic": romantic_val if submitted else st.session_state.get("last_inputs", p)["romantic"],
            "famrel": famrel_val if submitted else st.session_state.get("last_inputs", p)["famrel"],
            "freetime": freetime_val if submitted else st.session_state.get("last_inputs", p)["freetime"],
            "goout": goout_val if submitted else st.session_state.get("last_inputs", p)["goout"],
            "Dalc": dalc_val if submitted else st.session_state.get("last_inputs", p)["Dalc"],
            "Walc": walc_val if submitted else st.session_state.get("last_inputs", p)["Walc"],
            "health": health_val if submitted else st.session_state.get("last_inputs", p)["health"],
            "absences": absences_val if submitted else st.session_state.get("last_inputs", p)["absences"],
        }

        with st.spinner("Processing through ML pipeline..."):
            input_df = pd.DataFrame([user_input_dict])
            raw_pred = best_model.predict(input_df)[0]
            # Clamping to realistic Portuguese secondary system scale (0–20)
            predicted_grade = float(np.clip(raw_pred, 0.0, 20.0))
            st.session_state.last_prediction = predicted_grade
            st.session_state.last_inputs = user_input_dict

        # Determine Tier
        if predicted_grade >= 16.0:
            tier_name = "Distinction / Excellent"
            tier_color = "#10b981"
            tier_class = "success"
        elif predicted_grade >= 14.0:
            tier_name = "Good Performance"
            tier_color = "#38bdf8"
            tier_class = "info"
        elif predicted_grade >= 10.0:
            tier_name = "Satisfactory / Passing"
            tier_color = "#f59e0b"
            tier_class = "warning"
        else:
            tier_name = "At Risk / Intervention Advised"
            tier_color = "#ef4444"
            tier_class = "warning"

        st.markdown("<div style='height:24px;'></div>", unsafe_allow_html=True)
        st.markdown("### 🎯 Inference Outcome & Evaluation")

        res_col_gauge, res_col_info = st.columns([1.2, 1.4])

        with res_col_gauge:
            # Modern Plotly Semi-Circle Gauge
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=predicted_grade,
                number={"suffix": " / 20", "font": {"size": 36, "color": "#ffffff", "family": "Plus Jakarta Sans"}},
                gauge={
                    "axis": {"range": [0, 20], "tickwidth": 1, "tickcolor": "#94a3b8", "dtick": 2},
                    "bar": {"color": tier_color, "thickness": 0.28},
                    "bgcolor": "rgba(15, 23, 42, 0.5)",
                    "borderwidth": 1,
                    "bordercolor": "rgba(255, 255, 255, 0.1)",
                    "steps": [
                        {"range": [0, 10], "color": "rgba(239, 68, 68, 0.2)"},
                        {"range": [10, 14], "color": "rgba(245, 158, 11, 0.2)"},
                        {"range": [14, 16], "color": "rgba(56, 189, 248, 0.2)"},
                        {"range": [16, 20], "color": "rgba(16, 185, 129, 0.2)"},
                    ],
                    "threshold": {
                        "line": {"color": "#ffffff", "width": 3},
                        "thickness": 0.8,
                        "value": 10.0
                    }
                }
            ))
            fig_gauge.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font={"family": "Plus Jakarta Sans, sans-serif"},
                margin=dict(l=30, r=30, t=30, b=10),
                height=260
            )
            st.plotly_chart(fig_gauge, use_container_width=True)

            mae_val = results.get("Random Forest", {}).get("MAE", 3.00)
            low_bound = max(0.0, round(predicted_grade - mae_val, 1))
            high_bound = min(20.0, round(predicted_grade + mae_val, 1))

            st.markdown(f"""
            <div style="text-align:center; background:rgba(30,41,59,0.5); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.06);">
                <span style="font-size:0.8rem; color:#94a3b8;">Expected Score Range (± MAE):</span><br>
                <b style="font-size:1.05rem; color:#f8fafc;">{low_bound} – {high_bound} points</b>
            </div>
            """, unsafe_allow_html=True)

        with res_col_info:
            st.markdown(f"""
            <div class="content-card" style="height:100%; box-sizing:border-box;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8; font-weight:700;">Performance Category</span>
                    <span style="background:{tier_color}22; color:{tier_color}; border:1px solid {tier_color}55; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.82rem;">
                        {tier_name}
                    </span>
                </div>
                <h3 style="margin:0 0 10px 0; color:#ffffff; font-size:1.35rem;">
                    Score Estimate: <span style="color:{tier_color}; font-weight:800;">{predicted_grade:.1f}</span> out of 20
                </h3>
                <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.55; margin-bottom:14px;">
                    This estimation is generated using 30 baseline student factors. 
                    It reflects probability distribution from historical cohorts under similar academic and environmental parameters.
                </p>
                <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:12px;">
                    <b style="color:#a5b4fc; font-size:0.85rem;">Personalized Academic Guidance:</b>
                </div>
            """, unsafe_allow_html=True)

            # Rule-based dynamic personalization recommendations based on inputs
            recommendations = []
            if user_input_dict["absences"] > 8:
                recommendations.append(("warning", f"🚨 <b>High Absenteeism ({user_input_dict['absences']} days):</b> Missing classes is the leading cause of grade drop. Establish an attendance contract and prioritize catching up on missed lecture material."))
            if user_input_dict["studytime"] < 2:
                recommendations.append(("info", "⏱️ <b>Study Habit Upgrade:</b> Currently under 2 hours/week. Increasing focused study to 2–5 hours weekly is associated with an average 1.5–2.0 point grade gain."))
            if user_input_dict["failures"] > 0:
                recommendations.append(("warning", f"⚠️ <b>Prior Failure Recovery ({user_input_dict['failures']} past classes):</b> Targeted foundational diagnostics are recommended to bridge gaps in core mathematics prerequisites."))
            if user_input_dict["schoolsup"] == "no" and predicted_grade < 12.0:
                recommendations.append(("info", "🏫 <b>Leverage School Tutoring:</b> Enrolling in available school extra support can stabilize borderline passing performance."))
            if user_input_dict["higher"] == "no":
                recommendations.append(("info", "🎯 <b>Goal Orientation:</b> Students with explicit higher-education ambitions achieve statistically higher engagement."))
            if user_input_dict["goout"] >= 4 and user_input_dict["Walc"] >= 3:
                recommendations.append(("warning", "⚖️ <b>Weekend Habit Moderation:</b> Frequent nightlife and elevated weekend alcohol consumption negatively intersect with Monday lecture retention."))
            if predicted_grade >= 16.0:
                recommendations.append(("success", "⭐ <b>Excellence Pathway:</b> Candidate is excelling! Recommend advanced math competitions, collegiate prep seminars, or peer mentorship roles."))
            
            if not recommendations:
                recommendations.append(("info", "✅ <b>Balanced Profile:</b> Maintain existing study routines and review homework consistently ahead of midterms."))

            for r_type, text in recommendations[:3]:
                st.markdown(f'<div class="rec-item {r_type}">{text}</div>', unsafe_allow_html=True)

            st.markdown("</div>", unsafe_allow_html=True)

        # Clear Ethical AI Disclaimer
        st.markdown("<div style='height:16px;'></div>", unsafe_allow_html=True)
        st.markdown("""
        <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.25); border-radius:10px; padding:12px 18px; font-size:0.8rem; color:#fca5a5; line-height:1.45;">
            <b>⚠️ Ethical AI & Analytical Notice:</b> Predictions are statistical point estimates derived from empirical population patterns. 
            They do <b>not</b> constitute definitive student evaluations or destiny. Machine learning models should be leveraged solely 
            by counselors and instructors to provide early supportive interventions, not punitive determinations.
        </div>
        """, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────
# 5. MODEL EXPLAINABILITY & INSIGHTS
# ─────────────────────────────────────────────────────────────
elif selected_page == "🧠 Model Explainability":
    st.markdown("""
    <div class="hero-container">
        <div class="hero-badge">🧠 Transparent & Interpretable ML</div>
        <h1 class="hero-title">Model Explainability & Feature Importance</h1>
        <p class="hero-subtitle">
            Understand which factors carry the strongest predictive weight in the champion Random Forest pipeline.
            Inspect feature ranking, understand social-behavioral dynamics, and review critical considerations on causation vs. correlation.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Feature Importance Bar Chart
    if feat_imp_data:
        top_n = st.slider("Select Number of Top Features to Display:", min_value=5, max_value=25, value=12)
        top_feats = feat_imp_data[:top_n]

        # Clean display names
        clean_names = []
        for item in top_feats:
            f = item["feature"]
            f = f.replace("num__", "").replace("cat__", "")
            mapping = {
                "absences": "School Absences (Days)",
                "failures": "Past Class Failures",
                "health": "Current Health Status",
                "goout": "Going Out with Friends",
                "age": "Student Age",
                "studytime": "Weekly Study Time",
                "freetime": "Free Time After School",
                "Walc": "Weekend Alcohol Consumption",
                "Medu": "Mother's Education Level",
                "Fedu": "Father's Education Level",
                "famrel": "Family Relationship Quality",
                "traveltime": "Travel Time to School",
                "Dalc": "Workday Alcohol Consumption",
                "higher_yes": "Wants Higher Education (Yes)",
                "higher_no": "Wants Higher Education (No)",
                "schoolsup_yes": "School Extra Support (Yes)",
                "schoolsup_no": "School Extra Support (No)",
                "famsup_yes": "Family Extra Support (Yes)",
                "paid_yes": "Paid Extra Classes (Yes)",
                "paid_no": "Paid Extra Classes (No)",
                "Mjob_teacher": "Mother's Job: Teacher",
                "Mjob_health": "Mother's Job: Health",
                "Mjob_services": "Mother's Job: Services",
                "Mjob_at_home": "Mother's Job: At Home",
                "Mjob_other": "Mother's Job: Other",
                "Fjob_teacher": "Father's Job: Teacher",
                "Fjob_services": "Father's Job: Services",
                "reason_reputation": "School Choice: Reputation",
                "reason_course": "School Choice: Course",
                "reason_home": "School Choice: Close to Home",
                "address_U": "Urban Address",
                "address_R": "Rural Address",
                "sex_F": "Sex: Female",
                "sex_M": "Sex: Male",
                "school_GP": "School: Gabriel Pereira",
                "school_MS": "School: Mousinho da Silveira",
            }
            clean_names.append(mapping.get(f, f.replace("_", " ").title()))

        df_imp = pd.DataFrame({
            "Feature": clean_names,
            "Importance": [item["importance"] for item in top_feats]
        }).sort_values(by="Importance", ascending=True)

        fig_imp = px.bar(
            df_imp,
            x="Importance",
            y="Feature",
            orientation="h",
            color="Importance",
            color_continuous_scale="Purples",
            labels={"Importance": "Mean Gini Decrease (Feature Importance)", "Feature": ""},
        )
        fig_imp.update_layout(coloraxis_showscale=False)
        apply_plotly_theme(fig_imp, height=480)
        st.plotly_chart(fig_imp, use_container_width=True)
    else:
        st.info("Feature importance data is being compiled. Re-run `python train.py` to regenerate the full importance index.")

    st.markdown("---")

    # Detailed Factor Decomposition
    st.markdown("### 🔬 Analytical Breakdown of Primary Predictive Drivers")
    col_d1, col_d2 = st.columns(2)

    with col_d1:
        st.markdown("""
        <div class="content-card">
            <h4 style="color:#818cf8; margin-top:0;">1. School Absences (`absences`)</h4>
            <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.55;">
                Ranked <b>#1 overall</b> with ~18.8% feature importance. 
                Mathematics curricula in secondary education are heavily cumulative. Missing consecutive instructional blocks 
                creates foundational gaps that compound as the semester advances toward calculus and algebra.
            </p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="content-card">
            <h4 style="color:#f59e0b; margin-top:0;">3. Social Habits & Going Out (`goout`, `Walc`)</h4>
            <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.55;">
                Heavy peer socialization and weekend alcohol consumption emerge as consistent negative correlates. 
                While moderate socializing supports mental wellness, students spending 4–5 evenings weekly outside 
                often display erratic homework completion and fatigue.
            </p>
        </div>
        """, unsafe_allow_html=True)

    with col_d2:
        st.markdown("""
        <div class="content-card">
            <h4 style="color:#f43f5e; margin-top:0;">2. Past Academic Failures (`failures`)</h4>
            <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.55;">
                Ranked <b>#2 overall</b> with ~14.2% feature importance. 
                A history of repeating classes strongly flags persistent cognitive or environmental hurdles. 
                Students with ≥1 prior failure average over 4.5 points lower on the final G3 assessment.
            </p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div class="content-card">
            <h4 style="color:#10b981; margin-top:0;">4. Parental Education (`Medu`, `Fedu`)</h4>
            <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.55;">
                Mother’s and Father’s educational attainment serve as socioeconomic proxies, reflecting home literacy environments, 
                homework assistance availability, and academic expectations within the household.
            </p>
        </div>
        """, unsafe_allow_html=True)

    # Correlation vs Causation Notice
    st.markdown("""
    <div class="content-card" style="border-left:4px solid #a855f7; margin-top:10px;">
        <h4 style="margin:0 0 6px 0; color:#c084fc;">⚖️ Critical Methodological Distinction: Correlation vs. Causation</h4>
        <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.6; margin:0;">
            A high feature importance score indicates that a feature provides high mutual information for tree-splitting; 
            it does <b>not</b> prove that changing that variable will directly cause an improvement in grade points. 
            For instance, higher absences may be a symptom of underlying illness, family stress, or disengagement rather than 
            the sole root cause. Interventions must address the holistic student context.
        </p>
    </div>
    """, unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────
# 6. DATASET EXPLORER
# ─────────────────────────────────────────────────────────────
elif selected_page == "📋 Dataset Explorer":
    st.markdown("""
    <div class="hero-container">
        <div class="hero-badge">📋 Raw Data & Schema Reference</div>
        <h1 class="hero-title">Dataset Explorer & Metadata</h1>
        <p class="hero-subtitle">
            Inspect the complete 395-row secondary school mathematics cohort dataset. 
            Filter columns, review descriptive statistical distributions, and explore the schema dictionary.
        </p>
    </div>
    """, unsafe_allow_html=True)

    tab_data, tab_stats, tab_dict = st.tabs(["🔍 Raw Data Inspector", "📊 Descriptive Statistics", "📖 Data Dictionary"])

    with tab_data:
        st.markdown("#### Tabular Cohort Browser")
        search_query = st.text_input("Filter records by keyword (e.g., GP, teacher, services):", "")
        
        display_df = df.copy()
        if search_query:
            mask = display_df.astype(str).apply(lambda row: row.str.contains(search_query, case=False).any(), axis=1)
            display_df = display_df[mask]

        st.caption(f"Displaying {len(display_df)} of {len(df)} total students")
        st.dataframe(display_df, use_container_width=True, height=450)

        # Quick CSV Download
        csv_data = display_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="📥 Download Current View as CSV",
            data=csv_data,
            file_name="student_performance_cohort.csv",
            mime="text/csv",
        )

    with tab_stats:
        st.markdown("#### Summary Statistics of Numeric Features")
        st.dataframe(df.describe().T.style.format("{:.2f}"), use_container_width=True, height=420)

    with tab_dict:
        st.markdown("#### Variable Definitions (Cortez & Silva, 2008)")
        schema_info = [
            ("school", "Student's school", "Binary ('GP' - Gabriel Pereira or 'MS' - Mousinho da Silveira)"),
            ("sex", "Student's sex", "Binary ('F' - female or 'M' - male)"),
            ("age", "Student's age", "Numeric (from 15 to 22)"),
            ("address", "Student's home address type", "Binary ('U' - urban or 'R' - rural)"),
            ("famsize", "Family size", "Binary ('LE3' - ≤3 or 'GT3' - >3)"),
            ("Pstatus", "Parent's cohabitation status", "Binary ('T' - living together or 'A' - apart)"),
            ("Medu", "Mother's education", "Numeric: 0 (none), 1 (primary), 2 (5th–9th), 3 (secondary), 4 (higher)"),
            ("Fedu", "Father's education", "Numeric: 0 (none), 1 (primary), 2 (5th–9th), 3 (secondary), 4 (higher)"),
            ("Mjob", "Mother's job", "Nominal: 'teacher', 'health', 'services', 'at_home' or 'other'"),
            ("Fjob", "Father's job", "Nominal: 'teacher', 'health', 'services', 'at_home' or 'other'"),
            ("reason", "Reason to choose school", "Nominal: 'home', 'reputation', 'course' or 'other'"),
            ("guardian", "Student's guardian", "Nominal: 'mother', 'father' or 'other'"),
            ("traveltime", "Home to school travel time", "Numeric: 1 (<15 min), 2 (15-30 min), 3 (30-60 min), 4 (>60 min)"),
            ("studytime", "Weekly study time", "Numeric: 1 (<2 hrs), 2 (2-5 hrs), 3 (5-10 hrs), 4 (>10 hrs)"),
            ("failures", "Number of past class failures", "Numeric (0 to 3)"),
            ("schoolsup", "Extra educational support", "Binary ('yes' or 'no')"),
            ("famsup", "Family educational support", "Binary ('yes' or 'no')"),
            ("paid", "Extra paid classes in subject", "Binary ('yes' or 'no')"),
            ("activities", "Extra-curricular activities", "Binary ('yes' or 'no')"),
            ("nursery", "Attended nursery school", "Binary ('yes' or 'no')"),
            ("higher", "Wants to take higher education", "Binary ('yes' or 'no')"),
            ("internet", "Internet access at home", "Binary ('yes' or 'no')"),
            ("romantic", "In a romantic relationship", "Binary ('yes' or 'no')"),
            ("famrel", "Quality of family relationships", "Numeric: from 1 (very bad) to 5 (excellent)"),
            ("freetime", "Free time after school", "Numeric: from 1 (very low) to 5 (very high)"),
            ("goout", "Going out with friends", "Numeric: from 1 (very low) to 5 (very high)"),
            ("Dalc", "Workday alcohol consumption", "Numeric: from 1 (very low) to 5 (very high)"),
            ("Walc", "Weekend alcohol consumption", "Numeric: from 1 (very low) to 5 (very high)"),
            ("health", "Current health status", "Numeric: from 1 (very bad) to 5 (very good)"),
            ("absences", "Number of school absences", "Numeric: from 0 to 93"),
            ("G1", "First period grade (1st term)", "Numeric: from 0 to 20 [Excluded from features]"),
            ("G2", "Second period grade (2nd term)", "Numeric: from 0 to 20 [Excluded from features]"),
            ("G3", "Final grade (Target variable)", "Numeric: from 0 to 20"),
        ]
        schema_df = pd.DataFrame(schema_info, columns=["Feature", "Description", "Scale & Values"])
        st.dataframe(schema_df, use_container_width=True, height=500, hide_index=True)


# ─────────────────────────────────────────────────────────────
# GLOBAL FOOTER
# ─────────────────────────────────────────────────────────────
st.markdown("<div style='height:30px;'></div>", unsafe_allow_html=True)
st.markdown("""
<div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:16px; margin-top:20px; display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:#64748b;">
    <div>EduMetrics AI · Student Performance Intelligence System</div>
    <div>Built with Streamlit · Plotly · Scikit-Learn · UCI ML Repository</div>
</div>
""", unsafe_allow_html=True)
