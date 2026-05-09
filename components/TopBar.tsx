"use client";
import dynamic from "next/dynamic";
import Image from "next/image";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

export default function TopBar({ title }: { title?: string }) {
  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: "#0d0704",
      borderBottom: "1px solid #2a1810",
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Image src="/logo.png" alt="Angalink" width={120} height={36} style={{ objectFit: "contain" }} />
      </div>
      {title && (
        <span style={{
          fontFamily: "Arial Narrow, Arial, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#BA5624",
        }}>{title}</span>
      )}
      <WalletMultiButton />
    </header>
  );
}
