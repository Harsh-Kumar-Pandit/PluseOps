from fastapi import FastAPI

app = FastAPI(title = "PulseOps API")

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "PluseOps API"
    }