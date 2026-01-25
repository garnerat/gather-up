import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bro Weekends Trip Planner",
  description: "Plan your group trips with simple yes/no/maybe voting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
