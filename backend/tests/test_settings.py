import pytest
from datetime import datetime
from app.models import User, Notification
from app.core.security import create_access_token, hash_password
from app.workers.tasks import send_email_notification_task

def test_update_profile_name(client, db_session):
    user = User(
        name="Original Name",
        email="profiletest@example.com",
        password=hash_password("password123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # Update name to valid string
    res = client.patch(
        "/api/auth/profile",
        headers=headers,
        json={"name": "  Updated Dev Name  "},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Updated Dev Name"
    assert data["email"] == "profiletest@example.com"
    assert data["id"] == user.id

    # Verify database was updated
    db_session.refresh(user)
    assert user.name == "Updated Dev Name"


def test_update_profile_validation(client, db_session):
    user = User(
        name="Valid Name",
        email="validname@example.com",
        password=hash_password("password123"),
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # Empty / whitespace-only name should return 422
    res_empty = client.patch(
        "/api/auth/profile",
        headers=headers,
        json={"name": "   "},
    )
    assert res_empty.status_code == 422
    assert "Name cannot be empty" in res_empty.json()["detail"]

    # Name > 100 characters should return 422
    long_name = "A" * 105
    res_long = client.patch(
        "/api/auth/profile",
        headers=headers,
        json={"name": long_name},
    )
    assert res_long.status_code == 422
    assert "Name must not exceed 100 characters" in res_long.json()["detail"]


def test_get_and_patch_preferences_endpoints(client, db_session):
    user = User(
        name="Pref User",
        email="prefuser@example.com",
        password=hash_password("password123"),
        email_notifications_enabled=True,
        down_alerts_enabled=True,
        recovery_alerts_enabled=True,
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}

    # Test GET /api/auth/preferences
    res_get_auth = client.get("/api/auth/preferences", headers=headers)
    assert res_get_auth.status_code == 200
    assert res_get_auth.json()["email_notifications_enabled"] is True

    # Test GET /api/notifications/preferences
    res_get_notif = client.get("/api/notifications/preferences", headers=headers)
    assert res_get_notif.status_code == 200
    assert res_get_notif.json()["email_notifications_enabled"] is True

    # Test PATCH /api/notifications/preferences
    res_patch_notif = client.patch(
        "/api/notifications/preferences",
        headers=headers,
        json={"down_alerts_enabled": False},
    )
    assert res_patch_notif.status_code == 200
    assert res_patch_notif.json()["down_alerts_enabled"] is False

    # Verify GET /api/auth/preferences reflects update
    res_get_updated = client.get("/api/auth/preferences", headers=headers)
    assert res_get_updated.json()["down_alerts_enabled"] is False


def test_send_email_task_respects_master_switch(db_session):
    user = User(
        name="Master Disabled User",
        email="master_off@example.com",
        password=hash_password("password123"),
        email_notifications_enabled=False,  # Master OFF
        down_alerts_enabled=True,            # DOWN ON
        recovery_alerts_enabled=True,        # Recovery ON
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    notif = Notification(
        user_id=user.id,
        type="DOWN",
        title="Monitor Failure Alert",
        message="Service is DOWN",
        created_at=datetime.utcnow(),
    )
    db_session.add(notif)
    db_session.commit()
    db_session.refresh(notif)

    # Master OFF should block email delivery
    res = send_email_notification_task(notif.id)
    assert res["status"] == "disabled_by_user"

    db_session.refresh(notif)
    assert notif.email_status == "SKIPPED"
    assert "master user preference" in notif.email_error


def test_send_email_task_respects_down_alert_preference(db_session):
    user = User(
        name="Alert Disabled User",
        email="disabled@example.com",
        password=hash_password("password123"),
        email_notifications_enabled=True,
        down_alerts_enabled=False,  # DOWN alerts disabled
        recovery_alerts_enabled=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    notif = Notification(
        user_id=user.id,
        type="DOWN",
        title="Monitor Failure Alert",
        message="Service is DOWN",
        created_at=datetime.utcnow(),
    )
    db_session.add(notif)
    db_session.commit()
    db_session.refresh(notif)

    # Execute email task
    res = send_email_notification_task(notif.id)
    assert res["status"] == "down_alerts_disabled"

    db_session.refresh(notif)
    assert notif.email_status == "SKIPPED"
    assert "DOWN email alerts disabled" in notif.email_error


def test_send_email_task_respects_recovery_alert_preference(db_session):
    user = User(
        name="Recovery Disabled User",
        email="rec_disabled@example.com",
        password=hash_password("password123"),
        email_notifications_enabled=True,
        down_alerts_enabled=True,
        recovery_alerts_enabled=False,  # RECOVERY alerts disabled
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    notif = Notification(
        user_id=user.id,
        type="RECOVERY",
        title="Monitor Recovery Alert",
        message="Service has recovered",
        created_at=datetime.utcnow(),
    )
    db_session.add(notif)
    db_session.commit()
    db_session.refresh(notif)

    res = send_email_notification_task(notif.id)
    assert res["status"] == "recovery_alerts_disabled"

    db_session.refresh(notif)
    assert notif.email_status == "SKIPPED"
    assert "RECOVERY email alerts disabled" in notif.email_error
