"use client";

import "ckeditor5/ckeditor5-content.css";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { CompanyOverviewServices } from "@/services/companyoverviewServices";
import { OrganizationServices } from "@/services/organizationServices";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import Link from "next/link";
import ChooseUs from "./Features";
import WorkingHoursSection from "./WorkingHoursSection";

interface Overview {
  id: number;
  description: string;
  company_img: string;
}

interface Organization {
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkdin_url: string;
}

export default function AboutSection() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      CompanyOverviewServices.getDetails(),
      OrganizationServices.getDetails(),
    ])
      .then(([overviewData, orgData]) => {
        setOverview(
          Array.isArray(overviewData) ? overviewData[0] : overviewData,
        );
        setOrg(Array.isArray(orgData) ? orgData[0] : orgData);
      })
      .finally(() => setLoading(false));
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  if (loading) return <div className="min-h-[600px]" />;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      className="max-w-7xl mx-auto px-6 py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Side: Image */}
        <motion.div
          variants={itemVariants}
          className="relative aspect-[4/3] w-full shadow-xl"
        >
          <Image
            src={overview?.company_img || "/placeholder.jpg"}
            alt="About Us"
            sizes="(max-width: 768px) 100vw, 50vw"
            fill
            unoptimized
            className="object-cover rounded-sm"
          />
          
        </motion.div>

        {/* Right Side: Content */}
        <div className="flex flex-col gap-8">
          <motion.div variants={itemVariants} className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-[2px] bg-[#c47c30]" />
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#c47c30]">
                About Us
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-serif text-[#1b2a2f] leading-[1.1] font-medium">
              We invite you to visit our restaurant
            </h2>

            <div className="text-[#666] leading-relaxed text-base font-light border-l-2 border-[#c47c30] pl-6">
              <div
                dangerouslySetInnerHTML={{
                  __html: overview?.description || "Description placeholder...",
                }}
              />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-8"
          >
            <Link
              href="/about-us"
              className="bg-[#c47c30] text-white px-8 py-3.5 font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#e0961f] transition-all"
            >
              Read More
            </Link>

            <div className="flex gap-5 text-[#1b2a2f]">
              {org?.facebook_url && (
                <Link href={org.facebook_url} target="_blank">
                  <FaFacebookF className="hover:text-[#c47c30] transition-colors" />
                </Link>
              )}
              {org?.instagram_url && (
                <Link href={org.instagram_url} target="_blank">
                  <FaInstagram className="hover:text-[#c47c30] transition-colors" />
                </Link>
              )}
              {org?.twitter_url && (
                <Link href={org.twitter_url} target="_blank">
                  <FaTwitter className="hover:text-[#c47c30] transition-colors" />
                </Link>
              )}
              {org?.linkdin_url && (
                <Link href={org.linkdin_url} target="_blank">
                  <FaLinkedinIn className="hover:text-[#c47c30] transition-colors" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      {/* Features Section placed logically below main content */}
      <motion.div
        variants={itemVariants}
        className="mt-2 "
      >
        <ChooseUs />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-2 "
      >
        <WorkingHoursSection />
      </motion.div>
    </motion.section>
  );
}
