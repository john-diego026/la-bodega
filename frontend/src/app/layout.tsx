import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LA BODEGA - Discoteca & Lounge Management",
  description: "Sistema integral de inventario, stock y gestión de clientes de La Bodega",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#09090b] text-zinc-100 antialiased selection:bg-purple-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
