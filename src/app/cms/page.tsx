"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users2,
  FolderKanban,
  Image as ImageIcon,
  BriefcaseBusiness,
  MessageSquareText,
  SlidersHorizontal,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
 
} from "recharts";
import { useTheme } from "@/lib/context/ThemeContext";
import { ContactServices } from "@/services/contactServices";
import { GalleryServices } from "@/services/galleryServices";
import { JobServices, JobApplicationServices } from "@/services/jobServices";
import { ProjectsServices } from "@/services/projectsServices";
import { SliderServices } from "@/services/sliderServices";
import { TeamServices } from "@/services/teamServices";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardStats {
  contacts: number;
  gallery: number;
  jobs: number;
  hiringJobs: number;
  applications: number;
  projects: number;
  sliders: number;
  team: number;
}

interface RecentContact {
  id: number;
  name: string;
  subject: string;
  created_at?: string;
}

// ── Color helper ──────────────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(
    clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shade(hex: string, percent: number) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

// ── Build last-14-days submission trend from contacts + applications ─────────
function buildTrend(contacts: any[], applications: any[]) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    return { date, label: format(date, "dd MMM"), messages: 0, applications: 0 };
  });

  const countInto = (items: any[], key: "messages" | "applications") => {
    items.forEach((item) => {
      const dateField = item.created_at || item.submitted_at;
      if (!dateField) return;
      const itemDate = new Date(dateField);
      const bucket = days.find(
        (d) =>
          d.date.toDateString() === itemDate.toDateString()
      );
      if (bucket) bucket[key] += 1;
    });
  };

  countInto(contacts, "messages");
  countInto(applications, "applications");

  return days;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg" />
        <div className="h-96 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

// ── Primary stat (top row, larger) ────────────────────────────────────────────
function PrimaryStat({
  icon: Icon,
  label,
  value,
  href,
  trend,
  primaryColor,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
  trend?: number;
  primaryColor: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Link href={href}>
        <div className="group relative bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
          {/* Gradient wash */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.04)}, transparent 60%)`,
            }}
          />
          <div className="relative flex items-start justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor }}
            >
              <Icon size={18} />
            </div>
            <ArrowUpRight
              size={14}
              className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
            />
          </div>
          <p className="text-3xl font-black text-gray-900 tabular-nums leading-none">
            {value}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {label}
            </p>
            {trend !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  trend >= 0
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-rose-600 bg-rose-50"
                }`}
              >
                {trend >= 0 ? "+" : ""}
                {trend}%
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Compact list-style stat (sidebar) ─────────────────────────────────────────
function MiniStat({
  icon: Icon,
  label,
  value,
  href,
  primaryColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
  primaryColor: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor }}
        >
          <Icon size={14} />
        </div>
        <span className="text-[12px] font-semibold text-gray-600 flex-1">{label}</span>
        <span className="text-[13px] font-black text-gray-900 tabular-nums">{value}</span>
        <ChevronRight
          size={12}
          className="text-gray-200 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </Link>
  );
}

// ── Custom tooltip for the area chart ─────────────────────────────────────────
function ChartTooltip({ active, payload, label, primaryColor }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2.5 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.dataKey === "messages" ? primaryColor : "#fbbf24" }}
          />
          <span className="text-gray-500 capitalize">{p.dataKey}:</span>
          <span className="font-bold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { primaryColor } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    contacts: 0, gallery: 0, jobs: 0, hiringJobs: 0,
    applications: 0, projects: 0, sliders: 0, team: 0,
  });
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [trend, setTrend] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          contactsRes, galleryRes, jobsRes, applicationsRes,
          projectsRes, slidersRes, teamRes,
        ] = await Promise.all([
          ContactServices.getList().catch(() => []),
          GalleryServices.getDetails().catch(() => []),
          JobServices.getDetails().catch(() => []),
          JobApplicationServices.getApplications().catch(() => []),
          ProjectsServices.getDetails().catch(() => []),
          SliderServices.getDetails().catch(() => []),
          TeamServices.getDetails().catch(() => []),
        ]);

        const contacts = Array.isArray(contactsRes) ? contactsRes : contactsRes?.results || [];
        const gallery = Array.isArray(galleryRes) ? galleryRes : [];
        const jobs = Array.isArray(jobsRes) ? jobsRes : [];
        const applications = Array.isArray(applicationsRes) ? applicationsRes : applicationsRes?.results || [];
        const projects = Array.isArray(projectsRes) ? projectsRes : [];
        const sliders = Array.isArray(slidersRes) ? slidersRes : [];
        const team = Array.isArray(teamRes) ? teamRes : [];

        const hiringJobs = jobs.filter((j: any) => j.status === "HIRING").length;

        setStats({
          contacts: contacts.length,
          gallery: gallery.length,
          jobs: jobs.length,
          hiringJobs,
          applications: applications.length,
          projects: projects.length,
          sliders: sliders.length,
          team: team.length,
        });

        const sortedContacts = [...contacts]
          .sort((a: any, b: any) =>
            a.created_at && b.created_at
              ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              : 0
          )
          .slice(0, 5);
        setRecentContacts(sortedContacts);

        setTrend(buildTrend(contacts, applications));
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const contentDistribution = [
    { name: "Projects", value: stats.projects, color: primaryColor },
    { name: "Gallery", value: stats.gallery, color: shade(primaryColor, 40) },
    { name: "Jobs", value: stats.jobs, color: shade(primaryColor, 80) },
    { name: "Sliders", value: stats.sliders, color: shade(primaryColor, -30) },
    { name: "Team", value: stats.team, color: "#fbbf24" },
  ].filter((d) => d.value > 0);

  const totalContent =
    stats.projects + stats.gallery + stats.jobs + stats.sliders + stats.team;

  const weekMessages = trend.reduce((sum, d) => sum + d.messages, 0);
  const weekApplications = trend.reduce((sum, d) => sum + d.applications, 0);

  return (

     <div className="h-screen overflow-y-auto scrollbar-hide">
    <div className="space-y-5 ">
      {/* ── Hero header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-lg overflow-hidden p-6 md:p-8 "
        style={{
          background: `linear-gradient(120deg, ${primaryColor} 0%, ${shade(primaryColor, -25)} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* Floating decorative ring */}
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full border border-white/10" />
        <div className="absolute -right-4 top-10 w-32 h-32 rounded-full border border-white/10" />

        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
              <Sparkles size={12} />
              {format(new Date(), "EEEE, dd MMMM yyyy")}
            </div>
            <h1 className="text-2xl md:text-[28px] font-extrabold text-white leading-tight">
              Welcome back 👋
            </h1>
            <p className="text-white/75 text-sm mt-1.5 max-w-md">
              {totalContent} pieces of content live across your site, with{" "}
              {stats.hiringJobs} open position{stats.hiringJobs !== 1 ? "s" : ""} hiring now.
            </p>
          </div>

          {/* Mini summary pills */}
          <div className="flex gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[88px]">
              <p className="text-white text-xl font-black tabular-nums">{weekMessages}</p>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                Msgs / 14d
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[88px]">
              <p className="text-white text-xl font-black tabular-nums">{weekApplications}</p>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                Apps / 14d
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    <div className="flex justify-end mt-4">
      <Link 
        href="/" 
        className="px-6 py-2  text-[#007f35] font-semibold  hover:underline flex items-center gap-2"
      >
        Visit Website <span>→</span>
      </Link>
    </div>

      {/* ── Primary stat row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PrimaryStat icon={MessageSquareText} label="Messages" value={stats.contacts} href="/cms/contacts" primaryColor={primaryColor} index={0} />
        <PrimaryStat icon={FolderKanban} label="Projects" value={stats.projects} href="/cms/project-manage" primaryColor={primaryColor} index={1} />
        <PrimaryStat icon={BriefcaseBusiness} label="Open Jobs" value={stats.hiringJobs} href="/cms/jobs-details" primaryColor={primaryColor} index={2} />
        <PrimaryStat icon={Users2} label="Applications" value={stats.applications} href="/cms/job-applications" primaryColor={primaryColor} index={3} />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Area chart: submissions trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Submissions — Last 14 Days
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Contact messages vs. job applications
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="text-[11px] text-gray-500 font-medium">Messages</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px] text-gray-500 font-medium">Applications</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="msgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip content={<ChartTooltip primaryColor={primaryColor} />} />
              <Area
                type="monotone"
                dataKey="messages"
                stroke={primaryColor}
                strokeWidth={2.5}
                fill="url(#msgGradient)"
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#fbbf24"
                strokeWidth={2.5}
                fill="url(#appGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut chart: content distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex flex-col"
        >
          <h3 className="text-sm font-bold text-gray-800 mb-1">
            Content Distribution
          </h3>
          <p className="text-[11px] text-gray-400 mb-2">
            {totalContent} items across all modules
          </p>

          <div className="relative flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contentDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {contentDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0];
                    return (
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-xs">
                        <span className="font-bold text-gray-700">{d.name}</span>
                        <span className="text-gray-400">: {d.value as number}</span>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-gray-900">{totalContent}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Total
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
            {contentDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-[11px] text-gray-500 truncate">
                  {d.name} <span className="font-bold text-gray-700">({d.value})</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom row: messages list + mini stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent messages */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <MessageSquareText size={16} style={{ color: primaryColor }} />
              <h3 className="text-sm font-bold text-gray-800">Recent Messages</h3>
            </div>
            <Link
              href="/cms/contacts"
              className="text-[11px] font-bold uppercase tracking-wider hover:underline"
              style={{ color: primaryColor }}
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <MessageSquareText size={28} className="text-gray-200" />
                <p className="text-xs text-gray-400">No messages yet.</p>
              </div>
            ) : (
              recentContacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {c.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-gray-800 truncate">{c.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{c.subject}</p>
                  </div>
                  {c.created_at && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-300 shrink-0">
                      <Clock size={10} />
                      {format(new Date(c.created_at), "dd MMM")}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Mini stats sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.46 }}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-3"
        >
          <h3 className="text-sm font-bold text-gray-800 px-2 pt-2 mb-1">
            All Modules
          </h3>
          <div className="flex flex-col">
            <MiniStat icon={ImageIcon} label="Gallery" value={stats.gallery} href="/cms/galleries" primaryColor={primaryColor} />
            <MiniStat icon={SlidersHorizontal} label="Sliders" value={stats.sliders} href="/cms/slider-images" primaryColor={primaryColor} />
            <MiniStat icon={Users2} label="Team Members" value={stats.team} href="/cms/team-members" primaryColor={primaryColor} />
            <MiniStat icon={BriefcaseBusiness} label="Total Jobs" value={stats.jobs} href="/cms/jobs-details" primaryColor={primaryColor} />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
        <p className="text-center border-t border-gray-300 mt-5 text-[11px] text-gray-600 p-4">
          Arya Tara · CMS · © {new Date().getFullYear()}
        </p>
    </div>
    </div>
  );
}