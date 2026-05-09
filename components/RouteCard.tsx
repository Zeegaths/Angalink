"use client";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function RouteCard({ route, discountBps, walletConnected }: any) {
  const router = useRouter();
  const grossPrice = route.basePriceUsdc;
  const discountAmount = (grossPrice * discountBps) / 10000;
  const netPrice = grossPrice - discountAmount;
  const discountPercent = Math.round(discountBps / 100);
  const departure = new Date(route.departureTs);
  const seatsLow = route.seatsRemaining <= 3;

  return (
    <div
      className={clsx(
        "rounded-xl border p-5 transition-all cursor-pointer",
        route.isConferenceRoute
          ? "bg-amber-950/20 border-amber-800/40 hover:border-amber-600/60"
          : "bg-stone-900 border-stone-800 hover:border-stone-600"
      )}
      onClick={() => router.push(`/book/${route.id}`)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-2xl">{route.origin}</span>
            <span className="text-stone-600">--</span>
            <span className="font-bold text-2xl">{route.destination}</span>
            {route.isConferenceRoute && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {route.conferenceCity} conf
              </span>
            )}
          </div>
          <p className="text-stone-500 text-sm mt-1">
            {departure.toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })}
            {" "}at{" "}
            {departure.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="text-right">
          {walletConnected && discountBps > 0 ? (
            <>
              <p className="text-stone-500 text-sm line-through">${grossPrice} USDC</p>
              <p className="text-amber-400 font-bold text-xl">${netPrice.toFixed(0)} USDC</p>
              <p className="text-amber-600 text-xs">{discountPercent}% off</p>
            </>
          ) : (
            <p className="text-stone-100 font-bold text-xl">${grossPrice} USDC</p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-800">
        <span className={clsx("text-xs", seatsLow ? "text-red-400" : "text-stone-500")}>
          {route.seatsRemaining} seats remaining
        </span>
        <button className="text-xs px-4 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition-colors">
          Book seat
        </button>
      </div>
    </div>
  );
}
