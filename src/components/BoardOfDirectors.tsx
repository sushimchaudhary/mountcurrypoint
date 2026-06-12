"use client";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const directors = [
  { name: "Tej Bahadur Tamang", role: "Founder Chairman" },
  { name: "Pragya Lama", role: "CFO" },
];

export default function BoardOfDirectors() {
  // AboutSection मा जस्तै एउटै Variants प्रयोग गरियो
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1.2, ease: "easeOut" as const } 
    }
  };

  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="py-10 px-12 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading Section */}
        <motion.div variants={containerVariants} className="text-center mb-20">
          <motion.span variants={itemVariants} className="text-green-600 font-bold tracking-[0.2em] text-xs uppercase bg-green-50 px-4 py-1 rounded-full">
            Meet The Board of Directors
          </motion.span>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold text-blue-950 mt-4 mb-3">
            Visionary <span className="text-yellow-500">Leaders</span>
          </motion.h2>
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-extrabold text-blue-950">
            Guiding Your Path
          </motion.h2>
        </motion.div>

        {/* Directors Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {directors.map((director, index) => (
            <motion.div
              key={index}
              variants={itemVariants} 
              className="group relative bg-white p-2 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(22,163,74,0.2)] transition-all duration-500"
            >
              <div className="relative w-full h-[400] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <Image
                  src="/image/A_1.png"
                  alt={director.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="absolute -bottom-10 left-10 right-10 bg-white/90 backdrop-blur-md p-2 rounded-sm border border-white/50 shadow-xl">
                <h3 className="text-2xl font-bold text-blue-950">{director.name}</h3>
                <p className="text-green-500 font-semibold tracking-wide uppercase text-sm mt-1">
                  {director.role}
                </p>
                <div className="w-12 h-1 bg-yellow-500 mt-4 rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}