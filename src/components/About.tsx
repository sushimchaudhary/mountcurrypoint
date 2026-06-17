"use client";

import "ckeditor5/ckeditor5-content.css";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CompanyOverviewServices } from "@/services/companyoverviewServices";

interface Overview {
  id: number;
  description: string;
  company_img: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function AboutSectionSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:px-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16">
        <div className="relative aspect-square md:aspect-auto md:h-[500px] w-full">
          <div className="w-[90%] h-[90%] bg-gray-200 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-3 w-16 bg-gray-200 rounded-full" />
          <div className="h-8 w-3/4 bg-gray-200 rounded-full" />
          <div className="space-y-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-3 bg-gray-200 rounded-full ${i === 4 ? "w-2/3" : "w-full"}`}
              />
            ))}
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded mt-2" />
        </div>
      </div>
    </div>
  );
}

export default function AboutSection() {
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
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: "easeOut" } },
  };

  if (loading) return <AboutSectionSkeleton />;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 py-16 md:px-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16">

        {/* Left Side: Image */}
        <motion.div
          variants={itemVariants}
          className="relative aspect-square md:aspect-auto md:h-[500px] w-full"
        >
          <motion.div className="relative z-10 w-[90%] h-[90%] overflow-hidden rounded-2xl shadow-2xl">
            <Image
              src={overview?.company_img || "/image/A_1.png"}
              alt="Arya Tara Main"
              fill
              unoptimized
              sizes="50vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute top-10 right-0 w-[90%] h-[90%] border-4 border-green-600 rounded-2xl -z-0" />
        </motion.div>

        {/* Right Side: CKEditor HTML rendered as-is */}
        <motion.div
          variants={containerVariants}
          className="flex flex-col items-start gap-4"
        >
          <motion.span
            variants={itemVariants}
            className="text-green-600 font-bold text-sm tracking-widest uppercase"
          >
            About Us
          </motion.span>

          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-1"
          >
            ARYA TARA PVT. LTD.
          </motion.h2>

          {overview?.description && (
            <motion.div
              variants={itemVariants}
              className="ck-content prose prose-sm max-w-prose text-gray-700 leading-relaxed text-justify"
              dangerouslySetInnerHTML={{ __html: overview.description }}
            />
          )}

          <motion.div variants={itemVariants}>
            <Link
              href="/company-information"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded font-semibold text-sm hover:bg-green-700 transition-colors mt-4 shadow-lg"
            >
              Read More
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}