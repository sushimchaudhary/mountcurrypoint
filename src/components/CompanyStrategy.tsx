"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Target, Trophy, Star } from "lucide-react";
import { StrategyServices } from "@/services/strategyServices";

interface Strategy {
  id: number;
  objective: string;
  mission_statement: string;
  management: string;
  goals: string;
  image: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function StrategySkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-3 md:px-12 pb-12 grid grid-cols-1 lg:grid-cols-2 md:gap-12 items-start animate-pulse">
      <div className="min-h-[450px]">
        {/* Title */}
        <div className="h-8 w-52 bg-gray-200 rounded-full mb-6" />
        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 w-28 bg-gray-200 rounded-md" />
          ))}
        </div>
        {/* Content lines */}
        <div className="space-y-3 mt-4">
          <div className="h-6 w-40 bg-gray-200 rounded-full" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-3 bg-gray-200 rounded-full ${
                i === 4 ? "w-2/3" : "w-full"
              }`}
            />
          ))}
        </div>
      </div>
      {/* Image skeleton */}
      <div className="flex justify-center items-start mt-10">
        <div className="relative w-full max-w-md aspect-square bg-gray-200 rounded-xl" />
      </div>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CompanyStrategy() {
  const [activeTab, setActiveTab] = useState("Mission");
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StrategyServices.getDetails()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setStrategy(list[0] ?? null);
      })
      .catch(() => setStrategy(null))
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { name: "Mission",   icon: <Eye    size={18} />, field: "mission_statement" },
    { name: "Goals",     icon: <Target size={18} />, field: "goals"             },
    { name: "Management",icon: <Star   size={18} />, field: "management"        },
    { name: "Objective", icon: <Trophy size={18} />, field: "objective"         },
  ] as const;

  if (loading) return <StrategySkeleton />;
  if (!strategy) return null;

  // Map tab name → strategy field
  const activeContent: Record<string, string> = {
    Mission:    strategy.mission_statement,
    Goals:      strategy.goals,
    Management: strategy.management,
    Objective:  strategy.objective,
  };

  return (
    <section className="max-w-7xl mx-auto px-3 md:px-12 pb-12 grid grid-cols-1 lg:grid-cols-2 md:gap-12 items-start">

      {/* ── Left: Tabs + content ── */}
      <div className="min-h-[450px]">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
          Company Strategy
        </h2>

        {/* Tab buttons — identical to original */}
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.name
                  ? "bg-[#007a3e] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </div>

        {/* Animated content panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Title */}
            <h3 className="text-2xl font-bold text-blue-950 mb-4">
              {activeTab}
            </h3>

            {/* Render CKEditor HTML safely */}
            <div
              className="
                prose prose-sm max-w-none text-gray-600
                [&_p]:mb-3 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1
                [&_li]:text-gray-600
                [&_h4]:font-bold [&_h4]:text-blue-900 [&_h4]:mb-2 [&_h4]:mt-4
                [&_b]:text-gray-800
                [&_i]:italic
                [&_strong]:text-gray-800
                [&_em]:italic
              "
              dangerouslySetInnerHTML={{
                __html: activeContent[activeTab] ?? "",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Right: Image from API ── */}
      <div className="flex justify-center items-start mt-12">
        <div className="relative w-full max-w-md aspect-square">
          <Image
            src={strategy.image || "/image/A_1.png"}
            alt="Company Strategy"
            fill
            unoptimized
            className="object-contain rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}