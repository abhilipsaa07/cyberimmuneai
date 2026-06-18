import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from typing import Dict, Tuple, List
import joblib
import os

from .feature_extractor import generate_synthetic_training_data, extract_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "trained_models")

THREAT_LABELS = {
    0: "Normal Traffic",
    1: "Network Intrusion",
    2: "Malware Activity",
    3: "Phishing Attempt",
}

THREAT_COLORS = {
    0: "#00ff88",
    1: "#ff4444",
    2: "#ff8800",
    3: "#ffdd00",
}

CLUSTER_THREAT_MAP = {0: 0, 1: 1, 2: 2, 3: 3}


class AnomalyDetector:
    def __init__(self):
        self.isolation_forest = None
        self.kmeans = None
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2)
        self.is_trained = False
        self._train()

    def _train(self):
        X = generate_synthetic_training_data(6000)

        X_scaled = self.scaler.fit_transform(X)
        self.pca.fit(X_scaled)

        self.isolation_forest = IsolationForest(
            n_estimators=200,
            contamination=0.15,
            max_features=0.8,
            random_state=42,
            n_jobs=-1,
        )
        self.isolation_forest.fit(X_scaled)

        self.kmeans = KMeans(n_clusters=4, random_state=42, n_init=20)
        self.kmeans.fit(X_scaled)

        # Assign cluster -> threat type based on centroid characteristics
        centroids = self.scaler.inverse_transform(self.kmeans.cluster_centers_)
        cluster_scores = []
        for c in centroids:
            # Score = suspicious port + high entropy + brute force + high rate
            score = c[3] + c[9] + c[13] + c[11]
            cluster_scores.append(score)

        sorted_clusters = sorted(range(4), key=lambda i: cluster_scores[i])
        self.cluster_threat_map = {
            sorted_clusters[0]: 0,  # lowest anomaly score → normal
            sorted_clusters[1]: 3,  # phishing (moderate)
            sorted_clusters[2]: 2,  # malware (higher)
            sorted_clusters[3]: 1,  # intrusion (highest)
        }

        self.is_trained = True

    def predict(self, event: Dict) -> Dict:
        features = extract_features(event)
        X_scaled = self.scaler.transform(features.reshape(1, -1))

        iso_score = self.isolation_forest.score_samples(X_scaled)[0]
        iso_pred = self.isolation_forest.predict(X_scaled)[0]

        cluster = self.kmeans.predict(X_scaled)[0]
        threat_type = self.cluster_threat_map.get(int(cluster), 0)

        # Remap if isolation forest says normal
        if iso_pred == 1:
            threat_type = 0

        anomaly_score = max(0.0, min(1.0, (iso_score * -1 + 0.3) * 2.5))

        pca_coords = self.pca.transform(X_scaled)[0]

        confidence = round(abs(iso_score) * 100, 1)
        confidence = max(60.0, min(99.9, confidence * 12))

        return {
            "threat_type": int(threat_type),
            "threat_label": THREAT_LABELS[threat_type],
            "threat_color": THREAT_COLORS[threat_type],
            "is_anomaly": bool(iso_pred == -1),
            "anomaly_score": round(float(anomaly_score), 4),
            "confidence": round(float(confidence), 1),
            "cluster": int(cluster),
            "isolation_score": round(float(iso_score), 4),
            "pca_x": round(float(pca_coords[0]), 4),
            "pca_y": round(float(pca_coords[1]), 4),
            "features": {
                "protocol": event.get("protocol", "TCP"),
                "port": event.get("port", 80),
                "payload_entropy": event.get("payload_entropy", 4.0),
                "request_rate": event.get("request_rate", 10.0),
                "failed_logins": event.get("failed_logins", 0),
                "packet_size": event.get("packet_size", 512),
            },
        }

    def bulk_predict(self, events: List[Dict]) -> List[Dict]:
        return [self.predict(e) for e in events]

    def get_model_stats(self) -> Dict:
        return {
            "model": "Isolation Forest + K-Means Clustering",
            "n_estimators": 200,
            "n_clusters": 4,
            "contamination_rate": "15%",
            "feature_dimensions": 18,
            "training_samples": 6000,
            "threat_categories": list(THREAT_LABELS.values()),
        }
