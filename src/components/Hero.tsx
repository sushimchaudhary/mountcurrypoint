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
    <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-[#060a06] flex items-center shadow-2xl">
      
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {sliders.map((slider, index) => (
            index === current && (
              <motion.div
                key={slider.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={slider.image}
                  alt="Hero Background"
                  fill
                  priority
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-2xl"
        >
          <span className="text-[#e3591e] font-semibold tracking-widest uppercase text-sm mb-4 block">
            Welcome to Authentic Taste
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            The Mount <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e3591e] to-[#e3591e]">
              Curry Point
            </span>
          </h1>
          
          <p className="text-gray-300 mt-6 text-lg md:text-xl leading-relaxed max-w-lg">
            Experience the true essence of Indian and Nepali culinary traditions, prepared with fresh ingredients and authentic spices.
          </p>

          <div className="flex flex-row items-center gap-4 mt-10">
            <Link
              href="/menu"
              className="bg-[#E3591E]  text-white font-bold px-8 py-1.5 rounded-lg transition-all shadow-xl shadow-green-900/20 hover:scale-105 active:scale-95"
            >
              View Menu
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/20 text-white hover:bg-white/10 font-bold px-8 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-2">
        {sliders.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === current ? "w-8 bg-[#e3591e]" : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}