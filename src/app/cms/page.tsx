"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DollarSign,
  ClipboardList,
  ChefHat,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wallet,
  Receipt,
  Banknote,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { format, subDays, isSameDay } from "date-fns";
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
import { BillServices } from "@/services/billServices";
import { OrderServices } from "@/services/orderServices";
import { OrganizationServices } from "@/services/organizationServices";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardStats {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  totalRevenue: number;
  pendingAmount: number;
  avgBillValue: number;
  todayRevenue: number;
  todayOrders: number;
  totalOrders: number;
  openOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenueTrend?: number;
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  digital_wallet: "QR Pay",
};

const PAYMENT_COLORS: Record<string, string> = {
  cash: "#22c55e",
  card: "#3b82f6",
  digital_wallet: "#a855f7",
};

const PAYMENT_ICONS: Record<string, React.ElementType> = {
  cash: Banknote,
  card: CreditCard,
  digital_wallet: Smartphone,
};

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

// ── Build last-14-days revenue + order volume trend from bills + orders ──────
function buildTrend(bills: any[], orders: any[]) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i);
    return { date, label: format(date, "dd MMM"), revenue: 0, orders: 0 };
  });

  bills.forEach((bill) => {
    if (!bill.created_at) return;
    const billDate = new Date(bill.created_at);
    const bucket = days.find((d) => d.date.toDateString() === billDate.toDateString());
    if (bucket) bucket.revenue += Number(bill.grand_total) || 0;
  });

  orders.forEach((order) => {
    if (!order.created_at) return;
    const orderDate = new Date(order.created_at);
    const bucket = days.find((d) => d.date.toDateString() === orderDate.toDateString());
    if (bucket) bucket.orders += 1;
  });

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
  value: number | string;
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
  value: number | string;
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

// ── Custom tooltip for the area chart (handles $ revenue + order counts) ─────
function ChartTooltip({ active, payload, label, primaryColor }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2.5 text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.dataKey === "revenue" ? primaryColor : "#fbbf24" }}
          />
          <span className="text-gray-500 capitalize">{p.dataKey}:</span>
          <span className="font-bold text-gray-800">
            {p.dataKey === "revenue" ? `$${Number(p.value).toFixed(2)}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { primaryColor } = useTheme();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalBills: 0, paidBills: 0, unpaidBills: 0,
    totalRevenue: 0, pendingAmount: 0, avgBillValue: 0,
    todayRevenue: 0, todayOrders: 0, totalOrders: 0,
    openOrders: 0, completedOrders: 0, cancelledOrders: 0,
  });
  const [trend, setTrend] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [billsRes, ordersRes, orgRes] = await Promise.all([
          BillServices.getDetails().catch(() => []),
          OrderServices.getDetails().catch(() => []),
          OrganizationServices.getDetails().catch(() => []),
        ]);

        const billsList = Array.isArray(billsRes) ? billsRes : billsRes?.results || [];
        const ordersList = Array.isArray(ordersRes) ? ordersRes : ordersRes?.results || [];
        const orgList = Array.isArray(orgRes) ? orgRes : orgRes?.results || orgRes?.data || [];

        setBills(billsList);
        setOrders(ordersList);
        setRestaurant(orgList[0] || null);

        const paid = billsList.filter((b: any) => b.is_paid);
        const unpaid = billsList.filter((b: any) => !b.is_paid);
        const totalRevenue = paid.reduce((sum: number, b: any) => sum + (Number(b.grand_total) || 0), 0);
        const pendingAmount = unpaid.reduce((sum: number, b: any) => sum + (Number(b.grand_total) || 0), 0);
        const avgBillValue = paid.length > 0 ? totalRevenue / paid.length : 0;

        const today = new Date();
        const yesterday = subDays(today, 1);
        const todayBills = billsList.filter((b: any) => b.created_at && isSameDay(new Date(b.created_at), today));
        const yesterdayBills = billsList.filter((b: any) => b.created_at && isSameDay(new Date(b.created_at), yesterday));
        const todayOrdersList = ordersList.filter((o: any) => o.created_at && isSameDay(new Date(o.created_at), today));

        const todayRevenue = todayBills.reduce((sum: number, b: any) => sum + (Number(b.grand_total) || 0), 0);
        const yesterdayRevenue = yesterdayBills.reduce((sum: number, b: any) => sum + (Number(b.grand_total) || 0), 0);
        const revenueTrend = yesterdayRevenue > 0
          ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
          : undefined;

        const openOrders = ordersList.filter((o: any) => ["pending", "preparing", "served"].includes(o.status)).length;
        const completedOrders = ordersList.filter((o: any) => o.status === "completed").length;
        const cancelledOrders = ordersList.filter((o: any) => o.status === "cancelled").length;

        setStats({
          totalBills: billsList.length,
          paidBills: paid.length,
          unpaidBills: unpaid.length,
          totalRevenue,
          pendingAmount,
          avgBillValue,
          todayRevenue,
          todayOrders: todayOrdersList.length,
          totalOrders: ordersList.length,
          openOrders,
          completedOrders,
          cancelledOrders,
          revenueTrend,
        });

        setTrend(buildTrend(billsList, ordersList));
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) return <DashboardSkeleton />;

  // Payment method breakdown (by revenue collected)
  const paymentDistribution = Object.entries(
    bills.reduce((acc: Record<string, number>, b: any) => {
      const method = b.payment_method || "other";
      acc[method] = (acc[method] || 0) + (Number(b.grand_total) || 0);
      return acc;
    }, {})
  )
    .map(([method, value]) => ({
      method,
      name: PAYMENT_LABELS[method] || method,
      value: value as number,
      color: PAYMENT_COLORS[method] || "#9ca3af",
    }))
    .filter((d) => d.value > 0);

  const recentBills = [...bills]
    .sort((a: any, b: any) =>
      a.created_at && b.created_at
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : 0
    )
    .slice(0, 5);

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
              Welcome back{restaurant?.title ? `, ${restaurant.title}` : ""} 👋
            </h1>
            <p className="text-white/75 text-sm mt-1.5 max-w-md">
              {stats.totalBills} bill{stats.totalBills !== 1 ? "s" : ""} generated so far, with{" "}
              {stats.unpaidBills} still awaiting payment.
            </p>
          </div>

          {/* Mini summary pills */}
          <div className="flex gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[88px]">
              <p className="text-white text-xl font-black tabular-nums">${stats.todayRevenue.toFixed(0)}</p>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                Revenue Today
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[88px]">
              <p className="text-white text-xl font-black tabular-nums">{stats.todayOrders}</p>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
                Orders Today
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
        <PrimaryStat
          icon={DollarSign}
          label="Today's Revenue"
          value={`$${stats.todayRevenue.toFixed(2)}`}
          href="/cms/bills"
          trend={stats.revenueTrend}
          primaryColor={primaryColor}
          index={0}
        />
        <PrimaryStat
          icon={ClipboardList}
          label="Orders Today"
          value={stats.todayOrders}
          href="/cms/orders"
          primaryColor={primaryColor}
          index={1}
        />
        <PrimaryStat
          icon={ChefHat}
          label="Open Orders"
          value={stats.openOrders}
          href="/cms/orders"
          primaryColor={primaryColor}
          index={2}
        />
        <PrimaryStat
          icon={AlertCircle}
          label="Unpaid Bills"
          value={stats.unpaidBills}
          href="/cms/bills"
          primaryColor={primaryColor}
          index={3}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Area chart: revenue & order volume trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Revenue & Orders — Last 14 Days
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Daily billed revenue vs. order volume
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="text-[11px] text-gray-500 font-medium">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px] text-gray-500 font-medium">Orders</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 16, right: 8, left: -4, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordGradient" x1="0" y1="0" x2="0" y2="1">
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
                yAxisId="revenue"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip content={<ChartTooltip primaryColor={primaryColor} />} />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke={primaryColor}
                strokeWidth={2.5}
                fill="url(#revGradient)"
              />
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke="#fbbf24"
                strokeWidth={2.5}
                fill="url(#ordGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut chart: payment method breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex flex-col"
        >
          <h3 className="text-sm font-bold text-gray-800 mb-1">
            Payment Methods
          </h3>
          <p className="text-[11px] text-gray-400 mb-2">
            ${stats.totalRevenue.toFixed(2)} collected across {stats.paidBills} paid bill{stats.paidBills !== 1 ? "s" : ""}
          </p>

          {paymentDistribution.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
              <Wallet size={28} className="text-gray-200" />
              <span className="text-[11px] text-gray-400 font-semibold">No paid bills yet</span>
            </div>
          ) : (
            <>
              <div className="relative flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {paymentDistribution.map((entry) => (
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
                            <span className="text-gray-400">: ${Number(d.value).toFixed(2)}</span>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-900">${stats.totalRevenue.toFixed(0)}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Revenue
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-1 gap-y-1.5 mt-3">
                {paymentDistribution.map((d) => {
                  const Icon = PAYMENT_ICONS[d.method] || Wallet;
                  return (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <Icon size={11} style={{ color: d.color }} />
                      <span className="text-[11px] text-gray-500 truncate flex-1">{d.name}</span>
                      <span className="text-[11px] font-bold text-gray-700">${d.value.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Bottom row: recent bills + mini stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent bills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Receipt size={16} style={{ color: primaryColor }} />
              <h3 className="text-sm font-bold text-gray-800">Recent Bills</h3>
            </div>
            <Link
              href="/cms/bills"
              className="text-[11px] font-bold uppercase tracking-wider hover:underline"
              style={{ color: primaryColor }}
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Receipt size={28} className="text-gray-200" />
                <p className="text-xs text-gray-400">No bills yet.</p>
              </div>
            ) : (
              recentBills.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    #{b.id}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-gray-800 truncate">
                      Table {b.table_number ?? "—"} · ${Number(b.grand_total).toFixed(2)}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {PAYMENT_LABELS[b.payment_method] || b.payment_method}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      b.is_paid ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                    }`}
                  >
                    {b.is_paid ? "Paid" : "Unpaid"}
                  </span>
                  {b.created_at && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-300 shrink-0">
                      <Clock size={10} />
                      {format(new Date(b.created_at), "dd MMM")}
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
            Quick Stats
          </h3>
          <div className="flex flex-col">
            <MiniStat icon={CheckCircle2} label="Paid Bills" value={stats.paidBills} href="/cms/bills" primaryColor={primaryColor} />
            <MiniStat icon={AlertCircle} label="Unpaid Bills" value={stats.unpaidBills} href="/cms/bills" primaryColor={primaryColor} />
            <MiniStat icon={XCircle} label="Cancelled Orders" value={stats.cancelledOrders} href="/cms/orders" primaryColor={primaryColor} />
            <MiniStat icon={Wallet} label="Avg Bill Value" value={`$${stats.avgBillValue.toFixed(2)}`} href="/cms/bills" primaryColor={primaryColor} />
          </div>
        </motion.div>
      </div>

      {/* Footer */}
        <p className="text-center border-t border-gray-300 mt-5 text-[11px] text-gray-600 p-4">
          {restaurant?.title || "Restaurant"} · POS · © {new Date().getFullYear()}
        </p>
    </div>
    </div>
  );
}
