"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";
import ThreatBadge from "@/components/ThreatBadge";

const API = "https://cyberimmuneai.onrender.com/api";

const THREAT_COLORS: Record<string, string> = {
  "Normal Traffic": "#00ff88",
  "Network Intrusion": "#ff3355",
  "Malware Activity": "#ff8800",
  "Phishing Attempt": "#ffdd00",
};

interface ThreatResult {
  threat_label: string;
  threat_color: string;
  is_anomaly: boolean;
  anomaly_score: number;
  isolation_score: number;
  confidence: number;
  cluster: number;
  pca_x: number;
  pca_y: number;
  features: Record<string, string | number>;
}

interface SimEvent {
  src_ip: string;
  protocol: string;
  port: number;
  payload_entropy: number;
  request_rate: number;
  failed_logins: number;
  packet_size: number;
}

interface SimRow {
  event: SimEvent;
  result: ThreatResult;
}

const defaultForm = {
  src_ip: "192.168.1.100",
  dst_ip: "10.0.0.1",
  protocol: "TCP",
  packet_size: 512,
  duration_ms: 100,
  port: 80,
  flags: "SYN",
  payload_entropy: 4.0,
  request_rate: 10,
  failed_logins: 0,
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 12, padding: "20px 22px" }}>
      <div style={{ fontSize: 11, color: "#4a7a9b", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color ?? "#e2f0ff", letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#4a7a9b", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ background: "#060d14", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${score * 100}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" }} />
    </div>
  );
}

export default function DashboardPage() {
  const [form, setForm] = useState(defaultForm);
  const [singleResult, setSingleResult] = useState<ThreatResult | null>(null);
  const [simRows, setSimRows] = useState<SimRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "simulate">("simulate");

  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  const runSim = useCallback(async () => {
    setSimLoading(true);
    try {
      const r = await fetch(`${API}/simulate/stream?n=30`);
      const data = await r.json();
      const rows: SimRow[] = data.events.map((ev: SimEvent, i: number) => ({ event: ev, result: data.results[i] }));
      setSimRows(rows);
    } catch {
      alert("Could not connect to backend. Make sure the FastAPI server is running on port 8000.");
    }
    setSimLoading(false);
  }, []);

  useEffect(() => { runSim(); }, [runSim]);

  const analyze = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await r.json();
      setSingleResult(data.result);
    } catch {
      alert("Backend not reachable.");
    }
    setLoading(false);
  };

  const anomalies = simRows.filter((r) => r.result.is_anomaly);
  const threatBreakdown = simRows.reduce<Record<string, number>>((acc, r) => {
    acc[r.result.threat_label] = (acc[r.result.threat_label] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(threatBreakdown).map(([name, value]) => ({ name, value }));
  const scatterData = simRows.map((r) => ({ x: r.result.pca_x, y: r.result.pca_y, label: r.result.threat_label, color: r.result.threat_color }));
  const avgScore = simRows.length ? (simRows.reduce((s, r) => s + r.result.anomaly_score, 0) / simRows.length).toFixed(3) : "—";

  return (
    <div style={{ background: "#020408", minHeight: "100vh", color: "#e2f0ff" }}>
      {/* Top bar */}
      <header style={{ background: "#060d14", borderBottom: "1px solid #0f2d4a", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ color: "#4a7a9b", fontSize: 13, textDecoration: "none" }}>← Home</Link>
          <span style={{ color: "#0f2d4a" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🛡</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>CyberImmune <span style={{ color: "#00d4ff" }}>AI</span></span>
            <span style={{ color: "#4a7a9b", fontSize: 13 }}>/ Dashboard</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: backendOk === true ? "#00ff88" : backendOk === false ? "#ff3355" : "#ffdd00" }} />
            <span style={{ color: "#4a7a9b" }}>
              {backendOk === true ? "Backend connected" : backendOk === false ? "Backend offline" : "Connecting..."}
            </span>
          </div>
          <button onClick={runSim} disabled={simLoading} style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", padding: "6px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {simLoading ? "Running..." : "↻ Refresh Sim"}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 32px" }}>
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          <StatCard label="TOTAL EVENTS" value={simRows.length} sub="from simulation" />
          <StatCard label="ANOMALIES" value={anomalies.length} sub={`${simRows.length ? Math.round(anomalies.length / simRows.length * 100) : 0}% of traffic`} color="#ff3355" />
          <StatCard label="AVG ANOMALY SCORE" value={avgScore} sub="0 = normal, 1 = extreme" color="#ff8800" />
          <StatCard label="CLUSTERS" value="4" sub="K-Means classification" color="#00d4ff" />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* PCA Scatter */}
          <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 11, color: "#4a7a9b", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 16 }}>PCA CLUSTER MAP — 2D PROJECTION</div>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart>
                <CartesianGrid stroke="#0f2d4a" strokeDasharray="3 3" />
                <XAxis dataKey="x" stroke="#1a3a5c" tick={{ fill: "#4a7a9b", fontSize: 10 }} name="PC1" />
                <YAxis dataKey="y" stroke="#1a3a5c" tick={{ fill: "#4a7a9b", fontSize: 10 }} name="PC2" />
                <Tooltip
                  cursor={{ stroke: "#00d4ff", strokeWidth: 1 }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload as { label: string; color: string; x: number; y: number };
                    return (
                      <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                        <div style={{ color: d.color, fontWeight: 700 }}>{d.label}</div>
                        <div style={{ color: "#4a7a9b" }}>PC1: {d.x.toFixed(3)}</div>
                        <div style={{ color: "#4a7a9b" }}>PC2: {d.y.toFixed(3)}</div>
                      </div>
                    );
                  }}
                />
                {["Normal Traffic", "Network Intrusion", "Malware Activity", "Phishing Attempt"].map((label) => (
                  <Scatter
                    key={label}
                    name={label}
                    data={scatterData.filter((d) => d.label === label)}
                    fill={THREAT_COLORS[label]}
                    fillOpacity={0.75}
                    r={5}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
              {Object.entries(THREAT_COLORS).map(([label, color]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#4a7a9b" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Pie + Bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 12, padding: "20px 24px", flex: 1 }}>
              <div style={{ fontSize: 11, color: "#4a7a9b", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 10 }}>THREAT DISTRIBUTION</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={pieData} margin={{ top: 0, bottom: 0, left: -20, right: 0 }}>
                  <CartesianGrid stroke="#0f2d4a" strokeDasharray="2 2" />
                  <XAxis dataKey="name" tick={{ fill: "#4a7a9b", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#4a7a9b", fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" radius={4}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={THREAT_COLORS[entry.name] ?? "#4a7a9b"} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "#4a7a9b", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 12 }}>BREAKDOWN</div>
              {Object.entries(threatBreakdown).map(([label, count]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: THREAT_COLORS[label] ?? "#e2f0ff", fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 12, color: "#4a7a9b" }}>{count} / {simRows.length}</span>
                  </div>
                  <ScoreBar score={simRows.length ? count / simRows.length : 0} color={THREAT_COLORS[label] ?? "#4a7a9b"} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 0, borderBottom: "1px solid #0f2d4a" }}>
          {(["simulate", "analyze"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "10px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: "transparent", border: "none",
              borderBottom: activeTab === tab ? "2px solid #00d4ff" : "2px solid transparent",
              color: activeTab === tab ? "#00d4ff" : "#4a7a9b",
              textTransform: "capitalize",
              transition: "color 0.2s",
            }}>
              {tab === "simulate" ? "Simulation Feed" : "Manual Analysis"}
            </button>
          ))}
        </div>

        {activeTab === "simulate" && (
          <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #0f2d4a" }}>
                    {["Source IP", "Protocol", "Port", "Entropy", "Req/s", "Failed", "Threat", "Confidence", "Score"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#4a7a9b", fontWeight: 600, fontSize: 10, letterSpacing: "0.8px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {simRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(15,45,74,0.5)", background: row.result.is_anomaly ? "rgba(255,51,85,0.03)" : "transparent", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,212,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = row.result.is_anomaly ? "rgba(255,51,85,0.03)" : "transparent")}
                    >
                      <td style={{ padding: "9px 16px", fontFamily: "monospace", color: "#7bacc4" }}>{row.event.src_ip}</td>
                      <td style={{ padding: "9px 16px", color: "#e2f0ff" }}>{row.event.protocol}</td>
                      <td style={{ padding: "9px 16px", color: "#e2f0ff" }}>{row.event.port}</td>
                      <td style={{ padding: "9px 16px", color: row.event.payload_entropy > 6.5 ? "#ff8800" : "#e2f0ff" }}>{row.event.payload_entropy.toFixed(2)}</td>
                      <td style={{ padding: "9px 16px", color: row.event.request_rate > 100 ? "#ff3355" : "#e2f0ff" }}>{row.event.request_rate.toFixed(1)}</td>
                      <td style={{ padding: "9px 16px", color: row.event.failed_logins > 10 ? "#ff3355" : "#e2f0ff" }}>{row.event.failed_logins}</td>
                      <td style={{ padding: "9px 16px" }}><ThreatBadge label={row.result.threat_label} /></td>
                      <td style={{ padding: "9px 16px", color: "#4a7a9b" }}>{row.result.confidence.toFixed(1)}%</td>
                      <td style={{ padding: "9px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 60, background: "#060d14", borderRadius: 3, height: 5 }}>
                            <div style={{ width: `${row.result.anomaly_score * 100}%`, height: "100%", background: row.result.threat_color, borderRadius: 3 }} />
                          </div>
                          <span style={{ color: "#4a7a9b", fontSize: 11 }}>{row.result.anomaly_score.toFixed(3)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analyze" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: "24px 0" }}>
            {/* Form */}
            <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 11, color: "#4a7a9b", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 20 }}>NETWORK EVENT INPUT</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { key: "src_ip", label: "Source IP", type: "text" },
                  { key: "dst_ip", label: "Destination IP", type: "text" },
                  { key: "protocol", label: "Protocol", type: "select", options: ["TCP", "UDP", "HTTP", "HTTPS", "DNS", "SSH", "FTP", "ICMP"] },
                  { key: "flags", label: "Flags", type: "select", options: ["SYN", "ACK", "FIN", "RST", "SYN-ACK", "PSH", "NONE"] },
                  { key: "port", label: "Port", type: "number" },
                  { key: "packet_size", label: "Packet Size (B)", type: "number" },
                  { key: "payload_entropy", label: "Payload Entropy (0-8)", type: "number" },
                  { key: "request_rate", label: "Request Rate (/s)", type: "number" },
                  { key: "duration_ms", label: "Duration (ms)", type: "number" },
                  { key: "failed_logins", label: "Failed Logins", type: "number" },
                ].map(({ key, label, type, options }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 11, color: "#4a7a9b", marginBottom: 5, fontWeight: 600 }}>{label}</label>
                    {type === "select" ? (
                      <select value={String(form[key as keyof typeof form])} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        style={{ width: "100%", background: "#060d14", border: "1px solid #0f2d4a", borderRadius: 7, padding: "8px 10px", color: "#e2f0ff", fontSize: 13, outline: "none" }}>
                        {options!.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={String(form[key as keyof typeof form])}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                        style={{ width: "100%", background: "#060d14", border: "1px solid #0f2d4a", borderRadius: 7, padding: "8px 10px", color: "#e2f0ff", fontSize: 13, outline: "none" }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={analyze} disabled={loading} style={{ flex: 1, background: "linear-gradient(135deg, #0055bb, #0099ee)", color: "white", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  {loading ? "Analyzing..." : "Analyze Event"}
                </button>
                <button onClick={() => setForm(defaultForm)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #0f2d4a", color: "#4a7a9b", borderRadius: 8, padding: "11px 16px", cursor: "pointer", fontSize: 13 }}>
                  Reset
                </button>
              </div>

              {/* Presets */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, color: "#4a7a9b", fontWeight: 600, marginBottom: 8, letterSpacing: "0.5px" }}>QUICK PRESETS</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "SSH Brute", color: "#ff3355", values: { protocol: "SSH", port: 22, failed_logins: 35, request_rate: 400, payload_entropy: 3.5 } },
                    { label: "C2 Beacon", color: "#ff8800", values: { protocol: "TCP", port: 4444, payload_entropy: 7.5, request_rate: 250, packet_size: 48000 } },
                    { label: "Phishing", color: "#ffdd00", values: { protocol: "HTTP", port: 8080, failed_logins: 8, request_rate: 120, payload_entropy: 6.2 } },
                    { label: "Normal", color: "#00ff88", values: { protocol: "HTTPS", port: 443, payload_entropy: 4.0, request_rate: 12, failed_logins: 0 } },
                  ].map((preset) => (
                    <button key={preset.label} onClick={() => setForm((f) => ({ ...f, ...preset.values }))} style={{ background: `${preset.color}12`, border: `1px solid ${preset.color}40`, color: preset.color, borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result */}
            <div>
              {singleResult ? (
                <div style={{ background: "#0a1628", border: `1px solid ${singleResult.threat_color}40`, borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 11, color: "#4a7a9b", fontWeight: 600, letterSpacing: "0.8px", marginBottom: 20 }}>ANALYSIS RESULT</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: `${singleResult.threat_color}18`, border: `1px solid ${singleResult.threat_color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                      {singleResult.threat_label === "Normal Traffic" ? "✅" : singleResult.threat_label === "Network Intrusion" ? "⚡" : singleResult.threat_label === "Malware Activity" ? "🦠" : "🎣"}
                    </div>
                    <div>
                      <ThreatBadge label={singleResult.threat_label} size="md" />
                      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: singleResult.threat_color }}>{singleResult.confidence.toFixed(1)}% confidence</div>
                    </div>
                  </div>

                  {[
                    { label: "Anomaly Score", value: singleResult.anomaly_score.toFixed(4), bar: singleResult.anomaly_score },
                    { label: "Isolation Score", value: singleResult.isolation_score.toFixed(4), bar: Math.max(0, -singleResult.isolation_score) },
                  ].map((m) => (
                    <div key={m.label} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: "#4a7a9b" }}>{m.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#e2f0ff" }}>{m.value}</span>
                      </div>
                      <ScoreBar score={m.bar} color={singleResult.threat_color} />
                    </div>
                  ))}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
                    {Object.entries(singleResult.features).map(([k, v]) => (
                      <div key={k} style={{ background: "#060d14", border: "1px solid #0f2d4a", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, color: "#4a7a9b", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 3, textTransform: "uppercase" }}>{k.replace(/_/g, " ")}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#e2f0ff" }}>{typeof v === "number" ? v.toFixed(2) : v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16, padding: "12px 16px", background: "#060d14", border: "1px solid #0f2d4a", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "#4a7a9b", fontWeight: 600, marginBottom: 6, letterSpacing: "0.5px" }}>PCA POSITION</div>
                    <div style={{ fontSize: 12, color: "#7bacc4", fontFamily: "monospace" }}>PC1: {singleResult.pca_x.toFixed(4)} &nbsp; PC2: {singleResult.pca_y.toFixed(4)} &nbsp; Cluster: {singleResult.cluster}</div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#0a1628", border: "1px solid #0f2d4a", borderRadius: 12, padding: 40, textAlign: "center", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div style={{ fontSize: 40 }}>🔍</div>
                  <div style={{ color: "#4a7a9b", fontSize: 14 }}>Submit a network event to get a threat classification result.</div>
                  <div style={{ color: "#2a5a7a", fontSize: 12 }}>Use a preset above or fill in custom values.</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
