"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChefHat,} from "lucide-react"; // Import Twitter as fallback for X
import { TeamServices } from "@/services/teamServices";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  image: string;
  order: number;
}

// ── Skeleton (Matching the rectangular card UI) ───────────────────────────────
function TeamSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-[#E9E1D9] flex flex-col items-center gap-4 animate-pulse">
          <div className="w-32 h-32 rounded-full bg-[#F3EEE9]" /> {/* Round avatar skeleton */}
          <div className="h-5 w-3/4 bg-[#F3EEE9] rounded" /> {/* Name skeleton */}
          <div className="h-4 w-1/2 bg-[#F3EEE9] rounded" /> {/* Position skeleton */}
          <div className="flex gap-4 mt-2"> {/* Icons skeleton */}
            <div className="h-5 w-5 bg-[#F3EEE9] rounded-full" />
            <div className="h-5 w-5 bg-[#F3EEE9] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Single Card (Refactored to match exact UI of reference image) ─────────────────
export function MemberCard({
  member,
  index,
}: {
  member: TeamMember;
  index: number;
}) {
  // Extracting X and Linkedin if they exist in a real implementation (for demo we use fallback)
  // In a real app, these would come from member.socialX and member.socialLinkedin, etc.

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-[#E9E1D9] flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:border-[#DDCBC0]"
    >
      {/* Round Avatar Container (matching size/style from reference image) */}
      <div className="w-32 h-32 rounded-full overflow-hidden mb-5 flex items-center justify-center border-4 border-[#FDFBFA] shadow-inner">
        <Image
          src={member.image}
          alt={member.name}
          width={128}
          height={128}
          unoptimized // Use unoptimized only if required by your backend
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Name (matching serif-style font feel and color from palette) */}
      <p className="font-serif font-bold text-[#c47c30] text-[17px] leading-tight line-clamp-1 mb-1.5">
        {member.name}
      </p>

      {/* Position (matching smaller, beige text from reference image) */}
      <p className="text-[#A29184] text-[13px] font-medium leading-tight capitalize line-clamp-1 mb-5">
        {member.position}
      </p>

      
    </motion.div>
  );
}

export default function BoardOfDirectors() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    TeamServices.getDetails()
      .then((data) => {
        const list: TeamMember[] = Array.isArray(data) ? data : [];
        setMembers(list.sort((a, b) => a.order - b.order));
      })
      .catch((err) => setError(TeamServices.parseError(err)))
      .finally(() => setLoading(false));
  }, []);

  const preview = members.slice(0, 5);

  return (
    <section className=" max-w-full mx-auto px-6 py-16 md:px-16 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-20 flex flex-col items-center"
      >
        {/* Kitchen-specific subtitle */}
        <div className="flex items-center gap-2 mb-2 text-[#c47c30]">
          <ChefHat size={20} strokeWidth={1.5} className="-mt-0.5" />
          <p className="font-medium text-[15px] uppercase tracking-widest">
            The Culinary Artisans
          </p>
        </div>

        {/* Warm, inviting title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#2D241F] max-w-4xl leading-tight mb-5">
          Meet the Hands That Craft Your Experience
        </h2>

        {/* Descriptive, welcoming paragraph */}
        <p className="text-[#6D625A] text-base md:text-lg max-w-3xl leading-relaxed">
          From our master chefs to our dedicated front-of-house team, these are the 
          passionate individuals committed to bringing flavor, warmth, and 
          excellence to every plate we serve.
        </p>
      </motion.div>

      {loading && <TeamSkeleton count={5} />}

      {error && !loading && (
        <div className="text-center py-16 border border-[#E9E1D9] rounded-lg bg-white shadow-sm">
          <p className="text-red-500 font-semibold text-lg">{error}</p>
        </div>
      )}

      {!loading && !error && members.length === 0 && (
        <div className="text-center py-16 border border-[#E9E1D9] rounded-lg bg-white shadow-sm">
          <p className="text-[#A29184] text-lg font-medium">No team members yet.</p>
        </div>
      )}

      {!loading && !error && preview.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
            {preview.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>

          {members.length > 5 && (
            <div className="flex justify-center mt-16">
              <Link
                href="/teams"
                className="flex items-center gap-2.5 bg-[#c47c30] text-white px-8 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#5D4037] transition-colors shadow-md shadow-[#DDCBC0]"
              >
                View All Members <ArrowRight size={18} strokeWidth={2.5} />
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}