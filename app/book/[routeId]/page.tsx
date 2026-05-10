"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import { useConnection } from "@solana/wallet-adapter-react";
import { buildBookingTransaction } from "@/lib/escrow";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SOL_PRICE = 140;

const ESCROW_STEPS = [
  { id: 1, label: "Wallet Connected", sub: "Identity verified on-chain" },
  { id: 2, label: "Funds Locked in Escrow", sub: "Awaiting smart contract signature" },
  { id: 3, label: "Oracle Confirmation", sub: "Cross-chain flight manifest sync" },
  { id: 4, label: "Flight Departure", sub: "Funds released to operator on takeoff" },
];

export default function BookPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [route, setRoute] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [seatCount, setSeatCount] = useState(1);
  const [step, setStep] = useState<"review" | "signing" | "confirmed">("review");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!routeId) return;
    const ROUTES: Record<string, any> = {
      "route-1": { id: "route-1", origin: "NBO", destination: "EBB", basePriceUsdc: 70, seatsRemaining: 9, totalSeats: 12, departureTs: "2025-08-14T07:00:00Z", isConferenceRoute: false, operatorWallet: "59dj5oBdzRdGpUBjaigr8eh6S1ePKc7eHjZyBrR4LekR" },
      "route-2": { id: "route-2", origin: "NBO", destination: "LOS", basePriceUsdc: 70, seatsRemaining: 10, totalSeats: 12, departureTs: "2025-08-20T09:00:00Z", isConferenceRoute: true, conferenceCity: "Lagos", operatorWallet: "59dj5oBdzRdGpUBjaigr8eh6S1ePKc7eHjZyBrR4LekR" },
    };
    setRoute(ROUTES[routeId as string] || ROUTES["route-1"]);
  }, [routeId]);

  useEffect(() => {
    setCredits({ tier: "BUILDER", totalScore: 155, discountBps: 5000, discountPercent: 50 });
  }, [publicKey]);

  if (!route) return (
    <main style={{ background: "#0d0704", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#9CA3AF" }}>Loading...</p>
    </main>
  );

  const discountBps = credits?.discountBps ?? 2500;
  const grossUsdc = route.basePriceUsdc * seatCount;
  const netUsdc = grossUsdc - (grossUsdc * discountBps) / 10000;
  const solAmount = (netUsdc / SOL_PRICE).toFixed(2);
  const discountPercent = Math.round(discountBps / 100);
  const escrowStep = step === "confirmed" ? 4 : publicKey ? 1 : 0;

  async function handleBook() {
    if (!publicKey) return;
    setError(null);
    setStep("signing");
    try {
      const flightId = `${route.origin}-${route.destination}-${Date.now()}`;
      const { PublicKey: PK } = await import("@solana/web3.js");

      const tx = await buildBookingTransaction(
        connection,
        publicKey,
        new PK(route.operatorWallet || "59dj5oBdzRdGpUBjaigr8eh6S1ePKc7eHjZyBrR4LekR"),
        route.id,
        seatCount,
        netUsdc,
        discountBps,
        flightId
      );

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      setTxSignature(signature);

      // Demo mode - skip backend recording
      setBookingId(signature);
      setStep("confirmed");
    } catch (err: any) {
      setError(err?.message || "Booking failed.");
      setStep("review");
    }
  }

  return (
    <main style={{ background: "#0d0704", minHeight: "100vh", paddingBottom: isMobile ? "100px" : "60px" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .seat-btn { transition: all 0.15s; }
        .seat-btn:hover { border-color: rgba(255,165,82,0.6) !important; background: rgba(255,165,82,0.08) !important; }
        .lock-btn { transition: all 0.15s; }
        .lock-btn:hover:not(:disabled) { background: #FFA552 !important; transform: translateY(-1px); box-shadow: 0 6px 32px rgba(186,86,36,0.5) !important; }
        .lock-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      {/* Header */}
      <header style={{
        padding: isMobile ? "18px 24px" : "22px 64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        maxWidth: "1280px", margin: "0 auto",
      }}>
        <button
          onClick={() => router.push("/")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "10px" }}
        >
          <img src="/logo.png" alt="Angalink" style={{ height: "30px", objectFit: "contain" }} />
          <span style={{ fontFamily: "Georgia, serif", fontSize: "17px", color: "#FCDE9C", letterSpacing: "0.08em" }}>Angalink</span>
        </button>
        {mounted && <WalletMultiButton />}
      </header>

      {step === "confirmed" ? (
        <div style={{ maxWidth: "560px", margin: "0 auto", padding: "64px 24px", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            border: "1px solid #C4D6B0",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px",
            boxShadow: "0 0 40px rgba(196,214,176,0.2)",
          }}>
            <span style={{ fontSize: "24px", color: "#C4D6B0" }}>✓</span>
          </div>

          <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4D6B0", marginBottom: "14px" }}>
            Booking confirmed
          </p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "48px", color: "#FCDE9C", fontWeight: "bold", marginBottom: "16px" }}>
            Seat secured.
          </h1>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#9CA3AF", lineHeight: "1.8", marginBottom: "48px" }}>
            Your seat on {route.origin} to {route.destination} is held in escrow and releases automatically when your flight departs.
          </p>

          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", padding: "32px", textAlign: "left", marginBottom: "24px" }}>
            {[
              ["Booking ID", bookingId?.slice(0, 20) + "..."],
              ["Route", `${route.origin} — ${route.destination}`],
              ["Seats", seatCount.toString()],
              ["Paid", `$${netUsdc.toFixed(0)} USDC`],
              ["Discount", `${discountPercent}%`],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7280" }}>{l}</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#D1D5DB" }}>{v}</span>
              </div>
            ))}

            {txSignature && (
              <div style={{ paddingTop: "20px", textAlign: "center" }}>
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontFamily: "Arial Narrow, Arial, sans-serif",
                    fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
                    color: "#FFA552", textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: "6px",
                  }}
                >
                  View on Solana Explorer ↗
                </a>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push("/")}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#BA5624" }}
          >
            Back to routes
          </button>
        </div>
      ) : (
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          padding: isMobile ? "40px 20px" : "64px 64px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 400px",
          gap: "48px",
          alignItems: "start",
        }}>

          {/* LEFT */}
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Heading */}
            <div style={{ marginBottom: "40px", paddingBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4D6B0", marginBottom: "10px" }}>Review and lock</p>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "36px" : "52px", color: "#FCDE9C", fontWeight: "bold", lineHeight: "1.05", marginBottom: "8px" }}>
                {route.origin} — {route.destination}
              </h1>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "13px", color: "#6B7280", letterSpacing: "0.04em" }}>
                {new Date(route.departureTs).toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            {/* Seat selector */}
            <div style={{ marginBottom: "40px" }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7280", marginBottom: "14px" }}>Number of seats</p>
              <div style={{ display: "flex", gap: "10px" }}>
                {[1, 2, 3, 4].map((n) => {
                  const active = seatCount === n;
                  const disabled = n > route.seatsRemaining;
                  return (
                    <button key={n} className="seat-btn" onClick={() => !disabled && setSeatCount(n)} style={{
                      width: "54px", height: "54px", borderRadius: "12px",
                      border: active ? "1px solid #FFA552" : "1px solid rgba(255,255,255,0.1)",
                      background: active ? "rgba(255,165,82,0.12)" : "rgba(255,255,255,0.03)",
                      color: active ? "#FFA552" : "#9CA3AF",
                      fontFamily: "Georgia, serif", fontSize: "20px",
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.2 : 1,
                      boxShadow: active ? "0 0 20px rgba(255,165,82,0.2)" : "none",
                    }}>{n}</button>
                  );
                })}
              </div>
            </div>

            {/* Escrow status */}
            <div>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6B7280", marginBottom: "20px" }}>Escrow status</p>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px 24px" }}>
                {ESCROW_STEPS.map((s, i) => {
                  const done = s.id <= escrowStep;
                  const active = s.id === escrowStep + 1;
                  return (
                    <div key={s.id} style={{ display: "flex", gap: "16px", paddingBottom: i < 3 ? "24px" : 0, position: "relative" }}>
                      {i < 3 && (
                        <div style={{ position: "absolute", left: "13px", top: "30px", bottom: 0, width: "1px", background: done ? "rgba(255,165,82,0.35)" : "rgba(255,255,255,0.06)" }} />
                      )}
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                        border: done ? "1px solid #FFA552" : active ? "1px solid rgba(255,165,82,0.3)" : "1px solid rgba(255,255,255,0.1)",
                        background: done ? "rgba(255,165,82,0.15)" : "rgba(255,255,255,0.03)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: done ? "0 0 12px rgba(255,165,82,0.2)" : "none",
                      }}>
                        {done
                          ? <span style={{ fontSize: "11px", color: "#FFA552" }}>✓</span>
                          : <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: active ? "rgba(255,165,82,0.5)" : "rgba(255,255,255,0.12)", display: "inline-block" }} />
                        }
                      </div>
                      <div style={{ paddingTop: "2px" }}>
                        <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: done ? "#FCDE9C" : active ? "#D1D5DB" : "#9CA3AF", marginBottom: "3px" }}>{s.label}</p>
                        <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", color: done ? "#9CA3AF" : "#6B7280", letterSpacing: "0.03em" }}>{s.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical specs */}
            <div style={{ marginTop: "24px", padding: "24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px" }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4B5563", marginBottom: "16px" }}>Technical specifications</p>
              {[
                ["Network", "Solana Devnet"],
                ["Escrow program", "CDZRgr...iChk"],
                ["Credits program", "DJ27ho...kWaV"],
                ["Status", step === "signing" ? "pending" : "ready"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", color: "#6B7280", letterSpacing: "0.03em" }}>{label}</span>
                  {(val === "pending" || val === "ready") ? (
                    <span style={{
                      fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px",
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      color: val === "pending" ? "#FFA552" : "#C4D6B0",
                      background: val === "pending" ? "rgba(255,165,82,0.1)" : "rgba(196,214,176,0.1)",
                      border: `1px solid ${val === "pending" ? "rgba(255,165,82,0.3)" : "rgba(196,214,176,0.3)"}`,
                      padding: "3px 10px", borderRadius: "20px",
                    }}>{val}</span>
                  ) : (
                    <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", color: "#9CA3AF" }}>{val}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — glass fare card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeUp 0.4s ease 0.1s both" }}>

            {/* Glass fare card */}
            <div style={{
              padding: "32px",
              background: "rgba(186,86,36,0.08)",
              border: "1px solid rgba(255,165,82,0.4)",
              borderRadius: "20px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 0 1px rgba(255,165,82,0.08), 0 8px 40px rgba(186,86,36,0.2), inset 0 1px 0 rgba(255,165,82,0.15)",
            }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,165,82,0.7)", marginBottom: "10px" }}>Total Fare</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "52px", color: "#FCDE9C", fontWeight: "bold", lineHeight: 1, marginBottom: "10px" }}>{solAmount} SOL</p>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "13px", color: "#D1D5DB", letterSpacing: "0.03em", marginBottom: "20px" }}>
                ~${netUsdc.toFixed(0)} USD · {discountPercent}% builder discount applied
              </p>
              <div style={{ height: "1px", background: "rgba(255,165,82,0.2)", marginBottom: "20px" }} />
              {[
                ["Base price", `$${grossUsdc.toFixed(0)} USDC`, "#9CA3AF"],
                [`${credits?.tier ?? "Community"} discount`, `-$${(grossUsdc - netUsdc).toFixed(0)}`, "#FFA552"],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "12px", color: "#6B7280", letterSpacing: "0.03em" }}>{l}</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: c as string }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div style={{ padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px" }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "11px", color: "#6B7280", lineHeight: "1.75", letterSpacing: "0.03em" }}>
                Funds are held in escrow on Solana and released to the operator upon confirmed departure. If the flight is cancelled, you are refunded automatically.
              </p>
            </div>

            {error && (
              <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#F87171", padding: "0 4px" }}>{error}</p>
            )}

            {publicKey ? (
              <button
                className="lock-btn"
                onClick={handleBook}
                disabled={step === "signing"}
                style={{
                  padding: "18px",
                  background: step === "signing" ? "rgba(255,255,255,0.04)" : "#BA5624",
                  border: step === "signing" ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderRadius: "12px",
                  fontFamily: "Arial Narrow, Arial, sans-serif",
                  fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
                  color: step === "signing" ? "#4B5563" : "#0d0704",
                  cursor: step === "signing" ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  boxShadow: step === "signing" ? "none" : "0 4px 32px rgba(186,86,36,0.4)",
                }}
              >
                {step === "signing" ? "Signing transaction..." : "🔒 Lock Funds in Escrow"}
              </button>
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                {mounted && <WalletMultiButton />}
              </div>
            )}

            <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "9px", letterSpacing: "0.1em", color: "#374151", textAlign: "center", lineHeight: "1.6" }}>
              Secured by Angalink V2 Multi-Sig Smart Contract
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}