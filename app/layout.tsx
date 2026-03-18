import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import AppNavbar from "../components/AppNavbar"; // Import the Navbar component
import { Toaster } from "sonner"; // Import Toaster
import { AuthProvider } from "@/context/AuthContext"; // Import AuthProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Generador de Formularios", // Updated title
  description: "Aplicación para crear y gestionar formularios", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-primary-light text-primary-dark min-h-screen`}
      >
        <AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <AppNavbar className="mb-4" /> {/* Render the Navbar here */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
