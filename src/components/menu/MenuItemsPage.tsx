"use client";
// ─────────────────────────────────────────────────────────────────
//  MenuItemsPage  — /menu-items full page
//  All available items, filterable by category
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect, Suspense } from "react";
import { motion, Variants } from "framer-motion";
import { UtensilsCrossed, Inbox } from "lucide-react";
import Image from "next/image";
import { MenuServices } from "@/services/menuServices";
import { CategoryServices } from "@/services/categoryServices";
import { toast } from "sonner";

const formatPrice = (n: number) => `$${Number(n || 0).toFixed(2)}`;

// ── Motion variants ───────────────────────────────────────────────
const containerVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

// ── Loader ────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex items-center justify-center"
      >
        <div className="w-16 h-16 rounded-full overflow-hidden border border-[#e8dccd] shadow-sm relative z-10">
          <Image src="/logo.png" alt="Loading…" width={64} height={64} className="w-full h-full object-cover" />
        </div>
        <div className="absolute w-20 h-20 rounded-full border-4 border-transparent border-t-[#c47c30] animate-spin" />
      </motion.div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────
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

// ── Category pill ─────────────────────────────────────────────────
function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-1.5 text-[12px] font-bold tracking-wider uppercase whitespace-nowrap transition-colors duration-200 ${
        active ? "text-white" : "text-[#8a7a6e] hover:text-[#241712]"
      }`}
    >
      {active && (
        <motion.span
          layoutId="menu-page-pill"
          className="absolute inset-0 bg-[#c47c30] rounded-full"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

// ── Menu card ─────────────────────────────────────────────────────
function MenuCard({ item }: { item: any }) {
  const portion = item.portions?.[0];
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.18 } }}
      className="bg-white rounded-lg border border-[#e8dccd] overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-shadow group"
    >
      <div className="relative md:h-44 h-28 w-full  overflow-hidden">
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
        {item.category_name && (
          <span className="absolute top-2 left-2 text-[10px] font-bold tracking-widest uppercase bg-white/85 backdrop-blur-sm text-[#8a7a6e] px-2 py-0.5 rounded-full border border-[#e8dccd]">
            {item.category_name}
          </span>
        )}
      </div>

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

// ── Page ──────────────────────────────────────────────────────────
function MenuPage() {
  const [menuItems,      setMenuItems]      = useState<any[]>([]);
  const [categories,     setCategories]     = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.all([CategoryServices.getDetails(), MenuServices.getDetails()])
      .then(([catRes, menuRes]) => {
        const cats:  any[] = Array.isArray(catRes)  ? catRes  : catRes?.results  || [];
        const items: any[] = Array.isArray(menuRes)  ? menuRes  : menuRes?.results || [];
        setCategories(cats);
        setMenuItems(items.filter((m) => m.status === "available"));
      })
      .catch(() => toast.error("Failed to load menu"))
      .finally(() => setLoading(false));
  }, []);

  const visibleItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((m) => m.category === activeCategory);

  return (
    <div className="min-h-screen  py-18  ">

      {/* ── Page hero header ─────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-6 pt-14 pb-6  "
      >
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-3">
        <div className="w-8 h-[2px] bg-[#c47c30]" />
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#c47c30]">
            Explore our menu
        </span>
            </motion.div>

            <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl  text-[#1b2a2f] leading-[1.1] font-medium"
            >
            Our Culinary  <span className="italic text-[#c47c30]"> Signature</span>
            </motion.h1>

        {/* Category filter */}
        {!loading && categories.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="flex gap-1 overflow-x-auto mt-6 pb-1 no-scrollbar"
          >
            <CategoryPill label="All" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
            {categories.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.name}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-[#e8dccd]" />
      </div>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visibleItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 gap-3 text-center"
          >
            <Inbox size={36} className="text-[#e8dccd]" />
            <p className="text-[15px] font-bold text-[#241712]">Nothing here yet</p>
            <p className="text-[12px] text-[#8a7a6e]">Try a different category.</p>
          </motion.div>
        ) : (
          <>
            {/* Item count */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={String(activeCategory)}
              className="text-[11px] font-bold uppercase tracking-widest text-[#8a7a6e] mb-5"
            >
              {visibleItems.length} {visibleItems.length === 1 ? "item" : "items"}
            </motion.p>

            <motion.div
              key={String(activeCategory) + "-grid"}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {visibleItems.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MenuItemsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <MenuPage />
    </Suspense>
  );
}