"use client";
import { useRouter, usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const LINKS = [
  { label: "Routes", path: "/routes" },
  { label: "Dashboard", path: "/dashboard" },
];

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isHome = pathname === "/";

  return (
    <header style={{
      padding: isMobile ? "16px 20px" : "20px 64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(13,7,4,0.95)",
      backdropFilter: "blur(12px)",
      maxWidth: "100%",
    }}>
      {/* Logo + back */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {!isHome && (
          <button
            onClick={() => router.back()}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "Arial Narrow, Arial, sans-serif",
              fontSize: "18px", color: "#4B5563",
              display: "flex", alignItems: "center",
              padding: "4px 8px 4px 0",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FFA552")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4B5563")}
          >←</button>
        )}
        <button
          onClick={() => router.push("/")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "10px" }}
        >
          <img src="/logo.png" alt="Angalink" style={{ height: "30px", objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "17px", color: "#FCDE9C", letterSpacing: "0.08em" }}>Angalink</span>
        </button>
      </div>

      {/* Desktop nav links */}
      {!isMobile && (
        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {LINKS.map((link) => {
            const active = pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "Arial Narrow, Arial, sans-serif",
                  fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase",
                  color: active ? "#FFA552" : "#6B7280",
                  borderBottom: active ? "1px solid #FFA552" : "1px solid transparent",
                  paddingBottom: "2px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#9CA3AF"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#6B7280"; }}
              >{link.label}</button>
            );
          })}
        </nav>
      )}

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {mounted && <WalletMultiButton />}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#6B7280", fontSize: "20px", padding: "4px",
            }}
          >{menuOpen ? "✕" : "☰"}</button>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "rgba(13,7,4,0.98)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: "4px",
          zIndex: 100,
        }}>
          {LINKS.map((link) => {
            const active = pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => { router.push(link.path); setMenuOpen(false); }}
                style={{
                  background: active ? "rgba(255,165,82,0.08)" : "none",
                  border: "none", cursor: "pointer",
                  fontFamily: "Arial Narrow, Arial, sans-serif",
                  fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase",
                  color: active ? "#FFA552" : "#9CA3AF",
                  padding: "14px 16px", borderRadius: "8px",
                  textAlign: "left",
                }}
              >{link.label}</button>
            );
          })}
        </div>
      )}
    </header>
  );
}
