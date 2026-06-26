"use client";

import Link from "next/link";

export default function WorkingHoursSection() {
  return (
    <section className="relative w-full py-24 bg-gray-900 overflow-hidden">
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/workhours.jpg')" }} 
      />
      <div className="absolute inset-0 bg-black/60" /> {/* Dark Overlay */}

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Text and Buttons */}
        <div className="text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-[#c47c30]" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase">About Us</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl  font-bold mb-6">Working hours</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-md">
            Rolorem, beatae dolorum, praesentium itaque et quam quaerat.
          </p>

          <div className="flex gap-4">
            <Link href="/menu" className="bg-[#c47c30] hover:bg-[#e0961f] text-white px-8 py-4 font-bold text-xs uppercase tracking-widest transition-colors">
              menu
            </Link>
            <Link href="/contact" className="border border-white/30 hover:bg-white/10 text-white px-8 py-4 font-bold text-xs uppercase tracking-widest transition-colors">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Right Side: Schedule Box */}
        <div className="bg-white p-12 text-[#1b2a2f] shadow-2xl">
          <div className="space-y-8 text-center">
            
            {/* Sunday to Tuesday */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-4">Sunday to Tuesday</h4>
              <div className="text-3xl font-serif font-medium space-y-1">
                <p>09 : 00</p>
                <p>22 : 00</p>
              </div>
            </div>

            <div className="w-16 h-[1px] bg-gray-200 mx-auto" />

            {/* Friday to Saturday */}
            <div>
              <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-4">Friday to Saturday</h4>
              <div className="text-3xl font-serif font-medium space-y-1">
                <p>11 : 00</p>
                <p>19 : 00</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}