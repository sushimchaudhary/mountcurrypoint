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

  return (
    <section className="relative w-full max-w-8xl mx-auto overflow-hidden bg-[#060a06] md:min-h-[500] min-h-[270] flex items-center shadow-2xl">
      
      {/* ── Background Image Slider (सिर्फ इमेज मात्र स्लाइड हुन्छ) ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {sliders.map((slider, index) => (
            index === current && (
              <motion.div
                key={slider.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={slider.image}
                  alt="Hero Background"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[#060a06]/50" />
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* ── Main Content (यो हिस्सा स्थिर रहन्छ) ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Arya Tara
            <br />
            <span className="text-green-400">Private Limited</span>
          </h1>
          
         

<div className="flex flex-row items-center gap-2 sm:gap-4 mt-8">
  <Link
    href="/projects"
    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-semibold text-xs sm:text-sm px-4 sm:px-8 py-3 rounded-full transition-all shadow-lg shadow-green-900/40 whitespace-nowrap"
  >
    View Projects
  </Link>
  <Link
    href="/contact"
    className="inline-flex items-center justify-center border border-green-600/60 text-green-400 hover:bg-green-600/10 font-semibold text-xs sm:text-sm px-4 sm:px-8 py-3 rounded-full transition-all whitespace-nowrap"
  >
    Contact Us
  </Link>
</div>
        </div>
      </div>
    </section>
  );
}