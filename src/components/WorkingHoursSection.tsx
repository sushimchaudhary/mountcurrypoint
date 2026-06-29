"use client";

import Link from "next/link";

const hours = [
  { days: "Monday  to  Sunday", time: "11:00 AM – 3:00 PM", status: "Lunch" },
  { days: "Monday  to  Sunday", time: "5:00 PM – 10:00 PM", status: "Dinner" },
];

export default function WorkingHoursSection() {
  return (
    <section className="relative w-full py-24 bg-gray-900 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/workhours.jpg')" }} 
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Text */}
        <div className="text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-[#c47c30]" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase">Visit Us</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            Opening <span className="text-[#c47c30]">Hours</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-md">
            Join us for an authentic culinary experience. We are open every day of the week to serve you our best flavors.
          </p>

          <div className="flex gap-4">
            <Link href="/menu-items" className="bg-[#c47c30] hover:bg-[#a66827] text-white px-8 py-4 font-bold text-xs uppercase tracking-widest transition-all">
              View Menu
            </Link>
          </div>
        </div>

        {/* Right: Schedule Box */}
        <div className="bg-white p-8 md:p-12 text-[#1b2a2f] shadow-2xl rounded-sm">
          <div className="space-y-8">
            {hours.map((item, idx) => (
              <div key={idx} className="text-center">
                <h4 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#c47c30] mb-2">
                  {item.status}
                </h4>
                <p className="text-sm text-gray-500 font-medium tracking-[0.15em] uppercase mb-2">{item.days}</p>
                <div className="text-2xl md:text-3xl font-serif font-medium">
                  {item.time}
                </div>
                {idx < hours.length - 1 && <div className="w-16 h-[1px] bg-gray-200 mx-auto mt-6" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}