"use client";

import Link from "next/link";
import { UtensilsCrossed, Moon } from "lucide-react";

const hours = [
  {
    days: "Monday – Sunday",
    time: "11:00 AM – 3:00 PM",
    status: "Lunch",
    icon: UtensilsCrossed,
  },
  {
    days: "Monday – Sunday",
    time: "5:00 PM – 10:00 PM",
    status: "Dinner",
    icon: Moon,
  },
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
            <span className="text-xs font-bold tracking-[0.3em] uppercase">
              Visit Us
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl  font-bold mb-6 leading-tight">
            Opening <span className="text-[#c47c30]">Hours</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-md">
            Join us for an authentic culinary experience. We are open every day
            of the week to serve you our best flavors.
          </p>

          <div className="flex gap-4">
            <Link
              href="/menu-items"
              className="bg-[#c47c30] hover:bg-[#a66827] text-white px-8 py-4 font-bold text-xs uppercase tracking-widest transition-all"
            >
              View Menu
            </Link>
          </div>
        </div>

        {/* Right: Schedule Box */}
        <div className="relative">
          {/* Decorative corner accents */}
          <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#c47c30] z-10" />
          <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#c47c30] z-10" />

          <div className="relative bg-white shadow-2xl px-8 py-12 md:px-14 md:py-16">
            {/* Header */}
            <div className="text-center mb-10">
              <span className="text-md font-bold tracking-[0.25em] uppercase text-[#c47c30]">
                Restaurant Schedule
              </span>
              <h3 className="text-2xl md:text-3xl  font-bold text-[#1b2a2f] mt-2">
                We're Open
              </h3>
            </div>

            <div className="flex flex-col gap-8">
              {hours.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-6 group"
                  >
                    {/* Icon badge */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-full border border-[#c47c30]/30 bg-[#c47c30]/5 flex items-center justify-center transition-all duration-300 group-hover:bg-[#c47c30] group-hover:border-[#c47c30]">
                      <Icon
                        className="w-6 h-6 text-[#c47c30] transition-colors duration-300 group-hover:text-white"
                        strokeWidth={1.75}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-left">
                      <h4 className="text-[16px] font-bold tracking-[0.25em] uppercase text-[#1b2a2f] mb-1">
                        {item.status}
                      </h4>
                      <p className="text-[14px] text-gray-800 font-medium tracking-[0.15em] uppercase mb-2">
                        {item.days}
                      </p>
                      <div className="text-xl md:text-2xl  font-semibold text-[#c47c30]">
                        {item.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider with note */}
            <div className="mt-10 pt-6 border-t border-dashed border-gray-200 text-center">
              <p className="text-xs text-gray-500 tracking-wide">
                Reservations recommended for weekends
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}