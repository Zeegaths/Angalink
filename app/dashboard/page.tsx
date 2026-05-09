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
  BOUNTY: { label: "Bounty Completed", icon: "⬡" },
  HACKATHON: { label: "Hackathon Shipped", icon: "⚡" },
  PLACEMENT: { label: "Hackathon Placed", icon: "✦" },
  GRANT: { label: "Grant Milestone", icon: "◈" },
  ONCHAIN: { label: "Protocol Integration", icon: "⬡" },
};

const TIER_COLOR: Record<string, string> = {
  COMMUNITY: "#C4D6B0",
  BUILDER: "#FFA552",
  CORE: "#FFA552",
};

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [credits, setCredits] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
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
    if (!publicKey) return;
    const wallet = publicKey.toBase58();
    axios.get(`${API}/credits/${wallet}`).then((r) => setCredits(r.data));
    axios.get(`${API}/bookings/${wallet}`).then((r) => setBookings(r.data));
  }, [publicKey]);

  const progress = credits
    ? Math.min((credits.totalScore / (credits.totalScore + (credits.pointsToNextTier || 1))) * 100, 100)
    : 0;

  const tierColor = TIER_COLOR[credits?.tier ?? "COMMUNITY"];

  return (
    <main style={{ background: "#0d0704", minHeight: "100vh", paddingBottom: isMobile ? "100px" : "80px" }}>

      {/* Header */}
      <header style={{
        padding: isMobile ? "20px 24px" : "24px 64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #1e1008",
        maxWidth: "1280px", margin: "0 auto",
      }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <img src="/logo.png" alt="Angalink" style={{ height: "32px", objectFit: "contain" }} />
        </button>
        {mounted && <WalletMultiButton />}
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? "48px 24px" : "72px 64px" }}>

        {/* Page title */}
        <div style={{ marginBottom: isMobile ? "48px" : "64px" }}>
          <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#C4D6B0", marginBottom: "12px" }}>Builder profile</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "36px" : "52px", color: "#FCDE9C", fontWeight: "bold", lineHeight: "1.1" }}>
            Welcome back,<br />Builder
          </h1>
        </div>

        {!publicKey ? (
          <div style={{
            padding: "64px 40px", background: "#110806",
            borderRadius: "20px", border: "1px solid #1e1008",
            textAlign: "center",
          }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#FCDE9C", opacity: 0.4, marginBottom: "28px" }}>
              Connect your wallet to view your builder profile
            </p>
            {mounted && <WalletMultiButton />}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px",
          }}>

            {/* Tier status */}
            <div style={{
              padding: "40px",
              background: "#110806",
              borderRadius: "20px",
              border: "1px solid #1e1008",
              gridColumn: isMobile ? "1" : "1 / -1",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
                <div>
                  <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: tierColor, marginBottom: "10px" }}>Current Status</p>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "32px" : "44px", color: "#FCDE9C", fontWeight: "bold", lineHeight: "1.05" }}>
                    {credits?.tier === "CORE" ? "Gold" : credits?.tier === "BUILDER" ? "Silver" : "Bronze"} Tier
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.3, marginBottom: "8px" }}>Discount</p>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "40px", color: tierColor, fontWeight: "bold" }}>
                    {credits?.discountPercent ?? 25}%
                  </p>
                </div>
              </div>

              <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#FCDE9C", opacity: 0.45, lineHeight: "1.75", marginBottom: "28px", maxWidth: "520px" }}>
                {credits?.tier === "CORE"
                  ? "You've reached elite builder status. Enjoy exclusive access to priority routes and maximally discounted flight credits."
                  : `Keep contributing to reach ${credits?.nextTier ?? "Builder"} tier and unlock a higher travel discount.`}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.3 }}>
                  {credits?.totalScore ?? 0} pts
                </span>
                <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: tierColor, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {credits?.nextTier ?? "Max tier"} {credits?.pointsToNextTier ? `— ${credits.pointsToNextTier} pts away` : ""}
                </span>
              </div>
              <div style={{ height: "3px", background: "#1e1008", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: tierColor, borderRadius: "2px", transition: "width 0.8s ease", boxShadow: `0 0 12px ${tierColor}88` }} />
              </div>
            </div>

            {/* Travel credits */}
            <div style={{ padding: "40px", background: "#110806", borderRadius: "20px", border: "1px solid #1e1008" }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.35, marginBottom: "16px" }}>Travel Credits</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "28px" }}>
                <span style={{ fontFamily: "Georgia, serif", fontSize: "56px", color: "#FCDE9C", fontWeight: "bold", lineHeight: 1 }}>{credits?.totalScore ?? 0}</span>
                <span style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "14px", letterSpacing: "0.1em", color: "#FFA552" }}>ANGA</span>
              </div>
              <button
                onClick={() => router.push("/routes")}
                style={{
                  padding: "12px 24px",
                  background: "#BA5624",
                  border: "none", borderRadius: "8px",
                  fontFamily: "Arial Narrow, Arial, sans-serif",
                  fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#0d0704", cursor: "pointer", fontWeight: "bold",
                  boxShadow: "0 0 24px rgba(186,86,36,0.35)",
                }}>Redeem on routes</button>
            </div>

            {/* Contribution score */}
            <div style={{ padding: "40px", background: "#110806", borderRadius: "20px", border: "1px solid #1e1008" }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.35, marginBottom: "16px" }}>Contribution Score</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "56px", color: "#FCDE9C", fontWeight: "bold", lineHeight: 1, marginBottom: "16px" }}>{credits?.totalScore ?? 0}</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#FCDE9C", opacity: 0.4, lineHeight: "1.75" }}>
                Indexed from Superteam Earn, hackathon submissions, and on-chain activity.
              </p>
            </div>

            {/* Recent activity */}
            <div style={{
              padding: "40px", background: "#110806",
              borderRadius: "20px", border: "1px solid #1e1008",
              gridColumn: isMobile ? "1" : "1 / -1",
            }}>
              <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.35, marginBottom: "32px" }}>Recent Activity</p>

              {(!credits?.creditEvents || credits.creditEvents.length === 0) ? (
                <p style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#FCDE9C", opacity: 0.25 }}>
                  No activity yet. Complete a Superteam bounty to earn your first credits.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {credits.creditEvents.slice(0, 6).map((event: any, i: number) => {
                    const info = ACTIVITY_LABELS[event.activityType] ?? { label: event.activityType, icon: "⬡" };
                    return (
                      <div key={event.id} style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 0",
                        borderBottom: i < Math.min(credits.creditEvents.length, 6) - 1 ? "1px solid #1e1008" : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{
                            width: "40px", height: "40px",
                            borderRadius: "10px", background: "#1a0c07",
                            border: "1px solid #2a1410",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "16px", flexShrink: 0,
                          }}>{info.icon}</div>
                          <div>
                            <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#FCDE9C", marginBottom: "3px" }}>{info.label}</p>
                            <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#FCDE9C", opacity: 0.3, letterSpacing: "0.05em" }}>
                              {new Date(event.verifiedAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: "16px", color: "#FFA552" }}>+{event.normalizedScore} pts</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Flight history */}
              {bookings.length > 0 && (
                <>
                  <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#FCDE9C", opacity: 0.35, margin: "40px 0 24px" }}>Flight History</p>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {bookings.map((b: any, i: number) => (
                      <div key={b.id} style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 0",
                        borderBottom: i < bookings.length - 1 ? "1px solid #1e1008" : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <div style={{
                            width: "40px", height: "40px",
                            borderRadius: "10px", background: "#1a0c07",
                            border: "1px solid #2a1410",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "16px", flexShrink: 0,
                          }}>✈</div>
                          <div>
                            <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#FCDE9C", marginBottom: "3px" }}>
                              {b.route?.origin ?? "—"} to {b.route?.destination ?? "—"}
                            </p>
                            <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#FCDE9C", opacity: 0.3, letterSpacing: "0.05em" }}>
                              {new Date(b.createdAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontFamily: "Georgia, serif", fontSize: "15px", color: "#FCDE9C" }}>${b.netAmountUsdc?.toFixed(0)} USDC</p>
                          <p style={{ fontFamily: "Arial Narrow, Arial, sans-serif", fontSize: "10px", color: "#BA5624", letterSpacing: "0.08em", textTransform: "uppercase" }}>{b.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
