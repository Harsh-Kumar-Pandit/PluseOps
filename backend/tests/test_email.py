import os
import pytest
from datetime import datetime
from app.services.email import (
    is_smtp_configured,
    get_smtp_config,
    build_down_email,
    build_recovery_email,
    send_notification_email,
)
from app.workers.tasks import send_email_notification_task

def test_smtp_config_detection():
    # Test when SMTP credentials are absent
    os.environ["SMTP_HOST"] = ""
    os.environ["SMTP_FROM_EMAIL"] = ""
    assert is_smtp_configured() is False

    # Test when SMTP credentials are set
    os.environ["SMTP_HOST"] = "smtp.example.com"
    os.environ["SMTP_FROM_EMAIL"] = "alerts@example.com"
    assert is_smtp_configured() is True


def test_build_down_email_templates():
    started_at = datetime(2026, 9, 3, 12, 0, 0)
    subject, text, html = build_down_email(
        monitor_name="Payment Gateway API",
        monitor_url="https://api.payments.com/health",
        reason="HTTP 500 Internal Server Error",
        incident_id=42,
        started_at=started_at,
    )

    assert "[PulseOps] Payment Gateway API is DOWN" in subject
    assert "Payment Gateway API" in text
    assert "https://api.payments.com/health" in text
    assert "#42" in text
    assert "HTTP 500 Internal Server Error" in text

    assert "<html" in html
    assert "Payment Gateway API is DOWN" in html
    assert "#42" in html


def test_build_recovery_email_templates():
    started_at = datetime(2026, 9, 3, 12, 0, 0)
    resolved_at = datetime(2026, 9, 3, 12, 5, 30)
    subject, text, html = build_recovery_email(
        monitor_name="Payment Gateway API",
        monitor_url="https://api.payments.com/health",
        incident_id=42,
        started_at=started_at,
        resolved_at=resolved_at,
        duration_seconds=330,
    )

    assert "[PulseOps] Payment Gateway API has RECOVERED" in subject
    assert "330s" in text
    assert "#42" in text

    assert "<html" in html
    assert "330s" in html


def test_send_email_unconfigured_handling():
    os.environ["SMTP_HOST"] = ""
    os.environ["SMTP_FROM_EMAIL"] = ""

    res = send_notification_email(
        to_email="user@example.com",
        subject="Test Alert",
        text_content="Text body",
        html_content="<p>Html body</p>",
    )

    assert res["success"] is False
    assert res["error"] == "SMTP_NOT_CONFIGURED"
