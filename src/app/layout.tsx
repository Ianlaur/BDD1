import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

const momotrust = localFont({
  src: "../public/fonts/MomoTrustDisplay-Regular.woff",
  variable: "--font-momotrust",
  display: "swap",
});

const zalandoSans = localFont({
  src: "../public/fonts/ZalandoSans-Regular.woff",
  variable: "--font-zalando-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loft - Connect with Campus Clubs",
  description: "Discover and join student associations and clubs. Stay updated with events, manage memberships, and connect with your community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${momotrust.variable} ${zalandoSans.variable} antialiased`}
      >
        <Sidebar />
        <div id="main-content" className="md:ml-64 flex flex-col min-h-screen transition-all duration-300">
          <main className="flex-1 pt-16 md:pt-0">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
