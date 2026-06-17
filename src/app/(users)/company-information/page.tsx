"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import CompanyStrategy from "@/components/CompanyStrategy";
import Link from "next/link";

export default function About() {
  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto md:py-4 py-2"
      >
        <section className="py-16 bg-gray-800 text-white text-center">
          <div className="">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <div className="flex items-center justify-center gap-2 text-sm md:text-base">
              <span className="hover:text-green-400 cursor-pointer">
                <Link href={'/'} >Home </Link></span>
              <span>/</span>
              
              <span className="text-green-500 font-semibold">About Us</span>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 md:gap-16 md:px-12 px-4 py-5">
          {/* Left Side: Image */}
          <div className="relative aspect-square md:h-[500] w-full">
            <div className="relative z-10 w-[90%] h-[90%] overflow-hidden rounded-xl shadow-xl">
              <Image
                src="/image/A_1.png"
                alt="Arya Tara Main"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute top-10 right-0 w-[90%] h-[90%] border-4 border-green-600 rounded-xl -z-0" />
          </div>

          {/* Right Side: Text Content */}
          <div className="flex flex-col items-start gap-5 text-justify">
            <h2 className="text-2xl md:text-4xl font-extrabold text-blue-950 leading-tight md:mt-5">
              Company Introduction
            </h2>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Established in 2025,{" "}
                <strong className="font-semibold text-gray-900">
                  Aryatara Private Limited
                </strong>{" "}
                is a dynamic and forward-thinking company registered under the
                Government of Japan. Rooted in a commitment to innovation,
                quality, and excellence, Aryatara aims to become a leading
                provider of diverse services that meet the evolving needs of
                individuals, businesses, and communities both in Japan and
                internationally.
              </p>

              <p className="text-gray-600">
                The company was founded with a clear vision: to bridge gaps
                across multiple sectors through smart, sustainable, and
                customer-focused solutions. With a strategic approach and a
                passion for progress, Aryatara Private Limited is dedicated to
                offering a wide range of services, including but not limited to
                technology solutions, business consultancy, e-commerce
                facilitation, logistics support, and digital transformation
                services.
              </p>

              <p className="text-gray-500 text-sm">
                Driven by a team of experienced professionals and
                forward-looking leadership, Aryatara emphasizes integrity,
                efficiency, and continuous improvement in all its operations.
                The company aims to build lasting partnerships with clients by
                delivering reliable, high-quality services tailored to specific
                needs.
              </p>

              <p className="text-gray-500 text-sm">
                As a newly established but ambitious organization, Aryatara
                Private Limited is poised to grow into a multi-sector
                powerhouse, contributing positively to the economy while
                enhancing the lives of its clients and stakeholders. With its
                base in Japan—a global hub of innovation and excellence—Aryatara
                is uniquely positioned to expand its footprint and make a
                meaningful impact in the years to come.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
      <CompanyStrategy />
    </>
  );
}
