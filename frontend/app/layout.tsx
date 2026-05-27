import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "SaaS Visión Contable | IA",
  description: "Clasificación de documentos impulsada por Inteligencia Artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${plusJakarta.variable} ${dmSans.variable} font-dm-sans antialiased bg-[#ffffff] text-[#021024]`}>
        <div className="fixed inset-0 z-[-1] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(84, 131, 179, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(84, 131, 179, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}>
        </div>
        {children}
      </body>
    </html>
  );
}