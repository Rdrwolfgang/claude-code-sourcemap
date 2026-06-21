import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Disclaimer from "@/components/ui/Disclaimer";

export const metadata: Metadata = {
  title: {
    default: "Shelby Justice Tracker — Memphis & Shelby County Court Transparency",
    template: "%s | Shelby Justice Tracker",
  },
  description:
    "Public transparency tool for Shelby County, TN criminal justice data. Search defendants, track judges, analyze outcomes from Memphis courts, District Attorney Steve Mulroy's office, and the 30th Judicial District.",
  keywords: [
    "Shelby County courts", "Memphis criminal justice", "Steve Mulroy", "court transparency",
    "criminal records", "judge accountability", "30th Judicial District", "Tennessee courts",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Shelby Justice Tracker",
    description: "Public transparency tool for Shelby County, TN criminal justice data.",
    siteName: "Shelby Justice Tracker",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-900 text-slate-200 antialiased">
        <Header />
        <Disclaimer />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
