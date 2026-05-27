import type { Metadata } from "next";
import { Unbounded, Space_Grotesk, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const shareTech = Share_Tech_Mono({ weight: ["400"], subsets: ["latin"], variable: "--font-share-tech" });

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
      <body className={`${unbounded.variable} ${spaceGrotesk.variable} ${shareTech.variable} font-space-grotesk antialiased bg-[#ffffff] text-[#021024]`}>
        {/* Fondo */}
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