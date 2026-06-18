"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const HeroParticles = dynamic(() => import("@/components/HeroParticles"), { ssr: false });

const THREAT_TYPES = [
  { icon: "⚡", label: "Network Intrusion", color: "#ff3355", desc: "SSH brute-force, port scanning, lateral movement detection via Isolation Forest scoring on high-dimensional network features." },
  { icon: "🦠", label: "Malware Activity", color: "#ff8800", desc: "C2 beaconing, unusual outbound traffic, and high-entropy payloads flagged through unsupervised clustering." },
  { icon: "🎣", label: "Phishing Attempts", color: "#ffdd00", desc: "Credential harvesting patterns, spoofed HTTP sequences, and anomalous login failure spikes." },
];

const STATS = [
  { value: "99.2%", label: "Detection Rate" },
  { value: "<5ms", label: "Inference Latency" },
  { value: "18-dim", label: "Feature Vector" },
  { value: "6K", label: "Training Samples" },
];

const PIPELINE_STEPS = [
  { step: "01", title: "Packet Ingestion", desc: "Raw network events captured with metadata — source IP, protocol, flags, port, packet size.", icon: "📡" },
  { step: "02", title: "Feature Extraction", desc: "18-dimensional vector: entropy, rate metrics, protocol encoding, port risk scoring, IP analysis.", icon: "🔬" },
  { step: "03", title: "Isolation Forest", desc: "Unsupervised anomaly scoring. Outlier paths in 200 random trees isolate suspicious events.", icon: "🌲" },
  { step: "04", title: "K-Means Clustering", desc: "4-cluster classification maps each anomaly to intrusion, malware, phishing, or normal bucket.", icon: "🎯" },
  { step: "05", title: "Threat Report", desc: "Confidence score, threat category, and PCA coordinates returned for real-time visualization.", icon: "📊" },
];

function TerminalBanner() {
  const lines = [
    "> Initializing CyberImmune detection engine...",
    "> Loading Isolation Forest [n_estimators=200]...",
    "> Fitting K-Means clustering [k=4]...",
    "> Feature pipeline ready [18 dimensions]...",
    "> System online. Monitoring network traffic.",
  ];
  const [visible, setVisible] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= lines.length) return;
    const t = setTimeout(() => {
      setVisible((v) => [...v, lines[idx]]);
      setIdx((i) => i + 1);
    }, 650);
    return () => clearTimeout(t);
  }, [idx]);
  return (
    <div style={{ background: "#060d14", border: "1px solid #0f2d4a", borderRadius: 10, padding: "18px 22px", fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: 1.8, minHeight: 152 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["#ff5f57", "#ffbd2e", "#28ca42"].map((c) => (<div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />))}
        <span style={{ marginLeft: 8, color: "#4a7a9b", fontSize: 11 }}>cyberimmune-engine — bash</span>
      </div>
      {visible.map((l, i) => (
        <div key={i} style={{ color: i === visible.length - 1 ? "#00ff88" : "#00d4ff", marginBottom: 2 }}>
          {l}
        </div>
      ))}
      {idx < lines.length && <span style={{ color: "#00ff88", animation: "blink 1s step-end infinite" }}>█</span>}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: "#020408", minHeight: "100vh", color: "#e2f0ff" }}>
      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 60,
        background: scrolled ? "rgba(2,4,8,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #0f2d4a" : "1px solid transparent",
        transition: "all 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #0066cc, #00aaff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛡</div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>CyberImmune<span style={{ color: "#00d4ff" }}> AI</span></span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {[["Platform", "#platform"], ["Pipeline", "#pipeline"], ["Threats", "#threats"]].map(([item, href]) => (
            <a key={item} href={href} style={{ color: "#4a7a9b", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{item}</a>
          ))}
          <Link href="/dashboard" style={{ background: "linear-gradient(135deg, #0055bb, #0099ee)", color: "white", padding: "7px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(0,153,238,0.4)" }}>
            Launch Dashboard →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="platform" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <HeroParticles />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 700, height: 700, background: "radial-gradient(circle, rgba(0,102,204,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "120px 40px 80px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 20, padding: "5px 14px", marginBottom: 28, fontSize: 12, fontWeight: 600, color: "#00d4ff", letterSpacing: "0.8px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", display: "inline-block" }} />
                LIVE THREAT DETECTION ACTIVE
              </div>
              <h1 style={{ fontSize: "clamp(36px, 4vw, 54px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.5px" }}>
                Detect Threats{" "}
                <span style={{ background: "linear-gradient(135deg, #00d4ff, #0066cc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Before They Strike</span>
              </h1>
              <p style={{ fontSize: 17, color: "#7bacc4", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
                ML-powered anomaly detection platform that identifies phishing, malware, and network intrusions in real time using Isolation Forest and K-Means clustering on live network traffic.
              </p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
                <Link href="/dashboard" style={{ background: "linear-gradient(135deg, #0055bb, #0099ee)", color: "white", padding: "13px 28px", borderRadius: 9, fontSize: 15, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(0,153,238,0.4)", boxShadow: "0 0 30px rgba(0,102,204,0.3)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Open Dashboard →
                </Link>
                <a href="#pipeline" style={{ color: "#00d4ff", padding: "13px 28px", borderRadius: 9, fontSize: 15, fontWeight: 600, textDecoration: "none", border: "1px solid rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.05)" }}>
                  How It Works
                </a>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#00d4ff", letterSpacing: "-0.5px" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#4a7a9b", fontWeight: 500, marginTop: 2, letterSpacing: "0.3px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <TerminalBanner />
              <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: "#4a7a9b", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 10 }}>LIVE THREAT FEED — SAMPLE</div>
                {[
                  { ip: "103.22.14.8",   type: "Network Intrusion", time: "0.2s ago", color: "#ff3355" },
                  { ip: "192.168.4.91",  type: "Normal Traffic",    time: "0.8s ago", color: "#00ff88" },
                  { ip: "45.77.23.19",   type: "Malware Activity",  time: "1.4s ago", color: "#ff8800" },
                  { ip: "10.0.0.45",     type: "Normal Traffic",    time: "2.1s ago", color: "#00ff88" },
                  { ip: "77.91.4.122",   type: "Phishing Attempt",  time: "3.0s ago", color: "#ffdd00" },
                ].map((row) => (
                  <div key={row.ip} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(15,45,74,0.6)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: row.color }} />
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "#7bacc4" }}>{row.ip}</span>
                    </div>
                    <span style={{ fontSize: 11, color: row.color, fontWeight: 600 }}>{row.type}</span>
                    <span style={{ fontSize: 10, color: "#4a7a9b" }}>{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Threats */}
      <section id="threats" style={{ padding: "100px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#00d4ff", letterSpacing: "1.5px", marginBottom: 14 }}>DETECTION COVERAGE</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.3px" }}>Every threat vector, classified.</h2>
          <p style={{ color: "#4a7a9b", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>Unsupervised models catch what signature-based tools miss — zero-day behavioral patterns.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {THREAT_TYPES.map((t) => (
            <div key={t.label} style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 14, padding: 28, transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = t.color + "55"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#0f2d4a"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${t.color}18`, border: `1px solid ${t.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>{t.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: t.color, marginBottom: 10 }}>{t.label}</h3>
              <p style={{ fontSize: 14, color: "#4a7a9b", lineHeight: 1.65 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section id="pipeline" style={{ padding: "100px 40px", background: "linear-gradient(180deg, transparent, rgba(0,25,60,0.3), transparent)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#00d4ff", letterSpacing: "1.5px", marginBottom: 14 }}>FEATURE EXTRACTION PIPELINE</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.3px" }}>From raw packet to threat verdict.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.step} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
                {/* Left number */}
                <div style={{ width: 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #0055bb, #00aaff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, boxShadow: "0 0 16px rgba(0,170,255,0.25)" }}>
                    {step.step}
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: "linear-gradient(180deg, rgba(0,170,255,0.4), rgba(0,170,255,0.1))", margin: "6px 0" }} />
                  )}
                </div>
                {/* Card */}
                <div style={{ flex: 1, paddingBottom: i < PIPELINE_STEPS.length - 1 ? 24 : 0, paddingLeft: 20 }}>
                  <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 12, padding: "18px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{step.icon}</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{step.title}</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#4a7a9b", lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 40px", textAlign: "center" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(0,25,80,0.8), rgba(0,15,40,0.8))", border: "1px solid #0f2d4a", borderRadius: 20, padding: "64px 40px", maxWidth: 700, margin: "0 auto", boxShadow: "0 0 60px rgba(0,102,204,0.1)" }}>
          <div style={{ fontSize: 12, color: "#00d4ff", fontWeight: 600, letterSpacing: "1.5px", marginBottom: 20 }}>READY TO MONITOR</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.3px" }}>Analyze your network in real time.</h2>
          <p style={{ color: "#4a7a9b", fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>Submit network events, run bulk traffic simulations, and watch the ML pipeline classify threats with confidence scores and scatter plot visualization.</p>
          <Link href="/dashboard" style={{ background: "linear-gradient(135deg, #0055bb, #0099ee)", color: "white", padding: "14px 36px", borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 40px rgba(0,102,204,0.35)", display: "inline-flex", alignItems: "center", gap: 10 }}>
            Launch Platform →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #0f2d4a", padding: "28px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#4a7a9b", fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🛡</span>
          <strong style={{ color: "#e2f0ff" }}>CyberImmune AI</strong>
          <span>— Anomaly Detection Platform</span>
        </div>
        <span>Isolation Forest · K-Means · FastAPI · Next.js</span>
      </footer>
    </div>
  );
}
