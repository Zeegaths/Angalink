"use client";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const STEPS = [
  { n: "01", title: "Link Wallet",    desc: "Connect your Solana wallet to establish your identity and contribution history." },
  { n: "02", title: "Verify Activity", desc: "Our protocol indexes your on-chain contributions across Superteam, GitHub, and Solana programs." },
  { n: "03", title: "Earn Credits",   desc: "Every bounty, hackathon, and grant milestone converts into ANGA travel credits." },
  { n: "04", title: "Redeem & Fly",   desc: "Apply credits at checkout. The more you build, the cheaper it is to move." },
];

export default function LandingPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [eliteHovered, setEliteHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { if (publicKey) router.push("/routes"); }, [publicKey]);

  return (
    <main style={{ background: "#0d0704", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .cta-primary { transition: all 0.15s; }
        .cta-primary:hover { background: #FFA552 !important; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(186,86,36,0.45) !important; }
        .cta-secondary { transition: all 0.15s; }
        .cta-secondary:hover { border-color: rgba(252,222,156,0.4) !important; color: rgba(252,222,156,0.9) !important; }
        .feature-card { transition: border-color 0.2s, background 0.2s; }
        .feature-card:hover { border-color: rgba(255,165,82,0.2) !important; }
        .elite-card { transition: all 0.2s; cursor: pointer; }
        .elite-card:hover { border-color: rgba(255,165,82,0.6) !important; box-shadow: 0 0 40px rgba(186,86,36,0.2) !important; transform: translateY(-2px); }
        .step-circle { transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        padding: isMobile ? "18px 24px" : "22px 64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        maxWidth: "1280px", margin: "0 auto",
        position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          
          <img src="/logo.png" alt="Angalink" style={{ height: "28px", objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {!isMobile && (
            <>
              <button onClick={() => router.push("/routes")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B7280" }}>Routes</button>
              <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B7280" }}>Dashboard</button>
            </>
          )}
          {mounted && <WalletMultiButton />}
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        maxWidth: "1280px",
        margin: "0 auto",
        minHeight: isMobile ? "auto" : "700px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center",
        overflow: "hidden",
      }}>

        {/* Plane image — right side, desktop only */}
        {!isMobile && (
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "58%", zIndex: 0 }}>
            <Image
              src="/plane2.png"
              alt=""
              fill
              priority
              style={{
                objectFit: "cover",
                objectPosition: "center center",
                opacity: 0.55,
                filter: "saturate(1.3) contrast(1.05)",
              }}
            />
            {/* Left soft fade */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #0d0704 0%, rgba(13,7,4,0.85) 20%, rgba(13,7,4,0.3) 55%, rgba(13,7,4,0.4) 100%)" }} />
            {/* Top fade */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #0d0704 0%, transparent 8%, transparent 92%, #0d0704 100%)" }} />
            {/* Warm glow */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 50%, rgba(186,86,36,0.12) 0%, transparent 60%)" }} />
          </div>
        )}

        {/* Left: text content */}
        <div style={{
          position: "relative", zIndex: 2,
          flex: isMobile ? "none" : "0 0 52%",
          padding: isMobile ? "64px 24px 48px" : "0 64px",
          animation: "fadeUp 0.6s ease",
        }}>

          {/* Solana pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px",
            border: "1px solid rgba(196,214,176,0.35)",
            borderRadius: "20px",
            marginBottom: "40px",
            background: "rgba(196,214,176,0.04)",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C4D6B0", display: "inline-block", boxShadow: "0 0 8px #C4D6B0" }} />
            <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C4D6B0" }}>Powered by Solana</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "Georgia, serif",
            fontSize: isMobile ? "76px" : "96px",
            lineHeight: "0.92",
            fontWeight: "bold",
            marginBottom: "28px",
            letterSpacing: "-0.02em",
            background: "linear-gradient(155deg, #FCDE9C 0%, #FFA552 40%, #BA5624 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 40px rgba(255,140,60,0.4))",
          }}>
            Build<br />to Fly
          </h1>

          {/* Subtext */}
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: isMobile ? "16px" : "18px",
            lineHeight: "1.85",
            color: "#D1D5DB",
            maxWidth: "400px",
            marginBottom: "48px",
          }}>
            Earn travel credits from your on-chain contributions. Fly to conferences, meet builders, and move across emerging markets — without fundraising.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            {mounted && <WalletMultiButton />}
            <button
              className="cta-secondary"
              onClick={() => router.push("/routes")}
              style={{
                padding: "13px 26px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                fontFamily: "Arial Narrow, Arial, sans-serif",
                fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(252,222,156,0.5)",
                cursor: "pointer",
              }}>Browse Routes</button>
          </div>
        </div>

        {/* Mobile plane image */}
        {isMobile && (
          <div style={{ width: "100%", height: "260px", position: "relative", overflow: "hidden" }}>
            <Image
              src="/plane2.png"
              alt=""
              fill
              style={{
                objectFit: "cover",
                objectPosition: "center 40%",
                opacity: 0.6,
                filter: "saturate(1.3)",
              }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #0d0704 0%, transparent 20%, transparent 75%, #0d0704 100%)" }} />
          </div>
        )}
      </section>

      {/* ── Stats ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", animation: "fadeUp 0.5s ease 0.1s both" }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "repeat(3, 1fr)",
          padding: isMobile ? "44px 24px" : "56px 64px",
        }}>
          {[
            { value: "12+",  label: "Active routes",   color: "#FFA552" },
            { value: "3K+",  label: "Builders onboard",color: "#C4D6B0" },
            { value: "0%",   label: "Platform fees",   color: "#FFA552" },
          ].map((stat, i) => (
            <div key={stat.label} style={{ textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "36px" : "52px", color: stat.color, fontWeight: "bold", marginBottom: "6px", textShadow: `0 0 30px ${stat.color}44` }}>{stat.value}</p>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#4B5563" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature cards ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "64px 20px" : "96px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "16px" }}>

          {/* Card 1 */}
          <div className="feature-card" style={{
            padding: "36px 32px",
            background: "rgba(255,255,255,0.025)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.07)",
            animation: "fadeUp 0.5s ease 0.15s both",
          }}>
            <div style={{ fontSize: "28px", marginBottom: "20px" }}>🌍</div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "21px", color: "#FCDE9C", fontWeight: "bold", marginBottom: "14px" }}>Global Coverage</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#9CA3AF", lineHeight: "1.85" }}>
              Starting in Africa, expanding across Asia, Latin America, and every emerging market where builders ship.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card" style={{
            padding: "36px 32px",
            background: "rgba(255,255,255,0.025)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.07)",
            animation: "fadeUp 0.5s ease 0.2s both",
          }}>
            <div style={{ fontSize: "28px", marginBottom: "20px" }}>⬡</div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "21px", color: "#FCDE9C", fontWeight: "bold", marginBottom: "14px" }}>Proof of Contribution</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#9CA3AF", lineHeight: "1.85" }}>
              Your on-chain activity and ecosystem work convert directly into travel credits. No miles. No points programs. Just code.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "22px", padding: "7px 14px", border: "1px solid rgba(196,214,176,0.25)", borderRadius: "20px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C4D6B0", display: "inline-block", boxShadow: "0 0 8px #C4D6B066" }} />
              <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#C4D6B0" }}>Live indexing</span>
            </div>
          </div>

          {/* Card 3 — Elite, clickable */}
          <div
            className="elite-card"
            onClick={() => router.push("/dashboard")}
            style={{
              borderRadius: "20px",
              border: "1px solid rgba(255,165,82,0.35)",
              position: "relative",
              overflow: "hidden",
              minHeight: "280px",
              animation: "fadeUp 0.5s ease 0.25s both",
              boxShadow: "0 0 30px rgba(186,86,36,0.1)",
            }}
          >
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
              <Image
                src="/plane2.png"
                alt=""
                fill
                style={{ objectFit: "cover", objectPosition: "right center", opacity: 0.35, filter: "saturate(1.2)" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(13,7,4,0.94) 40%, rgba(45,20,8,0.75) 100%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at bottom left, rgba(255,100,30,0.12) 0%, transparent 60%)" }} />
            </div>
            <div style={{ position: "relative", zIndex: 1, padding: "36px 32px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "inline-block", padding: "5px 12px", background: "#BA5624", borderRadius: "5px", marginBottom: "22px", boxShadow: "0 0 20px rgba(186,86,36,0.4)" }}>
                  <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#0d0704", fontWeight: "bold" }}>Elite Status</span>
                </div>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "21px", color: "#FCDE9C", fontWeight: "bold", marginBottom: "14px" }}>Digital Savannah Protocol</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#9CA3AF", lineHeight: "1.85" }}>
                  Premium routes for verified ecosystem builders worldwide. Earn your tier through contributions.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px" }}>
                <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#FFA552" }}>View my status</span>
                <span style={{ color: "#FFA552", fontSize: "14px" }}>→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "64px 20px 80px" : "96px 64px 100px" }}>

          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "48px" : "80px", alignItems: "flex-start" }}>

            {/* Left label */}
            <div style={{ flexShrink: 0, maxWidth: isMobile ? "100%" : "300px" }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4D6B0", marginBottom: "16px" }}>How it works</p>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "34px" : "44px", color: "#FCDE9C", fontWeight: "bold", lineHeight: "1.1", marginBottom: "20px" }}>
                Engineered<br />for Builders
              </h2>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#6B7280", lineHeight: "1.8" }}>
                Four steps from wallet to window seat.
              </p>
            </div>

            {/* Steps */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {STEPS.map((step, i) => (
                <div key={step.n} style={{
                  display: "flex", gap: "24px",
                  paddingBottom: i < 3 ? "40px" : 0,
                  position: "relative",
                  animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s both`,
                }}>
                  {i < 3 && (
                    <div style={{ position: "absolute", left: "19px", top: "42px", bottom: 0, width: "1px", background: "linear-gradient(to bottom, rgba(255,165,82,0.2), transparent)" }} />
                  )}
                  <div className="step-circle" style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    border: "1px solid rgba(255,165,82,0.3)",
                    background: "rgba(255,165,82,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: "12px", color: "#FFA552" }}>{step.n}</span>
                  </div>
                  <div style={{ paddingTop: "6px" }}>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "19px", color: "#FCDE9C", fontWeight: "bold", marginBottom: "8px" }}>{step.title}</p>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#6B7280", lineHeight: "1.8" }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.25em", color: "#1e1008", textTransform: "uppercase", textAlign: "center", marginTop: "72px" }}>ANGALINK V 1.0</p>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
