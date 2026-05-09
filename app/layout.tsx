import type { Metadata } from "next";
import "./globals.css";
import WalletProviderWrapper from "@/components/WalletProviderWrapper";

export const metadata: Metadata = {
  title: "Angalink",
  description: "Fly further. Build more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <WalletProviderWrapper>{children}</WalletProviderWrapper>
      </body>
    </html>
  );
}
