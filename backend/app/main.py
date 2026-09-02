from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.monitors import router as monitor_router
from app.routers.incidents import router as incidents_router
from app.routers.health_checks import router as health_checks_router
from app.routers.notifications import router as notifications_router

from app.core.database import engine, Base
import app.models  # ensure models are registered


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create tables on startup ({e})")
    yield


app = FastAPI(title="PulseOps API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(monitor_router)
app.include_router(incidents_router)
app.include_router(health_checks_router)
app.include_router(notifications_router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "PluseOps API"
    }