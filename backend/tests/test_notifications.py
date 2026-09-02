import pytest
from datetime import datetime
from app.models import User, Notification
from app.core.security import create_access_token, hash_password

def test_notification_ownership_isolation(client, db_session):
    user_a = User(name="User A", email="usera@example.com", password=hash_password("password123"))
    user_b = User(name="User B", email="userb@example.com", password=hash_password("password123"))
    db_session.add_all([user_a, user_b])
    db_session.commit()
    db_session.refresh(user_a)
    db_session.refresh(user_b)

    token_a = create_access_token(user_a.id)
    token_b = create_access_token(user_b.id)

    notif_a = Notification(
        user_id=user_a.id,
        type="DOWN",
        title="Monitor DOWN Alert",
        message="Service A is DOWN",
        created_at=datetime.utcnow(),
    )
    db_session.add(notif_a)
    db_session.commit()
    db_session.refresh(notif_a)

    # User A requests notifications -> receives 1 item
    headers_a = {"Authorization": f"Bearer {token_a}"}
    res_a = client.get("/api/notifications", headers=headers_a)
    assert res_a.status_code == 200
    data_a = res_a.json()
    assert data_a["total"] == 1
    assert data_a["items"][0]["id"] == notif_a.id

    # User B requests notifications -> receives 0 items (Ownership Isolation)
    headers_b = {"Authorization": f"Bearer {token_b}"}
    res_b = client.get("/api/notifications", headers=headers_b)
    assert res_b.status_code == 200
    data_b = res_b.json()
    assert data_b["total"] == 0

    # User B attempts to mark User A's notification as read -> receives 404
    res_mark_b = client.post(f"/api/notifications/{notif_a.id}/read", headers=headers_b)
    assert res_mark_b.status_code == 404

    # User A marks their notification as read -> 200 OK
    res_mark_a = client.post(f"/api/notifications/{notif_a.id}/read", headers=headers_a)
    assert res_mark_a.status_code == 200
    assert res_mark_a.json()["is_read"] is True


def test_mark_all_read(client, db_session):
    user = User(name="User C", email="userc@example.com", password=hash_password("password123"))
    db_session.add(user)
    db_session.commit()

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}

    notif1 = Notification(user_id=user.id, type="DOWN", title="Down Alert 1", message="Message 1")
    notif2 = Notification(user_id=user.id, type="RECOVERY", title="Recovery Alert 2", message="Message 2")
    db_session.add_all([notif1, notif2])
    db_session.commit()

    # Bulk mark all read
    res = client.post("/api/notifications/read-all", headers=headers)
    assert res.status_code == 200

    res_list = client.get("/api/notifications", headers=headers)
    assert res_list.status_code == 200
    assert res_list.json()["unread_count"] == 0


def test_delete_single_notification(client, db_session):
    user = User(name="User D", email="userd@example.com", password=hash_password("password123"))
    db_session.add(user)
    db_session.commit()

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}

    notif = Notification(user_id=user.id, type="DOWN", title="Delete Test Alert", message="To be deleted")
    db_session.add(notif)
    db_session.commit()
    db_session.refresh(notif)

    # Delete single notification
    res = client.delete(f"/api/notifications/{notif.id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["id"] == notif.id

    # Verify notification no longer exists
    res_list = client.get("/api/notifications", headers=headers)
    assert res_list.json()["total"] == 0


def test_clear_all_notifications(client, db_session):
    user = User(name="User E", email="usere@example.com", password=hash_password("password123"))
    db_session.add(user)
    db_session.commit()

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}

    n1 = Notification(user_id=user.id, type="DOWN", title="Alert 1", message="Msg 1")
    n2 = Notification(user_id=user.id, type="RECOVERY", title="Alert 2", message="Msg 2")
    db_session.add_all([n1, n2])
    db_session.commit()

    # Clear all
    res = client.delete("/api/notifications/clear-all", headers=headers)
    assert res.status_code == 200
    assert res.json()["message"] == "All notifications cleared"

    res_list = client.get("/api/notifications", headers=headers)
    assert res_list.json()["total"] == 0
