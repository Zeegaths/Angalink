"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Home",      path: "/",          icon: "⌂" },
  { label: "Routes",    path: "/routes",    icon: "✈" },
  { label: "Dashboard", path: "/dashboard", icon: "◈" },
  { label: "Profile",   path: "/profile",   icon: "○" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile) return null;

  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      background: "#1a0c07",
      borderTop: "1px solid #2a1810",
      display: "flex",
      zIndex: 100,
    }}>
      {NAV.map((item) => {
        const active = pathname === item.path;
        const isHome = item.path === "/";
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            style={{
              flex: 1, padding: "10px 4px 14px",
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "4px",
            }}
          >
            {isHome ? (
              <img
                src="/logo.png"
                alt="Angalink"
                style={{
                  height: "20px",
                  objectFit: "contain",
                  opacity: active ? 1 : 0.3,
                  filter: active ? "none" : "grayscale(1)",
                }}
              />
            ) : (
              <span style={{ fontSize: "18px", color: active ? "#FFA552" : "#4a2010" }}>{item.icon}</span>
            )}
            <span style={{
              fontFamily: "Arial Narrow, Arial, sans-serif",
              fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase",
              color: active ? "#FFA552" : "#4a2010",
            }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
