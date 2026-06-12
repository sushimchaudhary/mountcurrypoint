"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="relative w-full max-w-7xl mx-auto flex items-center justify-center overflow-hidden bg-[#060a06]">

      {/* ── Background glows ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#060a06]" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-green-900/30 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-800/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-green-950/40 blur-[140px]" />
      </div>

      {/* ── Decorative large watermark letter ── */}
      {/* <div
        className="absolute inset-0 z-0 flex items-center justify-end pr-16 select-none pointer-events-none"
        aria-hidden="true"
      >
        <span className="text-[260px] font-black text-white/[0.025] leading-none tracking-tighter">
          AT
        </span>
      </div> */}

      {/* ── Top & bottom accent lines ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/60 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/60 to-transparent z-10" />

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — text block */}
        <div className="flex flex-col gap-7 order-2 lg:order-1">

         

          {/* Main headline */}
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Arya Tara
              <br />
              <span className="text-green-400">Private Limited</span>
            </h1>
            <p className="text-base text-green-300/70 tracking-widest font-light mt-1 uppercase">
              — Bridging Nepal & Japan —
            </p>
          </div>

          

          {/* Company intro paragraph */}
            <div className="flex flex-col gap-4 text-justify">   
            <p className="text-base md:text-lg text-gray-100/90 leading-relaxed">
                Arya Tara Private Limited is a Nepal-based company headquartered in
                Indrasarowar-5, Makawanpur, specializing in international manpower
                recruitment and overseas employment support.
            </p>
            
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                We connect skilled Nepali professionals with trusted Japanese
                organizations — building long-term partnerships rooted in integrity,
                dedication, and mutual growth. Our experienced team guides candidates
                through every step of the overseas employment journey.
            </p>
            </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold text-sm px-7 py-3 rounded-full transition-colors duration-200 shadow-lg shadow-green-900/40"
            >
              View Our Projects
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-green-600/60 hover:border-green-400 text-green-400 hover:text-green-300 font-semibold text-sm px-7 py-3 rounded-full transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>

          {/* Stats row */}
          {/* <div className="flex gap-10 mt-4 pt-6 border-t border-white/10">
            {[
              { num: "10+", label: "Years\nExperience" },
              { num: "500+", label: "Successful\nPlacements" },
              { num: "Japan", label: "Primary\nMarket" },
            ].map((s) => (
              <div key={s.num} className="flex flex-col gap-1">
                <span className="text-2xl font-extrabold text-green-400">{s.num}</span>
                <span className="text-xs text-gray-500 whitespace-pre-line leading-snug">{s.label}</span>
              </div>
            ))}
          </div> */}
        </div>

        {/* Right — logo */}
        <div className="flex items-center justify-center order-1 lg:order-2">
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-green-500/10 blur-2xl scale-110" />
            {/* Spinning dashed ring */}
            <div className="absolute inset-[-18px] rounded-full border border-dashed border-green-700/40 animate-[spin_30s_linear_infinite]" />
            {/* Static inner ring */}
            <div className="absolute inset-[-5px] rounded-full border border-green-700/15" />
            {/* Logo */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl shadow-green-900/50">
              <Image
                src="/image/A_1.png"
                alt="Arya Tara Private Limited Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Accent dots */}
            <div className="absolute -top-3 -right-3 w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/60" />
            <div className="absolute -bottom-2 -left-4 w-2 h-2 bg-green-500 rounded-full shadow-md shadow-green-500/50" />
            <div className="absolute top-1/3 -right-6 w-1.5 h-1.5 bg-emerald-300 rounded-full" />
          </div>
        </div>
      </div>

   
      

    </section>
  );
}