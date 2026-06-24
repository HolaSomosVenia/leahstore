import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from '@/components/CurrencyProvider';

export const metadata: Metadata = {
  title: "Leah - Tienda de Moda Femenina",
  description: "Tienda en línea de ropa y accesorios para mujeres",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white dark:bg-slate-950">
        <CurrencyProvider />
        {children}
      </body>
    </html>
  );
}
