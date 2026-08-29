from fastapi import FastAPI

from app.routers.auth import router as auth_router
from app.routers.monitors import router as monitor_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title = "PulseOps API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(monitor_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "PluseOps API"
    }