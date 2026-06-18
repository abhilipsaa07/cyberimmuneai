interface Props {
  label: string;
  size?: "sm" | "md";
}

const config: Record<string, { bg: string; color: string; border: string }> = {
  "Normal Traffic":    { bg: "rgba(0,255,136,0.1)",  color: "#00ff88", border: "rgba(0,255,136,0.3)" },
  "Network Intrusion": { bg: "rgba(255,51,85,0.12)",  color: "#ff3355", border: "rgba(255,51,85,0.35)" },
  "Malware Activity":  { bg: "rgba(255,136,0,0.12)",  color: "#ff8800", border: "rgba(255,136,0,0.35)" },
  "Phishing Attempt":  { bg: "rgba(255,221,0,0.12)",  color: "#ffdd00", border: "rgba(255,221,0,0.35)" },
};

export default function ThreatBadge({ label, size = "sm" }: Props) {
  const c = config[label] ?? config["Normal Traffic"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: size === "md" ? "4px 12px" : "2px 9px",
      borderRadius: 20,
      fontSize: size === "md" ? 12 : 10,
      fontWeight: 700,
      letterSpacing: "0.6px",
      textTransform: "uppercase",
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color, display: "inline-block" }} />
      {label}
    </span>
  );
}
