import numpy as np
from dataclasses import dataclass
from typing import Dict, Any


@dataclass
class NetworkEvent:
    src_ip: str
    dst_ip: str
    protocol: str
    packet_size: int
    duration_ms: float
    port: int
    flags: str
    payload_entropy: float
    request_rate: float
    failed_logins: int


PROTOCOL_MAP = {"TCP": 0, "UDP": 1, "ICMP": 2, "HTTP": 3, "HTTPS": 4, "DNS": 5, "FTP": 6, "SSH": 7}
FLAG_MAP = {"SYN": 1, "ACK": 2, "FIN": 3, "RST": 4, "PSH": 5, "URG": 6, "SYN-ACK": 7, "NONE": 0}

SUSPICIOUS_PORTS = {22, 23, 3389, 4444, 6666, 1337, 8080, 9999, 31337}
COMMON_PORTS = {80, 443, 53, 25, 110, 143, 993, 995, 587}


def extract_features(event: Dict[str, Any]) -> np.ndarray:
    protocol_enc = PROTOCOL_MAP.get(event.get("protocol", "TCP"), 0)
    flag_enc = FLAG_MAP.get(event.get("flags", "NONE"), 0)

    port = event.get("port", 80)
    is_suspicious_port = 1 if port in SUSPICIOUS_PORTS else 0
    is_common_port = 1 if port in COMMON_PORTS else 0
    port_normalized = min(port / 65535.0, 1.0)

    packet_size = event.get("packet_size", 512)
    packet_size_norm = min(packet_size / 65535.0, 1.0)
    large_packet = 1 if packet_size > 1400 else 0

    duration = event.get("duration_ms", 100.0)
    duration_norm = min(duration / 10000.0, 1.0)

    entropy = min(event.get("payload_entropy", 4.0) / 8.0, 1.0)
    high_entropy = 1 if entropy > 0.875 else 0  # > 7.0 bits

    req_rate = event.get("request_rate", 10.0)
    req_rate_norm = min(req_rate / 1000.0, 1.0)
    high_rate = 1 if req_rate > 100 else 0

    failed_logins = event.get("failed_logins", 0)
    failed_norm = min(failed_logins / 50.0, 1.0)
    brute_force_flag = 1 if failed_logins > 10 else 0

    src_ip = event.get("src_ip", "0.0.0.0")
    src_octets = [int(x) / 255.0 for x in src_ip.split(".")][:4]
    if len(src_octets) < 4:
        src_octets += [0.0] * (4 - len(src_octets))

    features = np.array([
        protocol_enc / 7.0,
        flag_enc / 7.0,
        port_normalized,
        is_suspicious_port,
        is_common_port,
        packet_size_norm,
        large_packet,
        duration_norm,
        entropy,
        high_entropy,
        req_rate_norm,
        high_rate,
        failed_norm,
        brute_force_flag,
        *src_octets,
    ], dtype=np.float32)

    return features


def generate_synthetic_training_data(n_samples: int = 5000) -> np.ndarray:
    rng = np.random.default_rng(42)
    normal_traffic = []

    for _ in range(int(n_samples * 0.85)):
        protocol = rng.choice([3, 4, 5])  # HTTP, HTTPS, DNS
        flag = rng.choice([1, 2, 7])
        port = rng.choice([80, 443, 53, 25, 110])
        packet_size = rng.integers(64, 1460)
        duration = rng.exponential(200)
        entropy = rng.normal(4.5, 0.8)
        req_rate = rng.exponential(15)
        failed = rng.integers(0, 3)
        src = [rng.integers(1, 255), rng.integers(0, 255), rng.integers(0, 255), rng.integers(1, 255)]

        sample = np.array([
            protocol / 7.0,
            flag / 7.0,
            port / 65535.0,
            0.0,
            1.0,
            packet_size / 65535.0,
            0.0,
            min(duration / 10000.0, 1.0),
            min(abs(entropy) / 8.0, 1.0),
            0.0,
            min(req_rate / 1000.0, 1.0),
            0.0,
            failed / 50.0,
            0.0,
            src[0] / 255.0,
            src[1] / 255.0,
            src[2] / 255.0,
            src[3] / 255.0,
        ], dtype=np.float32)
        normal_traffic.append(sample)

    # Anomalous samples — high entropy, suspicious ports, brute force
    for _ in range(int(n_samples * 0.15)):
        protocol = rng.choice([0, 6, 7])
        flag = rng.choice([3, 4, 6])
        port = rng.choice(list(SUSPICIOUS_PORTS))
        packet_size = rng.integers(1400, 65535)
        duration = rng.exponential(5)
        entropy = rng.uniform(6.5, 8.0)
        req_rate = rng.uniform(200, 1000)
        failed = rng.integers(10, 50)
        src = [rng.integers(1, 255), rng.integers(0, 255), rng.integers(0, 255), rng.integers(1, 255)]

        sample = np.array([
            protocol / 7.0,
            flag / 7.0,
            port / 65535.0,
            1.0,
            0.0,
            packet_size / 65535.0,
            1.0,
            min(duration / 10000.0, 1.0),
            min(entropy / 8.0, 1.0),
            1.0,
            min(req_rate / 1000.0, 1.0),
            1.0,
            failed / 50.0,
            1.0,
            src[0] / 255.0,
            src[1] / 255.0,
            src[2] / 255.0,
            src[3] / 255.0,
        ], dtype=np.float32)
        normal_traffic.append(sample)

    return np.array(normal_traffic)
