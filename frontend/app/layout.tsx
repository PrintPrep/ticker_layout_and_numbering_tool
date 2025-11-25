// ============================================================================
// FILE: app/layout.tsx
// ============================================================================

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticket Layout Tool",
  description: "Professional ticket layout optimization and PDF generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}