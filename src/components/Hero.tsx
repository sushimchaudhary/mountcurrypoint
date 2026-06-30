"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Transition } from "framer-motion";
import { SliderServices } from "@/services/sliderServices";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

interface Slider {
  id: number;
  image: string;
  title?: string;
  description?: string;
  order?: number;
}

// Fix: use explicit Transition type and "as const" for ease
const trans = (delay: number): Transition => ({
  duration: 0.7,
  delay,
  ease: "easeOut" as const,
});

export default function HeroBanner() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    SliderServices.getDetails().then((data: any) => {
      const list = Array.isArray(data) ? data : [];
      setSliders(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    });
  }, []);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliders.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [sliders.length]);

  // Each element has its own explicit animation — no custom() function needed
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: trans(delay),
  });

  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[860px] overflow-hidden bg-[#0a0603] flex items-center justify-center">
      {/* ── Background slides ─────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {sliders.map(
            (slider, index) =>
              index === current && (
                <motion.div
                  key={slider.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={slider.image}
                    alt="Hero background"
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                  />
                </motion.div>
              ),
          )}
        </AnimatePresence>

        {sliders.length === 0 && (
          <div className="absolute inset-0 bg-[#0a0603]" />
        )}

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0603]/95 via-[#0a0603]/25 to-[#0a0603]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0603]/25 via-transparent to-[#0a0603]/25" />
      </div>

      {/* ── Decorative rings ──────────────────────────────────── */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ border: "1px solid rgba(196,124,48,0.10)" }}
      >
        <div
          className="absolute inset-[50px] rounded-full"
          style={{ border: "1px solid rgba(196,124,48,0.07)" }}
        />
        <div
          className="absolute inset-[100px] rounded-full"
          style={{ border: "1px solid rgba(196,124,48,0.04)" }}
        />
      </div>

      {/* ── Centre content ────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">
        {/* Heading */}
        <motion.h1
          {...fadeUp(0.42)}
          className="text-3xl md:text-5xl leading-[1.06] font-bold text-[#f5ede0] mb-5"
          style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
        >
          The Mount Curry
          <br />
          <span className="text-[#c47c30] italic"> Point</span>
        </motion.h1>

        {/* Divider */}
        <motion.div {...fadeUp(0.54)} className="flex items-center gap-3 mb-6">
          <div className="w-12 h-[1px] bg-white/15" />
          <UtensilsCrossed size={14} className="text-[#c47c30]/60" />
          <div className="w-12 h-[1px] bg-white/15" />
        </motion.div>

        {/* Description */}
        <motion.p
          {...fadeUp(0.62)}
          className="text-[15px] md:text-[16px] text-gray-100 leading-[1.8] max-w-[440px] mb-10"
        >
          Experience the true essence of Indian and Nepali culinary traditions,
          prepared with fresh ingredients and authentic spices.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.72)}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/menu-items"
            className="group inline-flex items-center gap-2.5 bg-[#c47c30] hover:bg-[#d4892f] text-white font-bold text-[12px] tracking-[0.15em] uppercase px-6 py-4 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-[#c47c30]/25"
          >
            View Menu
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>

          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 font-bold text-[12px] tracking-[0.15em] uppercase px-6 py-4 rounded-full transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] border border-white/20 hover:border-[#c47c30]/50 text-[#f5ede0]/80 hover:text-[#ed7e07]"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>

     

   

     
    </section>
  );
}
