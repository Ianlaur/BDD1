import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { ClientLayout } from "@/components/ClientLayout";
import { ClientSidebar } from "@/components/ClientSidebar";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${momotrust.variable} ${zalandoSans.variable} antialiased`}
      >
        <ClientLayout>
          <ClientSidebar>
            <Sidebar />
          </ClientSidebar>
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}
