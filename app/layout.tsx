import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Fridge",
  description: "Cook smarter. Waste less.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
