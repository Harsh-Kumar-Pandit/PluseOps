from celery import Celery

celery_app = Celery(
    "pulseops",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/1",
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.conf.beat_schedule = {
    "check-monitors-periodically": {
        "task": "app.workers.tasks.check_all_monitors",
        "schedule": 5.0,
    },
    "cleanup-old-health-checks": {
        "task": "app.workers.tasks.cleanup_old_health_checks",
        "schedule": 86400.0,
    },
}