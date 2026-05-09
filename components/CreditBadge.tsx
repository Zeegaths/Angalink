"use client";
import clsx from "clsx";

const TIER_COLORS: Record<string, string> = {
  COMMUNITY: "text-stone-400 border-stone-700 bg-stone-900",
  BUILDER: "text-amber-400 border-amber-700/50 bg-amber-950/30",
  CORE: "text-teal-400 border-teal-700/50 bg-teal-950/30",
};

export function CreditBadge({ tier, score }: { tier: string; score: number }) {
  return (
    <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium", TIER_COLORS[tier])}>
      <span>{tier}</span>
      <span className="opacity-60">{score} pts</span>
    </div>
  );
}

export function ConferenceBanner({ routes }: { routes: any[] }) {
  const first = routes[0];
  return (
    <div className="bg-amber-500/10 border-b border-amber-800/30 px-6 py-3">
      <p className="text-amber-400 text-sm">
        <span className="font-semibold">Conference route open:</span>{" "}
        {first.origin} to {first.destination}
        {first.conferenceCity && ` for ${first.conferenceCity}`} on{" "}
        {new Date(first.departureTs).toLocaleDateString("en-KE", { month: "long", day: "numeric" })}.
        Builder and Core tier members fly at a discount.
      </p>
    </div>
  );
}

export default CreditBadge;
