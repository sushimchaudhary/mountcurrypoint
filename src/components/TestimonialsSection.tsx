"use client";

import Script from "next/script";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section className="relative py-2 overflow-hidden">
      {/* Decorative background quote mark */}
      <Quote
        className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 text-[#c47c30]/5 pointer-events-none"
        strokeWidth={0.5}
      />

      <div className="relative max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-[2px] w-12 bg-[#c47c30]" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#c47c30]">
              Testimonials
            </span>
            <div className="h-[2px] w-12 bg-[#c47c30]" />
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#1b2a2f] mb-5">
            What Our Guests Say
          </h2>

          <p className="text-gray-500 text-base max-w-xl mx-auto mb-6">
            Real stories from real diners — here's what people are saying
            about their experience with us.
          </p>

          {/* Star rating summary */}
          {/* <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-[#c47c30] text-[#c47c30]"
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-[#1b2a2f] ml-1">
              4.9 / 5
            </span>
            <span className="text-sm text-gray-400">
              based on verified reviews
            </span>
          </div> */}
        </div>

        {/* Widget container */}
        <div className="relative bg-white rounded-sm shadow-[0_4px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-2 md:p-3">
          {/* Corner accents */}
          <div className="absolute -top-2 -left-2 w-10 h-10 border-t-2 border-l-2 border-[#c47c30]" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-[#c47c30]" />

          {/* Elfsight Widget */}
          <div
            className="elfsight-app-92aafc84-1593-4172-a939-73ec058e0068"
            data-elfsight-app-lazy
          ></div>
          <Script
            src="https://elfsightcdn.com/platform.js"
            strategy="lazyOnload"
          />
        </div>
      </div>
    </section>
  );
}