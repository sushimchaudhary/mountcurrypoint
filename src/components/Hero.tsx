"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SliderServices } from "@/services/sliderServices";

interface Slider {
  id: number;
  image: string;
  title?: string;
  description?: string;
  order?: number;
}

const STATIC_BADGES = [
  { num: "12+", label: "Years of taste" },
  { num: "4.9", label: "Guest rating" },
  { num: "60+", label: "Dishes" },
];

const FOOD_TAGS = ["Indian", "Nepali", "Momo", "Thali"];

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
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders.length]);

  return (
    <section className="relative w-full h-[560px] md:h-[620px] overflow-hidden bg-[#0a0603] flex items-center">

      {/* ── Background slides ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {sliders.map(
            (slider, index) =>
              index === current && (
                <motion.div
                  key={slider.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
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
                  {/* warm gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0603]/95 via-[#0a0603]/70 to-[#0a0603]/20" />
                </motion.div>
              )
          )}
        </AnimatePresence>

        {/* Fallback dark bg when no sliders */}
        {sliders.length === 0 && (
          <div className="absolute inset-0 bg-[#0a0603]" />
        )}
      </div>

      {/* ── Decorative rings ── */}
      <div
        className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ border: "1px solid rgba(196,124,48,0.12)" }}
      >
        <div
          className="absolute inset-[40px] rounded-full"
          style={{ border: "1px solid rgba(196,124,48,0.08)" }}
        />
        <div
          className="absolute inset-[80px] rounded-full"
          style={{ border: "1px solid rgba(196,124,48,0.05)" }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-14 flex items-center justify-between h-full">

        {/* Left: text */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-[520px]"
        >
         

          {/* Heading */}
          <h1
            className="text-5xl md:text-[58px] leading-[1.08] font-bold mb-5 text-[#f5ede0]"
            style={{ fontFamily: "'Georgia', 'Playfair Display', serif" }}
          >
            The Mount
            <br />
            <span className="text-[#c47c30] italic">Curry Point</span>
          </h1>

         

          {/* Description */}
          <p
            className="text-[15px] leading-[1.72] mb-9 max-w-[380px]"
            style={{ color: "rgba(245,237,224,0.58)" }}
          >
            Experience the true essence of Indian and Nepali culinary
            traditions, prepared with fresh ingredients and authentic spices.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-[#c47c30] text-[#0a0603] font-medium text-[13px] tracking-wide px-7 py-3.5 rounded-[6px] transition-all hover:bg-[#d4892f] hover:scale-[1.02] active:scale-[0.98]"
            >
              View menu
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center font-normal text-[13px] tracking-wide px-7 py-3.5 rounded-[6px] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                border: "1px solid rgba(245,237,224,0.2)",
                color: "rgba(245,237,224,0.78)",
              }}
            >
              Contact us
            </Link>
          </div>
        </motion.div>

        
      </div>

      {/* ── Slide dots ── */}
      {sliders.length > 1 && (
        <div className="absolute bottom-7 left-0 right-0 z-20 flex justify-center gap-1.5">
          {sliders.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Slide ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-6 bg-[#c47c30]"
                  : "w-1.5 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Slide counter ── */}
      {sliders.length > 1 && (
        <div
          className="absolute bottom-7 right-10 z-20 text-[11px] tracking-[0.1em]"
          style={{ color: "rgba(245,237,224,0.32)" }}
          aria-live="polite"
        >
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(sliders.length).padStart(2, "0")}
        </div>
      )}
    </section>
  );
}