




"use client";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

export default function AboutSection() {
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
      className="max-w-7xl mx-auto px-4 py-16 md:px-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-16">
        
        {/* Left Side: Image */}
        <motion.div variants={itemVariants} className="relative aspect-square md:aspect-auto md:h-[500px] w-full">
          <motion.div 
           
            className="relative z-10 w-[90%] h-[90%] overflow-hidden rounded-2xl shadow-2xl"
          >
            <Image
              src="/image/A_1.png"
              alt="Arya Tara Main"
              fill
              sizes="50"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute top-10 right-0 w-[90%] h-[90%] border-4 border-green-600 rounded-2xl -z-0" />
        </motion.div>

        {/* Right Side: Text Content */}
        <motion.div variants={containerVariants} className="flex flex-col items-start gap-4 text-justify">
          <motion.span variants={itemVariants} className="text-green-600 font-bold text-sm tracking-widest uppercase">
            About Us
          </motion.span>
          
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-1">
            ARYA TARA PVT. LTD.
          </motion.h2>

          <motion.p variants={itemVariants} className="text-gray-700 leading-relaxed max-w-prose">
            Established in 2025,{" "}
            <strong className="font-semibold text-gray-900">
              Aryatara Private Limited
            </strong>{" "}
            is a dynamic and forward-thinking company registered under the
            Government of Japan. Rooted in a commitment to innovation, quality,
            and excellence, Aryatara aims to become a leading provider of
            diverse services that meet the evolving needs of individuals,
            businesses, and communities both in Japan and internationally.
          </motion.p>

          <motion.p variants={itemVariants} className="text-gray-600 leading-relaxed text-sm md:text-base max-w-prose">
            The company was founded with a clear vision: to bridge gaps across
            multiple sectors through smart, sustainable, and customer-focused
            solutions. With a strategic approach and a passion for progress,
            Aryatara Private Limited is dedicated to offering a wide range of
            services, including but not limited to technology solutions,
            business consultancy, e-commerce facilitation, logistics support,
            and digital transformation services.
          </motion.p>

          <motion.p variants={itemVariants} className="text-gray-500 leading-relaxed text-sm max-w-prose">
            Driven by a team of experienced professionals and forward-looking
            leadership, Aryatara is committed to shaping a better future.
          </motion.p>

          <motion.button 
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 text-white px-8 py-3 rounded font-semibold text-sm hover:bg-green-700 transition-colors mt-4 shadow-lg"
          >
            Read More
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
}