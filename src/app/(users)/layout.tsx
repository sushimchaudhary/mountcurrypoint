"use client"
import { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { usePathname } from "next/navigation";


interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  const hideLayout = pathname === "/menu";

  return (
    <>
      {!hideLayout && (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <Navbar />
        </header>
      )}

      <main>{children}</main>

      {!hideLayout && <Footer />}
    </>
  );
}