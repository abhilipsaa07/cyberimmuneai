import random
import time
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter()

PROTOCOLS = ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "SSH", "FTP", "ICMP"]
FLAGS = ["SYN", "ACK", "FIN", "RST", "SYN-ACK", "PSH", "NONE"]
SUSPICIOUS_PORTS = [4444, 6666, 1337, 31337, 9999, 8080]
COMMON_PORTS = [80, 443, 53, 25, 110, 143, 993]


class NetworkEventInput(BaseModel):
    src_ip: str = Field(default="192.168.1.100")
    dst_ip: str = Field(default="10.0.0.1")
    protocol: str = Field(default="TCP")
    packet_size: int = Field(default=512, ge=1, le=65535)
    duration_ms: float = Field(default=100.0, ge=0)
    port: int = Field(default=80, ge=1, le=65535)
    flags: str = Field(default="SYN")
    payload_entropy: float = Field(default=4.0, ge=0.0, le=8.0)
    request_rate: float = Field(default=10.0, ge=0.0)
    failed_logins: int = Field(default=0, ge=0)


class BulkAnalyzeInput(BaseModel):
    events: List[NetworkEventInput]


def get_detector():
    import main as _main
    return _main.detector


@router.post("/analyze")
async def analyze_event(event: NetworkEventInput):
    det = get_detector()
    result = det.predict(event.model_dump())
    return {"status": "ok", "result": result, "timestamp": time.time()}


@router.post("/analyze/bulk")
async def analyze_bulk(payload: BulkAnalyzeInput):
    det = get_detector()
    results = det.bulk_predict([e.model_dump() for e in payload.events])
    summary = {
        "total": len(results),
        "anomalies": sum(1 for r in results if r["is_anomaly"]),
        "threat_breakdown": {},
    }
    for r in results:
        label = r["threat_label"]
        summary["threat_breakdown"][label] = summary["threat_breakdown"].get(label, 0) + 1
    return {"status": "ok", "results": results, "summary": summary}


@router.get("/simulate/stream")
async def simulate_stream(n: int = 20):
    rng = random.Random()
    events = []
    for _ in range(n):
        is_attack = rng.random() < 0.25
        if is_attack:
            attack_type = rng.choice(["intrusion", "malware", "phishing"])
            if attack_type == "intrusion":
                ev = {
                    "src_ip": f"{rng.randint(1,254)}.{rng.randint(0,254)}.{rng.randint(0,254)}.{rng.randint(1,254)}",
                    "dst_ip": "10.0.0.1",
                    "protocol": rng.choice(["TCP", "SSH"]),
                    "packet_size": rng.randint(1400, 65535),
                    "duration_ms": rng.uniform(1, 50),
                    "port": rng.choice(SUSPICIOUS_PORTS),
                    "flags": rng.choice(["SYN", "RST"]),
                    "payload_entropy": rng.uniform(6.5, 8.0),
                    "request_rate": rng.uniform(300, 1000),
                    "failed_logins": rng.randint(15, 50),
                }
            elif attack_type == "malware":
                ev = {
                    "src_ip": f"192.168.{rng.randint(0,254)}.{rng.randint(1,254)}",
                    "dst_ip": f"{rng.randint(1,254)}.{rng.randint(0,254)}.{rng.randint(0,254)}.{rng.randint(1,254)}",
                    "protocol": "TCP",
                    "packet_size": rng.randint(1200, 65535),
                    "duration_ms": rng.uniform(5, 100),
                    "port": rng.choice([4444, 1337, 31337]),
                    "flags": rng.choice(["SYN-ACK", "PSH"]),
                    "payload_entropy": rng.uniform(7.0, 8.0),
                    "request_rate": rng.uniform(100, 500),
                    "failed_logins": rng.randint(0, 5),
                }
            else:  # phishing
                ev = {
                    "src_ip": f"{rng.randint(1,254)}.{rng.randint(0,254)}.{rng.randint(0,254)}.{rng.randint(1,254)}",
                    "dst_ip": "10.0.0.50",
                    "protocol": rng.choice(["HTTP", "HTTPS"]),
                    "packet_size": rng.randint(800, 2000),
                    "duration_ms": rng.uniform(50, 500),
                    "port": rng.choice([80, 8080]),
                    "flags": rng.choice(["ACK", "PSH"]),
                    "payload_entropy": rng.uniform(5.5, 7.5),
                    "request_rate": rng.uniform(50, 200),
                    "failed_logins": rng.randint(3, 12),
                }
        else:
            ev = {
                "src_ip": f"10.0.{rng.randint(0,10)}.{rng.randint(1,254)}",
                "dst_ip": "10.0.0.1",
                "protocol": rng.choice(["HTTP", "HTTPS", "DNS"]),
                "packet_size": rng.randint(64, 1460),
                "duration_ms": rng.uniform(10, 500),
                "port": rng.choice(COMMON_PORTS),
                "flags": rng.choice(["ACK", "SYN-ACK", "SYN"]),
                "payload_entropy": rng.uniform(3.0, 5.5),
                "request_rate": rng.uniform(1, 50),
                "failed_logins": rng.randint(0, 2),
            }
        events.append(ev)

    det = get_detector()
    results = det.bulk_predict(events)
    return {"status": "ok", "events": events, "results": results}


@router.get("/model/info")
async def model_info():
    det = get_detector()
    return {"status": "ok", "model_stats": det.get_model_stats()}


@router.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": True}
