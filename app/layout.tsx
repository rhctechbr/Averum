import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Averum", template: "%s | Averum" },
  description: "Finanças pessoais com clareza e segurança.",
  applicationName: "Averum",
};

export const viewport: Viewport = { themeColor: "#185C45", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={manrope.className}>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
