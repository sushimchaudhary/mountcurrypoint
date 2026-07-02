"use client";
import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
          setTimeout(() => setIsOpen(true), 400);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    loadNotices();
  }, []);

  const handleClose = () => setIsOpen(false);
  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents backdrop click
    setActiveIndex((i) => (i === 0 ? notices.length - 1 : i - 1));
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents backdrop click
    setActiveIndex((i) => (i === notices.length - 1 ? 0 : i + 1));
  };

  if (loading || notices.length === 0) return null;

  const current = notices[activeIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop - This handles the outside click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Popup Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm overflow-hidden bg-transparent"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking the popup itself
          >
            <div className="relative w-full">
              {current.image ? (
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-auto object-contain"
                />
              ) : (
                <div className="w-full h-64 bg-slate-800" />
              )}

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 p-2 bg-black/10 backdrop-blur-md rounded-full text-red-500 hover:bg-black/60 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Carousel arrows */}
              {notices.length > 1 && (
                <>
                  <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white hover:bg-white/40">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white hover:bg-white/40">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}