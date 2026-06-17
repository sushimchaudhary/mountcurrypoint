"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TeamServices } from "@/services/teamServices";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  image: string;
  order: number;
}

const CARD_PALETTES = [
  { card: "#EFF6FF", circle: "#ffff" },
  { card: "#F3F4F6", circle: "#ffff" },
  { card: "#ECFDF5", circle: "#ffff" },
  { card: "#FFF1F2", circle: "#ffff" },
  { card: "#FFFBEB", circle: "#ffff" },
  { card: "#F5F3FF", circle: "#ffff" },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TeamSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center animate-pulse">
          {/* Circle */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 mb-[-2rem] z-10 relative" />
          {/* Card */}
          <div className="w-full pt-12 pb-5 px-3 rounded-lg bg-gray-100 flex flex-col items-center gap-2">
            <div className="h-3 w-24 bg-gray-200 rounded-full" />
            <div className="h-2.5 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Single card ───────────────────────────────────────────────────────────────
export function MemberCard({
  member,
  index,
}: {
  member: TeamMember;
  index: number;
}) {
  const palette = CARD_PALETTES[index % CARD_PALETTES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="flex flex-col items-center"
    >
      {/* Avatar — overlaps card */}
      <div
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shrink-0 mb-[-2rem] z-10 relative shadow-md"
        style={{ backgroundColor: palette.circle }}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden">
          <Image
            src={member.image}
            alt={member.name}
            width={80}
            height={80}
            unoptimized
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>

      {/* Card body */}
      <div
        className="w-full rounded-lg pt-15 pb-4 px-3 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-300"
        style={{ backgroundColor: palette.card }}
      >
        <p className="font-bold text-gray-900 text-[13px] sm:text-[14px] leading-snug line-clamp-1">
          {member.name}
        </p>
        <p className="text-gray-400 text-[11px] sm:text-[12px] mt-1 capitalize line-clamp-1">
          {member.position}
        </p>
      </div>
    </motion.div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────
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
    <section className="max-w-7xl mx-auto md:px-12 px-4 py-12">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-1">
          Our Team Members
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
          Meet the Brilliant Minds Behind Our Success
        </h2>
        <p className="text-gray-400 mt-3 text-sm md:text-base max-w-xl mx-auto">
          A passionate team of innovators, creators, and problem-solvers working
          together to make an impact.
        </p>
      </motion.div>

      {/* Skeleton */}
      {loading && <TeamSkeleton count={5} />}

      {/* Error */}
      {error && !loading && (
        <p className="text-center text-red-500 font-medium py-10">{error}</p>
      )}

      {/* Empty */}
      {!loading && !error && members.length === 0 && (
        <p className="text-center text-gray-400 py-10">No team members yet.</p>
      )}

      {/* Grid: 2 cols on mobile → 3 sm → 4 md → 5 lg */}
      {!loading && !error && preview.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {preview.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>

          {/* View All button */}
          {members.length > 5 && (
            <div className="flex justify-center mt-10">
              <Link
                href="/teams"
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors shadow-md shadow-green-200"
              >
                View All Members <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}