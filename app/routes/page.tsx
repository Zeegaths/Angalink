"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SOL_PRICE = 140;

export default function RoutesPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const [routes, setRoutes] = useState<any[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setRoutes([
      { id: 'route-1', origin: 'NBO', destination: 'EBB', basePriceUsdc: 70, seatsRemaining: 9, totalSeats: 12, departureTs: '2025-08-14T07:00:00Z', isConferenceRoute: false, conferenceCity: null, operatorWallet: '59dj5oBdzRdGpUBjaigr8eh6S1ePKc7eHjZyBrR4LekR' },
      { id: 'route-2', origin: 'NBO', destination: 'LOS', basePriceUsdc: 70, seatsRemaining: 10, totalSeats: 12, departureTs: '2025-08-20T09:00:00Z', isConferenceRoute: true, conferenceCity: 'Lagos', operatorWallet: '59dj5oBdzRdGpUBjaigr8eh6S1ePKc7eHjZyBrR4LekR' },
    ]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!publicKey) return;
    const wallet = publicKey.toBase58();
    if (!wallet) return;
    axios.get(`${API}/credits/${wallet}`).then((r) => setCredits(r.data));
  }, [publicKey]);
  const discountBps = credits?.discountBps ?? 2500;

  return (
    <main style={{ background: "#0d0704", minHeight: "100vh", paddingBottom: isMobile ? "100px" : "80px" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .route-row { transition: background 0.15s, border-color 0.15s; }
        .route-row:hover { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,165,82,0.2) !important; }
        .book-btn { transition: all 0.15s; }
        .book-btn:hover { background: #FFA552 !important; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(186,86,36,0.4) !important; }
        .book-btn:active { transform: translateY(0) !important; }
      `}</style>

      {/* Header */}
      <header style={{
        padding: isMobile ? "18px 24px" : "22px 64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        maxWidth: "1280px", margin: "0 auto",
      }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <img src="/logo.png" alt="Angalink" style={{ height: "32px", objectFit: "contain" }} />
        </button>
        {mounted && <WalletMultiButton />}
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "40px 20px" : "64px 64px" }}>

        {/* Title */}
        <div style={{ marginBottom: "52px", animation: "fadeUp 0.4s ease" }}>
          <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4D6B0", marginBottom: "12px" }}>
            Available routes
          </p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "38px" : "56px", color: "#FCDE9C", fontWeight: "bold", lineHeight: "1.05", marginBottom: "20px" }}>
            Fly Anywhere.<br />Build Everywhere.
          </h1>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#9CA3AF", lineHeight: "1.75", maxWidth: "520px", marginBottom: "24px" }}>
            Starting in emerging markets across Africa, Asia, and Latin America — expanding globally. Your contribution history travels with you.
          </p>
          {credits && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "7px 16px",
              border: "1px solid rgba(255,165,82,0.35)", borderRadius: "20px",
              background: "rgba(255,165,82,0.06)",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFA552", display: "inline-block", boxShadow: "0 0 8px #FFA55299" }} />
              <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#FFA552" }}>
                {credits.tier} tier — {credits.discountPercent}% off all routes
              </span>
            </div>
          )}
        </div>

        {/* Column headers desktop */}
        {!isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 180px 150px", padding: "0 24px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "6px" }}>
            {["Route", "Departure", "Price", ""].map((h) => (
              <span key={h} style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4B5563" }}>{h}</span>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#6B7280", padding: "40px 0" }}>Loading routes...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {routes.map((route, i) => {
              const grossPrice = route.basePriceUsdc;
              const netPrice = grossPrice - (grossPrice * discountBps) / 10000;
              const discountPercent = Math.round(discountBps / 100);
              const dep = new Date(route.departureTs);

              return (
                <div
                  key={route.id}
                  className="route-row"
                  onClick={() => router.push(`/book/${route.id}`)}
                  onMouseEnter={() => setHoveredId(route.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr auto" : "2fr 2fr 180px 150px",
                    alignItems: "center",
                    gap: isMobile ? "16px" : "24px",
                    padding: isMobile ? "20px 16px" : "22px 24px",
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    animationDelay: `${i * 0.06}s`,
                    animation: "fadeUp 0.4s ease both",
                  }}
                >
                  {/* Route */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "24px" : "30px", color: "#FCDE9C", fontWeight: "bold" }}>{route.origin}</span>
                      <span style={{ color: "rgba(255,165,82,0.6)", fontSize: "16px" }}>—</span>
                      <span style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "24px" : "30px", color: "#FCDE9C", fontWeight: "bold" }}>{route.destination}</span>
                      {route.isConferenceRoute && (
                        <span style={{
                          fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px",
                          letterSpacing: "0.12em", textTransform: "uppercase",
                          color: "#C4D6B0",
                          border: "1px solid rgba(196,214,176,0.4)",
                          background: "rgba(196,214,176,0.08)",
                          padding: "3px 10px", borderRadius: "20px",
                        }}>Conference</span>
                      )}
                    </div>
                    <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", color: route.seatsRemaining <= 3 ? "#FFA552" : "#6B7280", letterSpacing: "0.04em" }}>
                      {route.seatsRemaining <= 3 ? `Only ${route.seatsRemaining} seats left` : `${route.seatsRemaining} seats available`}
                    </p>
                  </div>

                  {/* Departure desktop */}
                  {!isMobile && (
                    <div>
                      <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#D1D5DB", marginBottom: "5px" }}>
                        {dep.toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" })}
                      </p>
                      <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", color: "#6B7280" }}>
                        {dep.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  )}

                  {/* Price desktop */}
                  {!isMobile && (
                    <div>
                      {publicKey && discountBps > 0 && (
                        <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", color: "#4B5563", textDecoration: "line-through", marginBottom: "2px" }}>${grossPrice}</p>
                      )}
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#FFA552", fontWeight: "bold" }}>${netPrice.toFixed(0)}</span>
                        <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4B5563", padding: "2px 6px", border: "1px solid rgba(75,85,99,0.4)", borderRadius: "4px" }}>USDC</span>
                      </div>
                      {publicKey && discountBps > 0 && (
                        <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#BA5624", marginTop: "2px" }}>{discountPercent}% off</p>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <button className="book-btn" onClick={(e) => { e.stopPropagation(); router.push(`/book/${route.id}`); }} style={{
                    padding: isMobile ? "11px 18px" : "13px 22px",
                    background: "#BA5624", border: "none", borderRadius: "10px",
                    fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px",
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    color: "#FCDE9C", cursor: "pointer", fontWeight: "bold",
                    whiteSpace: "nowrap",
                    boxShadow: "0 0 20px rgba(186,86,36,0.2)",
                  }}>Book seat</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Promo card */}
        <div style={{
          marginTop: "40px",
          padding: isMobile ? "28px 24px" : "36px 40px",
          background: "rgba(255,255,255,0.02)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
          borderLeft: "3px solid #FFA552",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: "24px",
          animation: "fadeUp 0.4s ease 0.3s both",
        }}>
          <div>
            <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#FFA552", marginBottom: "10px" }}>Exclusive Pass</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: "#FCDE9C", fontWeight: "bold", marginBottom: "8px" }}>Unlock Elite Lounges</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#9CA3AF", lineHeight: "1.75" }}>
              Stake 500 ANGA for access to premium business lounges across global builder hubs.
            </p>
          </div>
          <button className="book-btn" style={{
            padding: "13px 28px", background: "transparent",
            border: "1px solid rgba(255,165,82,0.35)", borderRadius: "10px",
            fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px",
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: "#FFA552", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>Learn more</button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
