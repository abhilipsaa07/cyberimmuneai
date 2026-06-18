import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberImmune AI — Anomaly Detection Platform",
  description: "Real-time threat detection for phishing, malware, and network intrusion using unsupervised ML.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#020408", color: "#e2f0ff", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
