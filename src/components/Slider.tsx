"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SliderServices } from "@/services/sliderServices";


interface GalleryItem {
  id: number;
  image: string;
  title?: string;
}

/**
 * Slot config for 7 visible positions (index 0 = far left, 3 = center, 6 = far right)
 * xFrac  : horizontal offset as fraction of stage width (0 = center)
 * scale  : size relative to center card
 * zIndex : stacking order
 * opacity: visibility
 */
const SLOTS = [
  { scale: 0.42, zIndex: 1, opacity: 0.5, xFrac: -0.55 },
  { scale: 0.62, zIndex: 2, opacity: 0.72, xFrac: -0.36 },
  { scale: 0.82, zIndex: 3, opacity: 0.88, xFrac: -0.19 },
  { scale: 1.0, zIndex: 10, opacity: 1.0, xFrac: 0 },
  { scale: 0.82, zIndex: 3, opacity: 0.88, xFrac: 0.19 },
  { scale: 0.62, zIndex: 2, opacity: 0.72, xFrac: 0.36 },
  { scale: 0.42, zIndex: 1, opacity: 0.5, xFrac: 0.55 },
];

const CENTER_W = 220;
const CENTER_H = 300;
const STAGE_H = 340;

export default function SliderCoverflow() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    SliderServices.getDetails()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const total = items.length;

  const goTo = useCallback(
    (idx: number) => {
      if (total === 0) return;
      setCurrent(((idx % total) + total) % total);
    },
    [total],
  );

  function startAuto() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 3000);
  }

  useEffect(() => {
    if (total === 0) return;
    startAuto();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  /** Compute slot for item at index i given current active index */
  function getSlot(i: number) {
    let offset = i - current;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    const slotIdx = offset + 3; // shift so center = index 3
    if (slotIdx < 0 || slotIdx >= SLOTS.length) return null;
    return SLOTS[slotIdx];
  }

  return (
    <section className="max-w-7xl mx-auto md:px-12 px-4 py-14">
      {/* ── Heading ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between mb-8"
      >
        <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-1">
          Visualizing Our Progress
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950">
          Moments of Excellence
        </h2>
        <Link
          href="/galleries"
          className="hidden md:flex items-center gap-1.5 text-sm font-semibold
                     text-green-600 hover:text-green-700 transition-colors"
        >
          View All <ArrowRight size={15} />
        </Link>
      </motion.div>

      {/* ── Coverflow Stage ── */}
      {loading ? (
        <div
          className="w-full bg-gray-100 animate-pulse rounded-lg"
          style={{ height: STAGE_H }}
        />
      ) : (
        <div
          className="relative w-full overflow-hidden"
          style={{ height: STAGE_H }}
        >
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              goTo(current - 1);
              startAuto();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-lg border border-gray-100 hover:bg-green-500 text-green-500 hover:text-white transition-all "
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              goTo(current + 1);
              startAuto();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 shadow-lg border border-gray-100 hover:bg-green-500 hover:text-white transition-all text-green-500"
          >
            <ChevronRight size={20} />
          </button>
          {items.map((item, i) => {
            const slot = getSlot(i);
            if (!slot) return null;

            const w = CENTER_W * slot.scale;
            const h = CENTER_H * slot.scale;

            return (
              <motion.div
                key={item.id}
                className="absolute cursor-pointer rounded-lg overflow-hidden"
                style={{ zIndex: slot.zIndex }}
                animate={{
                  // Position from center of stage
                  left: `calc(50% + ${slot.xFrac * 100}% - ${w / 2}px)`,
                  top: `calc(50% - ${h / 2}px)`,
                  width: w,
                  height: h,
                  opacity: slot.opacity,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  goTo(i);
                  startAuto();
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title ?? `Gallery ${item.id}`}
                  className="w-full h-full object-cover object-center"
                  draggable={false}
                />
                {/* Green sweep bar on active card */}
                {i === current && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-green-500 rounded-b-2xl" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Mobile View All ── */}
      {!loading && total > 0 && (
        <div className="flex justify-center mt-8 md:hidden">
          <Link
            href="/galleries"
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5
                       rounded-full text-sm font-semibold hover:bg-green-700
                       transition-colors shadow-md shadow-green-200"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
