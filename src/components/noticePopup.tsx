"use client";
import React, { useEffect, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NoticeServices } from "@/services/noticeServices";

const ACCENT = "#C47C30";

export default function NoticePopup() {
  const [notices, setNotices] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const res = await NoticeServices.getDetails();
        const list = Array.isArray(res) ? res : res?.results || [];
        const activeOnly = list.filter((n: any) => n.is_active);
        if (activeOnly.length > 0) {
          setNotices(activeOnly);
          // slight delay so it slides in after the page settles
          setTimeout(() => setIsOpen(true), 400);
        }
      } catch {
        // silently skip — popup just won't show
      } finally {
        setLoading(false);
      }
    };
    loadNotices();
  }, []);

  const handleClose = () => setIsOpen(false);
  const goPrev = () => setActiveIndex((i) => (i === 0 ? notices.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === notices.length - 1 ? 0 : i + 1));

  if (loading || notices.length === 0) return null;

  const current = notices[activeIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notice-backdrop"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md"
          />

          {/* Popup — slides slowly from top to its resting position */}
          <motion.div
            key="notice-popup"
            initial={{ opacity: 0, y: "-120%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-120%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[201] flex items-start justify-center p-4 pt-16 sm:pt-24"
          >
            <div
              className="relative w-full max-w-md rounded-lg overflow-hidden font-mukta"
              style={{
                boxShadow:
                  "0 30px 60px -15px rgba(0,0,0,0.35), 0 0 0 1px rgba(196,124,48,0.15)",
              }}
            >
              {/* ── Header: image + wave ── */}
              <div className="relative w-full h-56 overflow-hidden">
                {current.image ? (
                  <img
                    src={current.image}
                    alt={current.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${ACCENT}, #7a4a1f)`,
                    }}
                  />
                )}

                {/* subtle dot texture, restaurant-menu vibe */}
                <div
                  className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />

                {/* darken bottom of image so wave/badge stay readable */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)",
                  }}
                />

                {/* floating eyebrow badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-3 py-1">
                  <UtensilsCrossed size={11} className="text-white" />
                  <span className="text-[10px] font-semibold tracking-wide uppercase text-white">
                    Restaurant Notice
                  </span>
                </div>

                {/* Carousel arrows — only show if multiple notices */}
                {notices.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </>
                )}

                {/* wave divider into body */}
                <svg
                  className="absolute -bottom-px left-0 w-full"
                  viewBox="0 0 500 60"
                  preserveAspectRatio="none"
                  style={{ height: "32px" }}
                >
                  <path
                    d="M0,30 C90,60 160,0 250,20 C340,40 410,0 500,25 L500,60 L0,60 Z"
                    fill="#fffaf3"
                  />
                </svg>
              </div>

              {/* ── Body ── */}
              <div
                className="relative px-7 pt-3 pb-5 text-center space-y-4"
                style={{ backgroundColor: "#fffaf3" }}
              >
                

                <h2 className="text-lg font-bold text-[#3b2416] leading-snug px-2">
                  {current.title}
                </h2>

                <div
                  className="h-[2px] w-10 mx-auto rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />

                {/* Dot pagination */}
                {notices.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5">
                    {notices.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: i === activeIndex ? "20px" : "6px",
                          backgroundColor: i === activeIndex ? ACCENT : "#e8d9c5",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Footer: close button lives here ── */}
              <div
                className="px-7 py-4 border-t"
                style={{ backgroundColor: "#fffaf3", borderColor: "#f0e0cb" }}
              >
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] hover:brightness-105"
                  style={{
                    backgroundColor: ACCENT,
                    boxShadow: "0 10px 20px -8px rgba(196,124,48,0.55)",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}