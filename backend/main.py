from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from models.anomaly_detector import AnomalyDetector

detector: AnomalyDetector = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global detector
    print("Training anomaly detection models...")
    detector = AnomalyDetector()
    print("Models ready.")
    yield


app = FastAPI(
    title="CyberImmune AI",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.routes import router
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "CyberImmune AI API", "docs": "/docs"}
