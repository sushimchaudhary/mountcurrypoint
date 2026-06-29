"use client"
import AboutSection from "@/components/About";
import TeamMember from "@/components/BoardOfDirectors";
import ContactSection from "@/components/ContactSection";
import HeroBanner from "@/components/Hero";
import MenuItemsSection from "@/components/menuItemsSection";
import ScrollToTop from "@/components/ScrollTop";
import SliderCoverflow from "@/components/Slider";
import TestimonialsSection from "@/components/TestimonialsSection";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
export default function LandingPage() {
  const containerRef = useRef(null);
  
  // Scroll track garne
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Scroll sangai opacity 1 bata 0 hunchha
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <main ref={containerRef} className="relative">
      
      {/* 1. HeroBanner with motion */}
      <motion.div 
        style={{ opacity, scale }} 
        className="sticky top-0 z-0 h-screen w-full"
      >
        <HeroBanner />
      </motion.div>

      {/* 2. Content Wrapper */}
      <div className="relative  bg-white  -mt-1 pt-16 rounded-t-4xl shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.1)] z-20" >
        
          <AboutSection />

        <section className="bg-orange-50/50 py-16">

        <MenuItemsSection/>
        </section>
        
        {/* <section className="bg-white py-10">
          <TestimonialsSection />
        </section> */}

        <section className="bg-[#E88924]/20">
          <SliderCoverflow />
        </section>

        {/* <section className="bg-orange-50/50 py-10">
          <TeamMember />
        </section> */}
        
        <section className="bg-white py-16">
          <ContactSection />
        </section>
      </div>

      <ScrollToTop />
    </main>
  );
}