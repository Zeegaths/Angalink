"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import BottomNav from "@/components/BottomNav";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ACTIVITY_LABELS: Record<string, { label: string; icon: string }> = {
  BOUNTY:    { label: "Bounty Completed",     icon: "⬡" },
  HACKATHON: { label: "Hackathon Shipped",    icon: "⚡" },
  PLACEMENT: { label: "Hackathon Placed",     icon: "✦" },
  GRANT:     { label: "Grant Milestone",      icon: "◈" },
  ONCHAIN:   { label: "Protocol Integration", icon: "⬡" },
};

const TIER_COLOR: Record<string, string> = {
  COMMUNITY: "#C4D6B0",
  BUILDER:   "#FFA552",
  CORE:      "#FFA552",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  PENDING:   { label: "Awaiting Departure", color: "#FFA552", bg: "rgba(255,165,82,0.08)",  border: "rgba(255,165,82,0.25)",   icon: "⏳" },
  CONFIRMED: { label: "Departure Confirmed", color: "#C4D6B0", bg: "rgba(196,214,176,0.08)", border: "rgba(196,214,176,0.25)", icon: "✈" },
  RELEASED:  { label: "Funds Released",      color: "#C4D6B0", bg: "rgba(196,214,176,0.08)", border: "rgba(196,214,176,0.25)", icon: "✓" },
  REFUNDED:  { label: "Refunded",            color: "#9CA3AF", bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.25)", icon: "↩" },
};

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [credits, setCredits] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [showGithub, setShowGithub] = useState(false);
  const [showDiscord, setShowDiscord] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [discordInput, setDiscordInput] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchData = (wallet: string) => {
    axios.get(`${API}/credits/${wallet}`).then((r) => setCredits(r.data));
    axios.get(`${API}/bookings/${wallet}`).then((r) => setBookings(r.data));
    axios.get(`${API}/social/${wallet}`).then((r) => setConnections(r.data));
  };

  useEffect(() => {
    if (!publicKey) return;
    fetchData(publicKey.toBase58());
  }, [publicKey]);

  // Poll bookings every 5 seconds to show live status updates
  useEffect(() => {
    if (!publicKey) return;
    const interval = setInterval(() => {
      axios.get(`${API}/bookings/${publicKey.toBase58()}`).then((r) => setBookings(r.data));
    }, 5000);
    return () => clearInterval(interval);
  }, [publicKey]);

  async function handleSync() {
    if (!publicKey) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      setSyncMsg("Checking Solana RPC...");
      await new Promise((r) => setTimeout(r, 800));
      setSyncMsg("Scanning ecosystem payments...");
      await new Promise((r) => setTimeout(r, 900));
      setSyncMsg("Indexing Superteam Earn...");
      await axios.post(`${API}/credits/verify`, { wallet: publicKey.toBase58() });
      await new Promise((r) => setTimeout(r, 700));
      setSyncMsg("Updating score...");
      await new Promise((r) => setTimeout(r, 500));
      fetchData(publicKey.toBase58());
      setSyncMsg("Score updated");
      setTimeout(() => setSyncMsg(null), 3000);
    } catch {
      setSyncMsg("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleConnect(platform: "GITHUB" | "DISCORD", username: string) {
    if (!publicKey || !username.trim()) return;
    setConnecting(true);
    try {
      await axios.post(`${API}/social/connect`, {
        wallet: publicKey.toBase58(),
        platform,
        username: username.trim(),
      });
      fetchData(publicKey.toBase58());
      setShowGithub(false);
      setShowDiscord(false);
      setGithubInput("");
      setDiscordInput("");
    } catch {
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect(platform: string) {
    if (!publicKey) return;
    await axios.delete(`${API}/social/disconnect`, {
      data: { wallet: publicKey.toBase58(), platform },
    });
    fetchData(publicKey.toBase58());
  }

  const progress = credits
    ? Math.min((credits.totalScore / (credits.totalScore + (credits.pointsToNextTier || 1))) * 100, 100)
    : 0;
  const tierColor = TIER_COLOR[credits?.tier ?? "COMMUNITY"];
  const githubConn = connections.find((c) => c.platform === "GITHUB");
  const discordConn = connections.find((c) => c.platform === "DISCORD");
  const activeBookings = bookings.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED");
  const pastBookings = bookings.filter((b) => b.status === "RELEASED" || b.status === "REFUNDED");

  return (
    <main style={{ background: "#0d0704", minHeight: "100vh", paddingBottom: isMobile ? "100px" : "80px" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .sync-btn { transition: all 0.15s; }
        .sync-btn:hover:not(:disabled) { background: rgba(255,165,82,0.15) !important; border-color: rgba(255,165,82,0.5) !important; }
        .connect-btn { transition: all 0.15s; }
        .connect-btn:hover { opacity: 0.8; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .modal { background: #1a0c07; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 100%; max-width: 420px; animation: fadeUp 0.2s ease; }
      `}</style>

      {/* Header */}
      <header style={{
        padding: isMobile ? "18px 24px" : "22px 64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        maxWidth: "1280px", margin: "0 auto",
      }}>
        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <img src="/logo.png" alt="Angalink" style={{ height: "32px", objectFit: "contain" }} />
        </button>
        {mounted && <WalletMultiButton />}
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "40px 20px" : "64px 64px" }}>

        {/* Page title */}
        <div style={{ marginBottom: "48px", animation: "fadeUp 0.4s ease" }}>
          <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4D6B0", marginBottom: "12px" }}>Builder profile</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "36px" : "52px", color: "#FCDE9C", fontWeight: "bold", lineHeight: "1.1" }}>
            Welcome back,<br />Builder
          </h1>
        </div>

        {!publicKey ? (
          <div style={{ padding: "64px 40px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#FCDE9C", opacity: 0.4, marginBottom: "28px" }}>
              Connect your wallet to view your builder profile
            </p>
            {mounted && <WalletMultiButton />}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Tier status — full width */}
            <div style={{
              padding: "40px", background: "rgba(255,255,255,0.02)",
              borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)",
              animation: "fadeUp 0.4s ease",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: tierColor, marginBottom: "10px" }}>Current Status</p>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "32px" : "44px", color: "#FCDE9C", fontWeight: "bold", lineHeight: "1.05" }}>
                    {credits?.tier === "CORE" ? "Gold" : credits?.tier === "BUILDER" ? "Silver" : "Bronze"} Tier
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <button
                      className="sync-btn"
                      onClick={handleSync}
                      disabled={syncing}
                      style={{
                        padding: "10px 20px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        fontFamily: "Arial Narrow, Arial, sans-serif",
                        fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
                        color: syncing ? "#FFA552" : "#9CA3AF",
                        cursor: syncing ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", gap: "8px",
                      }}
                    >
                      <span style={{ display: "inline-block", animation: syncing ? "spin 1s linear infinite" : "none" }}>↻</span>
                      {syncing ? "Syncing..." : "Sync Activity"}
                    </button>
                    {syncMsg && (
                      <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#FFA552", marginTop: "6px", letterSpacing: "0.08em" }}>{syncMsg}</p>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.3, marginBottom: "8px" }}>Discount</p>
                    <p style={{ fontFamily: "Georgia, serif", fontSize: "40px", color: tierColor, fontWeight: "bold" }}>
                      {credits?.discountPercent ?? 25}%
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.3 }}>
                  {credits?.totalScore ?? 0} pts
                </span>
                <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: tierColor, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {credits?.nextTier ?? "Max tier"} {credits?.pointsToNextTier ? `— ${credits.pointsToNextTier} pts away` : ""}
                </span>
              </div>
              <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: tierColor, borderRadius: "2px", transition: "width 0.8s ease", boxShadow: `0 0 12px ${tierColor}88` }} />
              </div>
            </div>

            {/* Two column grid */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>

              {/* Travel credits */}
              <div style={{ padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", animation: "fadeUp 0.4s ease 0.05s both" }}>
                <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.35, marginBottom: "16px" }}>Travel Credits</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "28px" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "56px", color: "#FCDE9C", fontWeight: "bold", lineHeight: 1 }}>{credits?.totalScore ?? 0}</span>
                  <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "14px", letterSpacing: "0.1em", color: "#FFA552" }}>ANGA</span>
                </div>
                <button
                  onClick={() => router.push("/routes")}
                  style={{
                    padding: "12px 24px", background: "#BA5624", border: "none", borderRadius: "10px",
                    fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px",
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    color: "#0d0704", cursor: "pointer", fontWeight: "bold",
                    boxShadow: "0 0 24px rgba(186,86,36,0.35)",
                  }}>Redeem on routes</button>
              </div>

              {/* Connected accounts */}
              <div style={{ padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)", animation: "fadeUp 0.4s ease 0.1s both" }}>
                <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.35, marginBottom: "24px" }}>Connected Accounts</p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "13px", color: "#6B7280", lineHeight: "1.7", marginBottom: "20px" }}>
                  Connect your accounts to expand your contribution graph.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* GitHub */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${githubConn ? "rgba(196,214,176,0.3)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: "12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "18px" }}>⌥</span>
                      <div>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#FCDE9C" }}>GitHub</p>
                        {githubConn && <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#C4D6B0" }}>@{githubConn.username}</p>}
                      </div>
                    </div>
                    {githubConn ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#C4D6B0", background: "rgba(196,214,176,0.1)", border: "1px solid rgba(196,214,176,0.3)", padding: "3px 10px", borderRadius: "20px" }}>Connected</span>
                        <button onClick={() => handleDisconnect("GITHUB")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#4B5563" }}>Remove</button>
                      </div>
                    ) : (
                      <button className="connect-btn" onClick={() => setShowGithub(true)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9CA3AF", cursor: "pointer" }}>Connect</button>
                    )}
                  </div>

                  {/* Discord */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${discordConn ? "rgba(196,214,176,0.3)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: "12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "18px" }}>◈</span>
                      <div>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#FCDE9C" }}>Discord</p>
                        {discordConn && <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#C4D6B0" }}>@{discordConn.username}</p>}
                      </div>
                    </div>
                    {discordConn ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#C4D6B0", background: "rgba(196,214,176,0.1)", border: "1px solid rgba(196,214,176,0.3)", padding: "3px 10px", borderRadius: "20px" }}>Connected</span>
                        <button onClick={() => handleDisconnect("DISCORD")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#4B5563" }}>Remove</button>
                      </div>
                    ) : (
                      <button className="connect-btn" onClick={() => setShowDiscord(true)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9CA3AF", cursor: "pointer" }}>Connect</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── FLIGHT STATUS ── */}
            {bookings.length > 0 && (
              <div style={{
                padding: "40px", background: "rgba(255,255,255,0.02)",
                borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)",
                animation: "fadeUp 0.4s ease 0.15s both",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
                  <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.35 }}>Flight Status</p>
                  {activeBookings.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFA552", display: "inline-block", animation: "pulse 2s infinite" }} />
                      <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#FFA552" }}>Live</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {bookings.map((b: any) => {
                    const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING;
                    const dep = b.route?.departureTs ? new Date(b.route.departureTs) : null;

                    return (
                      <div key={b.id} style={{
                        padding: "24px",
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: "16px",
                      }}>
                        {/* Top row */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                              <span style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#FCDE9C", fontWeight: "bold" }}>
                                {b.route?.origin ?? "—"}
                              </span>
                              <span style={{ color: "rgba(255,165,82,0.5)", fontSize: "14px" }}>—</span>
                              <span style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#FCDE9C", fontWeight: "bold" }}>
                                {b.route?.destination ?? "—"}
                              </span>
                            </div>
                            {dep && (
                              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", color: "#6B7280", letterSpacing: "0.04em" }}>
                                {dep.toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })} · {dep.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </div>
                          <div style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "6px 14px",
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            borderRadius: "20px",
                          }}>
                            <span style={{ fontSize: "12px" }}>{cfg.icon}</span>
                            <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: cfg.color }}>{cfg.label}</span>
                          </div>
                        </div>

                        {/* Progress tracker */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "4px", marginBottom: "20px" }}>
                          {[
                            { key: "booked",    label: "Booked",    done: true },
                            { key: "escrow",    label: "In Escrow", done: true },
                            { key: "confirmed", label: "Confirmed", done: b.status === "CONFIRMED" || b.status === "RELEASED" },
                            { key: "released",  label: "Released",  done: b.status === "RELEASED" },
                          ].map((s, i) => (
                            <div key={s.key}>
                              <div style={{
                                height: "3px",
                                borderRadius: "2px",
                                background: s.done ? cfg.color : "rgba(255,255,255,0.08)",
                                marginBottom: "6px",
                                transition: "background 0.5s ease",
                                boxShadow: s.done ? `0 0 8px ${cfg.color}66` : "none",
                              }} />
                              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: s.done ? cfg.color : "#4B5563" }}>{s.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Bottom row */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                          <div style={{ display: "flex", gap: "20px" }}>
                            <div>
                              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#4B5563", marginBottom: "3px" }}>Paid</p>
                              <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#FCDE9C" }}>${b.netAmountUsdc?.toFixed(2)} USDC</p>
                            </div>
                            <div>
                              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#4B5563", marginBottom: "3px" }}>Seats</p>
                              <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#FCDE9C" }}>{b.seatCount}</p>
                            </div>
                            <div>
                              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#4B5563", marginBottom: "3px" }}>Booked</p>
                              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", color: "#6B7280" }}>
                                {new Date(b.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                              </p>
                            </div>
                          </div>
                          <a
                            href={`https://explorer.solana.com/tx/${b.onchainPubkey}?cluster=devnet`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontFamily: "Arial Narrow, Arial, sans-serif",
                              fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase",
                              color: "#6B7280", textDecoration: "none",
                              display: "flex", alignItems: "center", gap: "4px",
                            }}
                          >
                            View on Explorer ↗
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contribution history */}
            <div style={{
              padding: "40px", background: "rgba(255,255,255,0.02)",
              borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)",
              animation: "fadeUp 0.4s ease 0.2s both",
            }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.35, marginBottom: "32px" }}>Contribution History</p>

              {(!credits?.creditEvents || credits.creditEvents.length === 0) ? (
                <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#FCDE9C", opacity: 0.25 }}>
                  No verified contributions yet. Sync your activity or connect your accounts.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {credits.creditEvents.slice(0, 8).map((event: any, i: number) => {
                    const info = ACTIVITY_LABELS[event.activityType] ?? { label: event.activityType, icon: "⬡" };
                    return (
                      <div key={event.id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "18px 0",
                        borderBottom: i < Math.min(credits.creditEvents.length, 8) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "16px", flexShrink: 0,
                          }}>{info.icon}</div>
                          <div>
                            <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#FCDE9C", marginBottom: "3px" }}>{info.label}</p>
                            <a
                              href={event.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#4B5563", letterSpacing: "0.04em", textDecoration: "none" }}
                            >
                              {event.sourceUrl.replace("https://", "").slice(0, 45) + "..."}
                            </a>
                          </div>
                        </div>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#FFA552" }}>+{event.normalizedScore} pts</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* GitHub modal */}
      {showGithub && (
        <div className="modal-overlay" onClick={() => setShowGithub(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C4D6B0", marginBottom: "12px" }}>Connect GitHub</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: "#FCDE9C", fontWeight: "bold", marginBottom: "8px" }}>Link your GitHub account</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#6B7280", lineHeight: "1.7", marginBottom: "24px" }}>
              Your open source contributions to Solana ecosystem repositories will be indexed and converted into ANGA credits.
            </p>
            <input
              value={githubInput}
              onChange={(e) => setGithubInput(e.target.value)}
              placeholder="GitHub username"
              style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontFamily: "Georgia, serif", fontSize: "15px", color: "#FCDE9C", outline: "none", marginBottom: "16px", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleConnect("GITHUB", githubInput)} disabled={connecting || !githubInput.trim()} style={{ flex: 1, padding: "14px", background: "#BA5624", border: "none", borderRadius: "10px", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#0d0704", cursor: "pointer", fontWeight: "bold" }}>
                {connecting ? "Connecting..." : "Connect"}
              </button>
              <button onClick={() => setShowGithub(false)} style={{ padding: "14px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B7280", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Discord modal */}
      {showDiscord && (
        <div className="modal-overlay" onClick={() => setShowDiscord(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C4D6B0", marginBottom: "12px" }}>Connect Discord</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: "#FCDE9C", fontWeight: "bold", marginBottom: "8px" }}>Link your Discord account</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#6B7280", lineHeight: "1.7", marginBottom: "24px" }}>
              Your activity in Superteam and Solana ecosystem Discord servers will count toward your builder score.
            </p>
            <input
              value={discordInput}
              onChange={(e) => setDiscordInput(e.target.value)}
              placeholder="Discord username"
              style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontFamily: "Georgia, serif", fontSize: "15px", color: "#FCDE9C", outline: "none", marginBottom: "16px", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => handleConnect("DISCORD", discordInput)} disabled={connecting || !discordInput.trim()} style={{ flex: 1, padding: "14px", background: "#BA5624", border: "none", borderRadius: "10px", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#0d0704", cursor: "pointer", fontWeight: "bold" }}>
                {connecting ? "Connecting..." : "Connect"}
              </button>
              <button onClick={() => setShowDiscord(false)} style={{ padding: "14px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B7280", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}