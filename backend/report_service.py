"""
report_service.py
-----------------
Generates professional branded PDF evaluation reports for student predictions
using ReportLab.
"""

import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_prediction_pdf(
    student_name: str,
    student_email: str,
    prediction_data: dict,
) -> io.BytesIO:
    """
    Produce a clean, professional PDF report buffer for an individual prediction.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    # Custom ReportLab Styles
    header_title_style = ParagraphStyle(
        "HeaderTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
    )
    subtitle_style = ParagraphStyle(
        "SubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b"),
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#334155"),
    )
    grade_style = ParagraphStyle(
        "GradeDisplay",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=30,
        alignment=1,  # Center
        textColor=colors.HexColor("#4338ca"),
    )
    grade_sub = ParagraphStyle(
        "GradeSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        alignment=1,  # Center
        textColor=colors.HexColor("#64748b"),
    )
    rec_title = ParagraphStyle(
        "RecTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
    )
    rec_body = ParagraphStyle(
        "RecBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#475569"),
    )
    disclaimer_style = ParagraphStyle(
        "DisclaimerText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#94a3b8"),
    )

    elements = []

    # 1. Header & Brand Banner
    brand_table = Table(
        [
            [
                Paragraph("<b>AETHER</b> | Student Intelligence & Success", header_title_style),
                Paragraph("CONFIDENTIAL REPORT<br/>UCI Portuguese Math Cohort", subtitle_style),
            ]
        ],
        colWidths=[4.2 * inch, 3.0 * inch],
    )
    brand_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ]
        )
    )
    elements.append(brand_table)
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4f46e5"), spaceAfter=14))

    # 2. Student Metadata Table
    created_at_str = prediction_data.get("created_at", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"))
    pred_id = prediction_data.get("id", "N/A")
    meta_data = [
        [
            Paragraph(f"<b>Student Name:</b> {student_name}", body_style),
            Paragraph(f"<b>Assessment ID:</b> #{pred_id}", body_style),
        ],
        [
            Paragraph(f"<b>Email:</b> {student_email}", body_style),
            Paragraph(f"<b>Generated At:</b> {str(created_at_str)[:19]}", body_style),
        ],
        [
            Paragraph("<b>Target Metric:</b> Final Mathematics Grade (G3: 0–20)", body_style),
            Paragraph(f"<b>Evaluator:</b> {prediction_data.get('model_name', 'Random Forest Regressor')}", body_style),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[3.6 * inch, 3.6 * inch])
    meta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    elements.append(meta_table)
    elements.append(Spacer(1, 16))

    # 3. Prediction Result Box
    grade = prediction_data.get("predicted_grade", 0.0)
    conf_low = prediction_data.get("confidence_low", max(0.0, grade - 3.0))
    conf_high = prediction_data.get("confidence_high", min(20.0, grade + 3.0))
    category = prediction_data.get("performance_category", "Satisfactory")

    grade_card = [
        [
            Paragraph("<b>ESTIMATED FINAL GRADE (G3)</b>", subtitle_style),
            Paragraph("<b>PROJECTED PERFORMANCE BAND</b>", subtitle_style),
        ],
        [
            Paragraph(f"{grade:.1f} <font size=14 color='#64748b'>/ 20</font>", grade_style),
            Paragraph(f"<b>{category}</b>", ParagraphStyle("Cat", parent=section_heading, alignment=1, textColor=colors.HexColor("#312e81"))),
        ],
        [
            Paragraph(f"Expected Range: <b>{conf_low:.1f} – {conf_high:.1f} points</b> (± Model MAE)", grade_sub),
            Paragraph("Passing Benchmark: 10.0 / 20.0 Points", grade_sub),
        ],
    ]
    grade_table = Table(grade_card, colWidths=[3.6 * inch, 3.6 * inch])
    grade_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eef2ff")),
                ("BOX", (0, 0), (-1, -1), 1.0, colors.HexColor("#c7d2fe")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    elements.append(grade_table)
    elements.append(Spacer(1, 16))

    # 4. Input Predictor Factors Summary
    elements.append(Paragraph("Student Academic Profile Summary", section_heading))
    features = prediction_data.get("input_features", {})

    study_labels = {1: "< 2 hours/week", 2: "2 to 5 hours/week", 3: "5 to 10 hours/week", 4: "> 10 hours/week"}
    study_text = study_labels.get(features.get("studytime", 2), "2-5 hours/week")

    summary_rows = [
        [
            Paragraph("<b>Predictive Attribute</b>", subtitle_style),
            Paragraph("<b>Observed Value</b>", subtitle_style),
            Paragraph("<b>Predictive Attribute</b>", subtitle_style),
            Paragraph("<b>Observed Value</b>", subtitle_style),
        ],
        [
            Paragraph("Weekly Study Investment", body_style),
            Paragraph(study_text, body_style),
            Paragraph("School Absences", body_style),
            Paragraph(f"{features.get('absences', 0)} missed days", body_style),
        ],
        [
            Paragraph("Prior Class Failures", body_style),
            Paragraph(str(features.get("failures", 0)), body_style),
            Paragraph("Higher Education Ambition", body_style),
            Paragraph("Yes" if features.get("higher") == "yes" else "No", body_style),
        ],
        [
            Paragraph("School Remedial Support", body_style),
            Paragraph("Enrolled" if features.get("schoolsup") == "yes" else "None", body_style),
            Paragraph("Family Support", body_style),
            Paragraph("Active" if features.get("famsup") == "yes" else "None", body_style),
        ],
        [
            Paragraph("Health Status (1–5)", body_style),
            Paragraph(f"{features.get('health', 3)} / 5", body_style),
            Paragraph("Going Out Frequency", body_style),
            Paragraph(f"{features.get('goout', 3)} / 5", body_style),
        ],
    ]
    summary_table = Table(summary_rows, colWidths=[2.0 * inch, 1.6 * inch, 2.0 * inch, 1.6 * inch])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    elements.append(summary_table)
    elements.append(Spacer(1, 14))

    # 5. Personalized Guidance Recommendations
    elements.append(Paragraph("Personalized Academic Action Plan", section_heading))
    recommendations = prediction_data.get("recommendations", [])

    if recommendations:
        rec_data = []
        for r in recommendations:
            title = r.get("title", "Recommendation")
            detail = r.get("detail", "")
            rec_data.append([
                Paragraph(f"• <b>{title}</b><br/>{detail}", rec_body)
            ])
        rec_table = Table(rec_data, colWidths=[7.2 * inch])
        rec_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                    ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ]
            )
        )
        elements.append(rec_table)
    else:
        elements.append(Paragraph("No immediate critical intervention triggers found.", body_style))

    elements.append(Spacer(1, 16))

    # 6. Ethical AI Disclaimer & Footer
    disclaimer_text = (
        "<b>Ethical AI & Methodological Notice:</b> Predictions are probabilistic estimates computed via an ensemble "
        "Random Forest regressor trained on historical Portuguese secondary school cohorts. They do not constitute "
        "deterministic evaluations or permanent academic labels. Educational institutions must utilize this information "
        "solely to deliver targeted supportive resources and personalized academic advisement."
    )
    elements.append(Paragraph(disclaimer_text, disclaimer_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=6))
    elements.append(Paragraph("AETHER Student Intelligence Platform · Engineered for Transparent Educational Analytics", subtitle_style))

    # Build Document
    doc.build(elements)
    buffer.seek(0)
    return buffer
