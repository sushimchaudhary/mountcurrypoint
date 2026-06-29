"use client";
// ─────────────────────────────────────────────────────────────────
//  MenuPreviewSection  — homepage block
//  Shows up to 8 menu items + a "View All" link → /menu-items
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { UtensilsCrossed, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MenuServices } from "@/services/menuServices";

const formatPrice = (n: number) => `$${Number(n || 0).toFixed(2)}`;

// ── Motion variants (same family as AboutSection) ────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ── Skeleton card ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-[#e8dccd] overflow-hidden animate-pulse">
      <div className="h-44 bg-[#f0e9df]" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-[#f0e9df] rounded w-3/4" />
        <div className="h-3 bg-[#f0e9df] rounded w-1/3" />
      </div>
    </div>
  );
}

// ── Single menu card ──────────────────────────────────────────────
function MenuCard({ item }: { item: any }) {
  const portion = item.portions?.[0];
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.18 } }}
      className="bg-white rounded-lg border border-[#e8dccd] overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-shadow group"
    >
      {/* Image */}
      <div className="relative h-44 w-full bg-[#fcf7f2] overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed size={34} className="text-[#e8dccd]" />
          </div>
        )}
        {/* Category badge */}
        {item.category_name && (
          <span className="absolute top-2 left-2 text-[10px] font-bold tracking-widest uppercase bg-white/85 backdrop-blur-sm text-[#8a7a6e] px-2 py-0.5 rounded-full border border-[#e8dccd]">
            {item.category_name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-[14px] font-bold leading-snug text-[#241712] line-clamp-2">
          {item.name}
        </h3>
        <span className="text-[15px] font-extrabold text-[#c47c30]">
          {formatPrice(portion?.price)}
        </span>
      </div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────
export default function MenuItemsSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MenuServices.getDetails()
      .then((res) => {
        const all: any[] = Array.isArray(res) ? res : res?.results || [];
        setItems(all.filter((m) => m.status === "available").slice(0, 8));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 md:py-10">
      {/* Section header — mirrors AboutSection eyebrow style */}
      {/* Section header — Centered Title with Button on the Right */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="relative flex items-center justify-center mb-10" // flex-col हटाउनुहोस्
      >
        {/* Title & Eyebrow: Centered */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center text-center mt-4 pb-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-[2px] bg-[#c47c30]" />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#c47c30]">
              Our Menu
            </span>
            <div className="w-8 h-[2px] bg-[#c47c30]" />
          </div>

          <h2 className="text-4xl md:text-5xl font-serif text-[#1b2a2f] leading-[1.1] font-medium">
            Our Culinary{" "}
            <span className="italic text-[#c47c30]">Signature</span>
          </h2>
        </motion.div>

        {/* View All link: Absolute position to keep it on the side */}
        <motion.div
          variants={itemVariants}
          className="absolute right-0 hidden md:block"
        >
          <Link
            href="/menu-items"
            className="group inline-flex items-center gap-2 hover:text-[#c47c30] text-green-600 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 "
          >
            View All
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
        </motion.div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </motion.div>
      )}

      {/* Bottom CTA — visible on mobile when header link is cramped */}
      {!loading && items.length >= 8 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-10 flex justify-center lg:hidden"
        >
          <Link
            href="/menu-items"
            className="group inline-flex items-center gap-2 border-2 border-[#241712] text-[#241712] hover:bg-[#241712] hover:text-white text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-full transition-colors duration-300"
          >
            View All Items
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </Link>
        </motion.div>
      )}
    </section>
  );
}
