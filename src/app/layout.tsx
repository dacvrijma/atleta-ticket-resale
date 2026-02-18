import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EventsProvider } from "@/context/EventsContext";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atleta Ticket Resale",
  description: "Ticket resale scanning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <EventsProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </EventsProvider>
      </body>
    </html>
  );
}
