import { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TopNavbar from "@/components/TopNavbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
     <TopNavbar/>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
       <Navbar />
      </header>
        <main>{children}</main>
      <Footer/>
    </>
  );
}