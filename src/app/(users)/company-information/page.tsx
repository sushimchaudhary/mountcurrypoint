"use client";

import "ckeditor5/ckeditor5-content.css";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import CompanyStrategy from "@/components/CompanyStrategy";
import { CompanyOverviewServices } from "@/services/companyoverviewServices";

interface Overview {
  id: number;
  description: string;
  company_img: string;
}

function AboutPageSkeleton() {
  return (
    <>
      <div className="py-16 bg-gray-800 animate-pulse">
        <div className="max-w-xs mx-auto h-10 bg-gray-600 rounded-full mb-4" />
        <div className="max-w-xs mx-auto h-4 bg-gray-600 rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto md:px-12 px-4 py-10 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 md:gap-16">
          <div className="relative aspect-square md:h-[500px] w-full">
            <div className="w-[90%] h-[90%] bg-gray-200 rounded-xl" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded-full" />
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`h-3 bg-gray-200 rounded-full ${
                    i % 4 === 3 ? "w-2/3" : "w-full"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function About() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CompanyOverviewServices.getDetails()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setOverview(list[0] ?? null);
      })
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  if (loading) return <AboutPageSkeleton />;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto md:py-2 py-2"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 md:gap-16 md:px-12 px-4 py-7"
        >
          {/* Left: Image */}
          <motion.div
            variants={itemVariants}
            className="relative aspect-square md:h-[500px] w-full"
          >
            <div className="relative z-10 w-[90%] h-[90%] overflow-hidden rounded-xl shadow-xl">
              <Image
                src={overview?.company_img || "/image/A_1.png"}
                alt="Arya Tara Main"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="absolute top-10 right-0 w-[90%] h-[90%] border-4 border-green-600 rounded-xl -z-0" />
          </motion.div>

          {/* Right: CKEditor HTML rendered as-is */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col items-start gap-5"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl md:text-4xl font-extrabold text-blue-950 leading-tight md:mt-5"
            >
              Company Introduction
            </motion.h2>

            {overview?.description && (
              <motion.div
                variants={itemVariants}
                className="ck-content prose prose-sm max-w-none text-gray-700 leading-relaxed text-justify w-full"
                dangerouslySetInnerHTML={{ __html: overview.description }}
              />
            )}
          </motion.div>
        </motion.div>
      </motion.section>

      <CompanyStrategy />
    </>
  );
}