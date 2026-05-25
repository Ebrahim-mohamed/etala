import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Etala - El-manara",
  description: "Etala - El-manara",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
