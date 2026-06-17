"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TeamServices } from "@/services/teamServices";
import { MemberCard } from "@/components/BoardOfDirectors";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  image: string;
  order: number;
}

// ── Skeleton reused here too ──
function TeamSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex gap-5 justify-center flex-wrap">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center w-[180px] animate-pulse">
          <div className="w-28 h-28 rounded-full bg-gray-200 mb-[-2.5rem] z-10 relative" />
          <div className="w-full pt-14 pb-5 px-4 rounded-2xl bg-gray-100 flex flex-col items-center gap-2">
            <div className="h-4 w-28 bg-gray-200 rounded-full" />
            <div className="h-3 w-20 bg-gray-200 rounded-full" />
            <div className="flex gap-2 mt-3">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="w-5 h-5 rounded-full bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeamPage() {
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Banner */}
      <section className="py-16 bg-gray-800 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Team</h1>
        <div className="flex items-center justify-center gap-2 text-sm md:text-base">
          <Link href="/" className="hover:text-green-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-green-500 font-semibold">Team</span>
        </div>
      </section>

      <section className="md:px-12 px-2 py-16">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Meet the Brilliant Minds Behind Our Success
          </h2>
          <p className="text-gray-400 mt-3 text-sm md:text-base max-w-xl mx-auto">
            A passionate team of innovators, creators, and problem-solvers
            working together to make an impact.
          </p>
         
        </motion.div>

        {loading && <TeamSkeleton count={8} />}

        {error && !loading && (
          <p className="text-center text-red-500 font-medium py-10">{error}</p>
        )}

        {!loading && !error && members.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            No team members yet.
          </p>
        )}

        {/* All members */}
        {!loading && !error && members.length > 0 && (
          <div className="flex flex-wrap justify-center gap-10">
            {members.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}