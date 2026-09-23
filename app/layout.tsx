// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Product Admin Dashboard",
  description: "Manage products via the DummyJSON API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* AuthProvider wraps EVERY page in the app, so useAuth() works
            anywhere — the login page, the products page, the navbar, etc. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}