# CyberImmune AI — Anomaly Detection Platform

ML-based cybersecurity platform for real-time threat detection using unsupervised anomaly detection algorithms.

## Features

- Real-time detection of **phishing**, **malware**, and **network intrusion**
- **Isolation Forest** (200 estimators) for anomaly scoring
- **K-Means clustering** (k=4) for threat classification
- **18-dimensional feature extraction** pipeline on network event data
- Live simulation feed with PCA scatter plot visualization
- Manual event analyzer with confidence scores

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python, FastAPI, Scikit-learn |
| ML Models | Isolation Forest, K-Means, PCA |
| Frontend | Next.js 15, TypeScript, Recharts |
| Styling | Tailwind CSS |

## Setup

**Backend**
```bash
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn main:app --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3001` in your browser.

## Threat Categories

| Threat | Signal |
|--------|--------|
| Network Intrusion | High failed logins, suspicious ports, high request rate |
| Malware Activity | High entropy payload, known C2 ports (4444, 1337, 31337) |
| Phishing Attempt | Anomalous HTTP patterns, moderate entropy, login failures |
| Normal Traffic | Baseline network behavior |
