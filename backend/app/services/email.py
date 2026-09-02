import os
import smtplib
import logging
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("pulseops.email")

def get_smtp_config():
    host = os.getenv("SMTP_HOST", "").strip()
    port_raw = os.getenv("SMTP_PORT", "587").strip()
    try:
        port = int(port_raw)
    except ValueError:
        port = 587
    username = os.getenv("SMTP_USERNAME", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    from_email = os.getenv("SMTP_FROM_EMAIL", "").strip()
    from_name = os.getenv("SMTP_FROM_NAME", "PulseOps").strip()
    use_tls_raw = os.getenv("SMTP_USE_TLS", "true").strip().lower()
    use_tls = use_tls_raw not in ("false", "0", "no", "off")

    return {
        "host": host,
        "port": port,
        "username": username,
        "password": password,
        "from_email": from_email,
        "from_name": from_name,
        "use_tls": use_tls,
    }


def is_smtp_configured() -> bool:
    config = get_smtp_config()
    return bool(config["host"] and config["from_email"])


def send_notification_email(
    to_email: str,
    subject: str,
    text_content: str,
    html_content: str
) -> dict:
    """
    Sends an operational alert email synchronously using SMTP credentials.
    Returns dict: {"success": bool, "error": str | None}
    """
    if not is_smtp_configured():
        logger.info("SMTP configuration missing. Email delivery skipped.")
        return {"success": False, "error": "SMTP_NOT_CONFIGURED"}

    config = get_smtp_config()

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{config['from_name']} <{config['from_email']}>"
        msg["To"] = to_email

        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        msg.attach(part1)
        msg.attach(part2)

        if config["port"] == 465 and not config["use_tls"]:
            with smtplib.SMTP_SSL(config["host"], config["port"], timeout=15) as server:
                if config["username"] and config["password"]:
                    server.login(config["username"], config["password"])
                server.sendmail(config["from_email"], [to_email], msg.as_string())
        else:
            with smtplib.SMTP(config["host"], config["port"], timeout=15) as server:
                if config["use_tls"]:
                    server.starttls()
                if config["username"] and config["password"]:
                    server.login(config["username"], config["password"])
                server.sendmail(config["from_email"], [to_email], msg.as_string())

        logger.info(f"Alert email sent successfully to {to_email}")
        return {"success": True, "error": None}

    except Exception as err:
        error_msg = f"SMTP failure: {str(err)}"
        logger.error(f"Failed to send email to {to_email}: {error_msg}")
        return {"success": False, "error": error_msg}


def build_down_email(
    monitor_name: str,
    monitor_url: str,
    reason: str,
    incident_id: int | str,
    started_at: datetime | str,
) -> tuple[str, str, str]:
    """
    Returns (subject, text_content, html_content) for a DOWN alert.
    """
    subject = f"[PulseOps] {monitor_name} is DOWN"

    started_str = (
        started_at.strftime("%Y-%m-%d %H:%M:%S UTC")
        if isinstance(started_at, datetime)
        else str(started_at)
    )

    text = f"""[PulseOps Operational Alert]

CRITICAL: Monitor '{monitor_name}' is DOWN.

Details:
- Monitor Name: {monitor_name}
- Target URL: {monitor_url}
- Status: DOWN
- Incident ID: #{incident_id}
- Started At: {started_str}
- Root Cause: {reason or 'Threshold failure exceeded'}

Please check your PulseOps dashboard for detailed diagnostic metrics.
"""

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; margin: 0; padding: 24px; }}
    .card {{ background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; max-width: 600px; margin: 0 auto; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }}
    .badge {{ display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; background-color: rgba(248, 81, 73, 0.15); color: #f85149; border: 1px solid #f85149; }}
    .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin: 12px 0 4px; }}
    .subtitle {{ font-size: 14px; color: #8b949e; margin-bottom: 20px; }}
    .meta-table {{ width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }}
    .meta-table td {{ padding: 8px 0; border-bottom: 1px solid #21262d; }}
    .meta-label {{ color: #8b949e; width: 130px; font-weight: 500; }}
    .meta-value {{ color: #f0f6fc; font-weight: 600; font-family: monospace; }}
    .footer {{ margin-top: 24px; font-size: 12px; color: #8b949e; text-align: center; border-top: 1px solid #21262d; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">ALERT • DOWN</span>
    <h1 class="title">{monitor_name} is DOWN</h1>
    <p class="subtitle">PulseOps detected an service outage for this endpoint.</p>
    
    <table class="meta-table">
      <tr>
        <td class="meta-label">Monitor Name</td>
        <td class="meta-value">{monitor_name}</td>
      </tr>
      <tr>
        <td class="meta-label">Target URL</td>
        <td class="meta-value">{monitor_url}</td>
      </tr>
      <tr>
        <td class="meta-label">Incident ID</td>
        <td class="meta-value">#{incident_id}</td>
      </tr>
      <tr>
        <td class="meta-label">Started At</td>
        <td class="meta-value">{started_str}</td>
      </tr>
      <tr>
        <td class="meta-label">Root Cause</td>
        <td class="meta-value" style="color: #f85149;">{reason or 'Threshold failure exceeded'}</td>
      </tr>
    </table>

    <div class="footer">
      Automated Operational Notification from PulseOps Infrastructure Monitoring.
    </div>
  </div>
</body>
</html>"""

    return subject, text, html


def build_recovery_email(
    monitor_name: str,
    monitor_url: str,
    incident_id: int | str,
    started_at: datetime | str,
    resolved_at: datetime | str,
    duration_seconds: int | None,
) -> tuple[str, str, str]:
    """
    Returns (subject, text_content, html_content) for a RECOVERY alert.
    """
    subject = f"[PulseOps] {monitor_name} has RECOVERED"

    started_str = (
        started_at.strftime("%Y-%m-%d %H:%M:%S UTC")
        if isinstance(started_at, datetime)
        else str(started_at)
    )
    resolved_str = (
        resolved_at.strftime("%Y-%m-%d %H:%M:%S UTC")
        if isinstance(resolved_at, datetime)
        else str(resolved_at)
    )
    duration_str = f"{duration_seconds}s" if duration_seconds is not None else "Unknown"

    text = f"""[PulseOps Operational Alert]

RESOLVED: Monitor '{monitor_name}' has RECOVERED to UP.

Details:
- Monitor Name: {monitor_name}
- Target URL: {monitor_url}
- Status: RECOVERED / UP
- Incident ID: #{incident_id}
- Started At: {started_str}
- Resolved At: {resolved_str}
- Outage Duration: {duration_str}

The service has met the recovery threshold and is operating normally.
"""

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; margin: 0; padding: 24px; }}
    .card {{ background-color: #161b22; border: 1px solid #30363d; border-radius: 8px; max-width: 600px; margin: 0 auto; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }}
    .badge {{ display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12px; background-color: rgba(46, 160, 67, 0.15); color: #3fb950; border: 1px solid #3fb950; }}
    .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin: 12px 0 4px; }}
    .subtitle {{ font-size: 14px; color: #8b949e; margin-bottom: 20px; }}
    .meta-table {{ width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }}
    .meta-table td {{ padding: 8px 0; border-bottom: 1px solid #21262d; }}
    .meta-label {{ color: #8b949e; width: 130px; font-weight: 500; }}
    .meta-value {{ color: #f0f6fc; font-weight: 600; font-family: monospace; }}
    .footer {{ margin-top: 24px; font-size: 12px; color: #8b949e; text-align: center; border-top: 1px solid #21262d; padding-top: 16px; }}
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">RECOVERY • UP</span>
    <h1 class="title">{monitor_name} has RECOVERED</h1>
    <p class="subtitle">PulseOps confirmed service health restoration.</p>
    
    <table class="meta-table">
      <tr>
        <td class="meta-label">Monitor Name</td>
        <td class="meta-value">{monitor_name}</td>
      </tr>
      <tr>
        <td class="meta-label">Target URL</td>
        <td class="meta-value">{monitor_url}</td>
      </tr>
      <tr>
        <td class="meta-label">Incident ID</td>
        <td class="meta-value">#{incident_id}</td>
      </tr>
      <tr>
        <td class="meta-label">Started At</td>
        <td class="meta-value">{started_str}</td>
      </tr>
      <tr>
        <td class="meta-label">Resolved At</td>
        <td class="meta-value">{resolved_str}</td>
      </tr>
      <tr>
        <td class="meta-label">Outage Duration</td>
        <td class="meta-value" style="color: #3fb950;">{duration_str}</td>
      </tr>
    </table>

    <div class="footer">
      Automated Operational Notification from PulseOps Infrastructure Monitoring.
    </div>
  </div>
</body>
</html>"""

    return subject, text, html
