"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Quote } from "lucide-react";
import { TeamServices } from "@/services/teamServices";
import { ChairmanMessageServices } from "@/services/chairmanmessageServices";
import { ProjectsServices } from "@/services/projectsServices";
import { JobServices } from "@/services/jobServices";

interface ChairmanMessage {
  id: number;
  title: string;
  description: string;
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  image: string;
  order: number;
}

// ── Strip HTML → plain text (used only for the pull-quote card) ───────────────
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCount({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function AboutSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="max-w-7xl mx-auto md:px-12 px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="flex flex-col items-center gap-6 order-1 lg:order-2">
          <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-gray-200" />
          <div className="h-5 w-36 bg-gray-200 rounded-full" />
          <div className="h-3 w-24 bg-gray-200 rounded-full" />
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5 order-2 lg:order-1">
          <div className="h-10 w-4/5 bg-gray-200 rounded-full" />
          <div className="h-10 w-3/5 bg-gray-200 rounded-full" />
          <div className="mt-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-3 bg-gray-200 rounded-full ${i === 5 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, color, index }: {
  value: number; suffix?: string; label: string; color: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      className="flex flex-col items-center bg-gray-50 rounded-lg py-4 px-2 border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all duration-200 hover:scale-105"
    >
      <span className={`text-2xl font-black ${color}`}>
        <AnimatedCount target={value} suffix={suffix} />
      </span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 text-center leading-tight">
        {label}
      </span>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function About() {
  const [message, setMessage] = useState<ChairmanMessage | null>(null);
  const [ceo, setCeo] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ projects: 0, totalJobs: 0, hiringJobs: 0, teamSize: 0 });

  useEffect(() => {
    async function fetchAll() {
      try {
        const [msgData, teamData, projectsData, jobsData] = await Promise.all([
          ChairmanMessageServices.getDetails(),
          TeamServices.getDetails(),
          ProjectsServices.getDetails(),
          JobServices.getDetails(),
        ]);

        const msgs: ChairmanMessage[] = Array.isArray(msgData) ? msgData : [];
        setMessage(msgs[0] ?? null);

        const team: TeamMember[] = Array.isArray(teamData) ? teamData : [];
        setCeo(team.find((m) => m.order === 1) ?? null);

        const projects = Array.isArray(projectsData) ? projectsData : [];
        const jobs = Array.isArray(jobsData) ? jobsData : [];
        const hiringJobs = jobs.filter(
          (j: any) => String(j.status).toUpperCase() === "HIRING",
        );

        setStats({
          projects: projects.length,
          totalJobs: jobs.length,
          hiringJobs: hiringJobs.length,
          teamSize: team.length,
});
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <AboutSkeleton />;

  if (!message && !ceo) {
    return (
      <div className="py-40 text-center text-gray-400">No information available.</div>
    );
  }

  // Plain text — only for the pull-quote card, not the main body
  const plainText = stripHtml(message?.description ?? "");

  const STATS = [
    { value: stats.projects,   suffix: "+", label: "Projects",     color: "text-green-600"  },
    { value: stats.totalJobs,  suffix: "+", label: "Total Jobs",   color: "text-yellow-500" },
    { value: stats.hiringJobs, suffix: "+", label: "Now Hiring",   color: "text-emerald-600"},
    { value: stats.teamSize,   suffix: "+", label: "Team Members", color: "text-yellow-500" },
  ];

  return (
    <div className="overflow-hidden">
      <div className="max-w-7xl mx-auto md:px-12 px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── LEFT: Message text ── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6 order-2 lg:order-1"
          >
            <div>
              <p className="text-green-600 font-semibold text-sm uppercase tracking-widest mb-2">
                A Word From Our Leader
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-950 leading-tight">
                {message?.title ?? "Chairman's Message"}
              </h2>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "3.5rem" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full mt-3"
              />
            </div>

            <Quote size={52} className="text-green-100 -mb-4 shrink-0" fill="currentColor" />

            {/* ── CKEditor HTML rendered with prose styles ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="
                prose prose-sm max-w-none text-justify
                [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-[15px] [&_p]:text-gray-600
                [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1
                [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:space-y-1
                [&_li]:text-gray-600 [&_li]:text-[15px]
                [&_h4]:font-bold [&_h4]:text-blue-900 [&_h4]:mb-2 [&_h4]:mt-4
                [&_b]:text-gray-800
                [&_strong]:text-gray-800
                [&_i]:italic
                [&_em]:italic
              "
              dangerouslySetInnerHTML={{ __html: message?.description ?? "" }}
            />

            <div className="flex justify-end">
              <Quote size={36} className="text-green-100 rotate-180 shrink-0" fill="currentColor" />
            </div>

            {/* Signature strip */}
            {ceo && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-4 pt-4 border-t border-gray-100"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-500 shrink-0">
                  <Image
                    src={ceo.image}
                    alt={ceo.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{ceo.name}</p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest">{ceo.position}</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent" />
              </motion.div>
            )}
          </motion.div>

          {/* ── RIGHT: CEO visual ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col items-center gap-6 order-1 lg:order-2 lg:sticky lg:top-24"
          >
            <div className="relative flex items-center justify-center md:mt-16">
              <motion.div
                className="absolute w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full border-2 border-green-400/30"
                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute w-56 h-56 sm:w-60 sm:h-60 md:w-94 md:h-94 rounded-full border-2 border-green-500/20"
                animate={{ scale: [1.05, 1, 1.05], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              />
              <div
                className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-79 md:h-79 rounded-full flex items-center justify-center"
                style={{
                  borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
                  backgroundColor: "#FFEA94",
                  backgroundImage: `radial-gradient(#22c55e 1.5px, transparent 1.5px)`,
                  backgroundSize: "20px 20px",
                  animation: "morph 2s ease-in-out infinite alternate",
                }}
              >
                <style jsx>{`
                  @keyframes morph {
                    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                    100% { border-radius: 30% 70% 40% 60% / 50% 40% 60% 40%; }
                  }
                `}</style>
              </div>
              <div className="absolute w-48 h-48 sm:w-62 sm:h-62 md:w-78 md:h-78 rounded-full overflow-hidden shadow-2xl border-4 border-white">
                {ceo?.image ? (
                  <Image
                    src={ceo.image}
                    alt={ceo?.name ?? "Leader"}
                    fill
                    unoptimized
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                    <span className="text-5xl font-black text-green-600">
                      {ceo?.name?.[0] ?? "C"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <h3 className="text-xl font-extrabold text-gray-900">{ceo?.name ?? "—"}</h3>
              <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">{ceo?.position ?? "—"}</p>
            </motion.div>

            <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
              {STATS.map((stat, i) => (
                <StatCard key={stat.label} {...stat} index={i} />
              ))}
            </div>

            {/* Pull-quote card — plain text only, no HTML tags */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-full relative bg-gradient-to-br from-green-600 to-emerald-500 rounded-lg p-5 text-white shadow-lg shadow-green-200 overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 text-white/10 pointer-events-none select-none">
                <Quote size={80} fill="currentColor" />
              </div>
              <p className="text-[13px] leading-relaxed font-medium relative z-10 italic line-clamp-4">
                {plainText || "A message of leadership and vision."}
              </p>
              <div className="mt-3 w-8 h-0.5 bg-white/50 rounded-full" />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}