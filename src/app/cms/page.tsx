// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   DollarSign,
//   ClipboardList,
//   ChefHat,
//   AlertCircle,
//   CheckCircle2,
//   XCircle,
//   Wallet,
//   Receipt,
//   Banknote,
//   CreditCard,
//   Smartphone,
//   ArrowUpRight,
//   Clock,
//   ChevronRight,
//   Sparkles,
//   Bell,
//   BellRing,
//   VolumeX,
//   Volume2,
// } from "lucide-react";
// import { toast } from "sonner";
// import { format, subDays, isSameDay } from "date-fns";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import { useTheme } from "@/lib/context/ThemeContext";
// import { BillServices } from "@/services/billServices";
// import { OrderServices } from "@/services/orderServices";
// import { OrganizationServices } from "@/services/organizationServices";
// import { usePolling } from "@/hooks/usePolling";

// // ── Types ─────────────────────────────────────────────────────────────────────
// interface DashboardStats {
//   totalBills: number;
//   paidBills: number;
//   unpaidBills: number;
//   totalRevenue: number;
//   pendingAmount: number;
//   avgBillValue: number;
//   todayRevenue: number;
//   todayOrders: number;
//   totalOrders: number;
//   openOrders: number;
//   completedOrders: number;
//   cancelledOrders: number;
//   revenueTrend?: number;
// }

// const PAYMENT_LABELS: Record<string, string> = {
//   cash: "Cash",
//   card: "Card",
//   digital_wallet: "QR Pay",
// };

// const PAYMENT_COLORS: Record<string, string> = {
//   cash: "#22c55e",
//   card: "#3b82f6",
//   digital_wallet: "#a855f7",
// };

// const PAYMENT_ICONS: Record<string, React.ElementType> = {
//   cash: Banknote,
//   card: CreditCard,
//   digital_wallet: Smartphone,
// };

// // ── Color helper ──────────────────────────────────────────────────────────────
// function hexToRgba(hex: string, alpha: number) {
//   const clean = hex.replace("#", "");
//   const bigint = parseInt(
//     clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean,
//     16
//   );
//   const r = (bigint >> 16) & 255;
//   const g = (bigint >> 8) & 255;
//   const b = bigint & 255;
//   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// }

// function shade(hex: string, percent: number) {
//   const clean = hex.replace("#", "");
//   const num = parseInt(clean, 16);
//   let r = (num >> 16) + percent;
//   let g = ((num >> 8) & 0x00ff) + percent;
//   let b = (num & 0x0000ff) + percent;
//   r = Math.min(255, Math.max(0, r));
//   g = Math.min(255, Math.max(0, g));
//   b = Math.min(255, Math.max(0, b));
//   return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
// }

// // ── Build last-14-days revenue + order volume trend from bills + orders ──────
// function buildTrend(bills: any[], orders: any[]) {
//   const days = Array.from({ length: 14 }, (_, i) => {
//     const date = subDays(new Date(), 13 - i);
//     return { date, label: format(date, "dd MMM"), revenue: 0, orders: 0 };
//   });

//   bills.forEach((bill) => {
//     if (!bill.created_at) return;
//     const billDate = new Date(bill.created_at);
//     const bucket = days.find((d) => d.date.toDateString() === billDate.toDateString());
//     if (bucket) bucket.revenue += Number(bill.grand_total) || 0;
//   });

//   orders.forEach((order) => {
//     if (!order.created_at) return;
//     const orderDate = new Date(order.created_at);
//     const bucket = days.find((d) => d.date.toDateString() === orderDate.toDateString());
//     if (bucket) bucket.orders += 1;
//   });

//   return days;
// }

// // ── Skeleton ──────────────────────────────────────────────────────────────────
// function DashboardSkeleton() {
//   return (
//     <div className="space-y-5 animate-pulse">
//       <div className="h-32 bg-gray-200 rounded-lg" />
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[...Array(4)].map((_, i) => (
//           <div key={i} className="h-28 bg-gray-200 rounded-lg" />
//         ))}
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//         <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg" />
//         <div className="h-96 bg-gray-200 rounded-lg" />
//       </div>
//     </div>
//   );
// }

// // ── Primary stat (top row, larger) ────────────────────────────────────────────
// function PrimaryStat({
//   icon: Icon,
//   label,
//   value,
//   href,
//   trend,
//   primaryColor,
//   index,
//   pulse,
// }: {
//   icon: React.ElementType;
//   label: string;
//   value: number | string;
//   href: string;
//   trend?: number;
//   primaryColor: string;
//   index: number;
//   pulse?: boolean;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: index * 0.07 }}
//     >
//       <Link href={href}>
//         <div className="group relative bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
//           {pulse && (
//             <motion.div
//               initial={{ opacity: 0.5, scale: 1 }}
//               animate={{ opacity: 0, scale: 1.03 }}
//               transition={{ duration: 1.2, repeat: 2 }}
//               className="absolute inset-0 rounded-lg border-2 pointer-events-none"
//               style={{ borderColor: primaryColor }}
//             />
//           )}
//           <div
//             className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//             style={{
//               background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.04)}, transparent 60%)`,
//             }}
//           />
//           <div className="relative flex items-start justify-between mb-3">
//             <div
//               className="w-10 h-10 rounded-xl flex items-center justify-center"
//               style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor }}
//             >
//               <Icon size={18} />
//             </div>
//             <ArrowUpRight
//               size={14}
//               className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
//             />
//           </div>
//           <p className="text-3xl font-black text-gray-900 tabular-nums leading-none">
//             {value}
//           </p>
//           <div className="flex items-center justify-between mt-2">
//             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
//               {label}
//             </p>
//             {trend !== undefined && (
//               <span
//                 className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
//                   trend >= 0
//                     ? "text-emerald-600 bg-emerald-50"
//                     : "text-rose-600 bg-rose-50"
//                 }`}
//               >
//                 {trend >= 0 ? "+" : ""}
//                 {trend}%
//               </span>
//             )}
//           </div>
//         </div>
//       </Link>
//     </motion.div>
//   );
// }

// // ── Compact list-style stat (sidebar) ─────────────────────────────────────────
// function MiniStat({
//   icon: Icon,
//   label,
//   value,
//   href,
//   primaryColor,
// }: {
//   icon: React.ElementType;
//   label: string;
//   value: number | string;
//   href: string;
//   primaryColor: string;
// }) {
//   return (
//     <Link href={href}>
//       <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
//         <div
//           className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
//           style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor }}
//         >
//           <Icon size={14} />
//         </div>
//         <span className="text-[12px] font-bold text-gray-600 flex-1">{label}</span>
//         <span className="text-[13px] font-black text-gray-900 tabular-nums">{value}</span>
//         <ChevronRight
//           size={12}
//           className="text-gray-200 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all"
//         />
//       </div>
//     </Link>
//   );
// }

// // ── Custom tooltip for the area chart (handles $ revenue + order counts) ─────
// function ChartTooltip({ active, payload, label, primaryColor }: any) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2.5 text-xs">
//       <p className="font-bold text-gray-700 mb-1">{label}</p>
//       {payload.map((p: any) => (
//         <div key={p.dataKey} className="flex items-center gap-2">
//           <span
//             className="w-2 h-2 rounded-full"
//             style={{ backgroundColor: p.dataKey === "revenue" ? primaryColor : "#fbbf24" }}
//           />
//           <span className="text-gray-500 capitalize">{p.dataKey}:</span>
//           <span className="font-bold text-gray-800">
//             {p.dataKey === "revenue" ? `$${Number(p.value).toFixed(2)}` : p.value}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ── Main dashboard ────────────────────────────────────────────────────────────
// export default function DashboardPage() {
//   const { primaryColor } = useTheme();
//   const [loading, setLoading] = useState(true);
//   const hasLoadedOnce = useRef(false);

//   const [bills, setBills] = useState<any[]>([]);
//   const [orders, setOrders] = useState<any[]>([]);
//   const [restaurant, setRestaurant] = useState<any>(null);
//   const [stats, setStats] = useState<DashboardStats>({
//     totalBills: 0, paidBills: 0, unpaidBills: 0,
//     totalRevenue: 0, pendingAmount: 0, avgBillValue: 0,
//     todayRevenue: 0, todayOrders: 0, totalOrders: 0,
//     openOrders: 0, completedOrders: 0, cancelledOrders: 0,
//   });
//   const [trend, setTrend] = useState<any[]>([]);

//   // ── New-order detection + notifications ───────────────────────────────────
//   const knownOrderIds = useRef<Set<number> | null>(null); // null = not initialized yet
//   const [newOrderPulse, setNewOrderPulse] = useState(false);
//   const [soundEnabled, setSoundEnabled] = useState(true);
//   const soundEnabledRef = useRef(true);
//   useEffect(() => {
//     soundEnabledRef.current = soundEnabled;
//   }, [soundEnabled]);

//   // ── Audio unlock handling ───────────────────────────────────────────────
//   // Browsers block AudioContext output until the user has interacted with the
//   // page at least once. We create ONE shared context (not a new one per call)
//   // and resume it on the first click/keydown/touch anywhere on the page.
//   // After that single unlock, all future poll-triggered sounds will play fine.
//   const audioCtxRef = useRef<AudioContext | null>(null);
//   const [audioUnlocked, setAudioUnlocked] = useState(false);

//   const getAudioContext = useCallback(() => {
//     if (!audioCtxRef.current) {
//       const AudioContextClass =
//         window.AudioContext || (window as any).webkitAudioContext;
//       audioCtxRef.current = new AudioContextClass();
//     }
//     return audioCtxRef.current;
//   }, []);

//   useEffect(() => {
//     const unlock = () => {
//       const ctx = getAudioContext();
//       if (ctx.state === "suspended") {
//         ctx.resume().then(() => setAudioUnlocked(true)).catch(() => {});
//       } else {
//         setAudioUnlocked(true);
//       }
//     };
//     // Any of these gestures counts — remove listeners after first unlock
//     window.addEventListener("click", unlock, { once: true });
//     window.addEventListener("keydown", unlock, { once: true });
//     window.addEventListener("touchstart", unlock, { once: true });
//     return () => {
//       window.removeEventListener("click", unlock);
//       window.removeEventListener("keydown", unlock);
//       window.removeEventListener("touchstart", unlock);
//     };
//   }, [getAudioContext]);

//   const playNotificationSound = useCallback(() => {
//     try {
//       const ctx = getAudioContext();
//       if (ctx.state === "suspended") {
//         // Not yet unlocked by a user gesture — nothing we can do until they click.
//         ctx.resume().catch(() => {});
//       }

//       const playTone = (freq: number, startTime: number, duration: number) => {
//         const oscillator = ctx.createOscillator();
//         const gain = ctx.createGain();
//         oscillator.connect(gain);
//         gain.connect(ctx.destination);
//         oscillator.type = "sine";
//         oscillator.frequency.setValueAtTime(freq, startTime);
//         gain.gain.setValueAtTime(0.001, startTime);
//         gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
//         gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
//         oscillator.start(startTime);
//         oscillator.stop(startTime + duration);
//       };

//       const now = ctx.currentTime;
//       playTone(880, now, 0.25); // A5
//       playTone(1108.73, now + 0.15, 0.35); // C#6
//     } catch {
//       // Audio API unavailable — fail silently
//     }
//   }, [getAudioContext]);

//   const billsRef = useRef<any[]>([]);
//   const ordersRef = useRef<any[]>([]);

//   const fetchAll = useCallback(async (opts: { silent?: boolean } = {}) => {
//     try {
//       if (!opts.silent) setLoading(true);

//       // Always hit the network — never touch the module-level cache in the
//       // service layer, otherwise polling silently returns stale data forever.
//       const [billsRes, ordersRes, orgRes] = await Promise.all([
//         BillServices.getDetailsFresh().catch(() => []),
//         OrderServices.getDetailsFresh().catch(() => []),
//         OrganizationServices.getDetails().catch(() => []), // org info rarely changes, fine cached
//       ]);

//       const billsList = Array.isArray(billsRes) ? billsRes : billsRes?.results || [];
//       const ordersList = Array.isArray(ordersRes) ? ordersRes : ordersRes?.results || [];
//       const orgList = Array.isArray(orgRes) ? orgRes : orgRes?.results || orgRes?.data || [];

//       // ── Detect brand-new orders since last poll ──
//       const currentIds = new Set<number>(ordersList.map((o: any) => o.id));
//       if (knownOrderIds.current === null) {
//         // first load — just record ids, don't notify
//         knownOrderIds.current = currentIds;
//       } else {
//         const newOrders = ordersList.filter(
//           (o: any) => !knownOrderIds.current!.has(o.id)
//         );
//         if (newOrders.length > 0) {
//           knownOrderIds.current = currentIds;

//           if (soundEnabledRef.current) playNotificationSound();

//           setNewOrderPulse(true);
//           setTimeout(() => setNewOrderPulse(false), 2500);

//           if (newOrders.length === 1) {
//             const o = newOrders[0];
//             toast.success(
//               `New order #${o.id}${o.table_number ? ` · Table ${o.table_number}` : ""}`,
//               { icon: "🔔" }
//             );
//           } else {
//             toast.success(`${newOrders.length} new orders received`, { icon: "🔔" });
//           }
//         } else {
//           knownOrderIds.current = currentIds;
//         }
//       }

//       // Avoid needless re-renders if nothing actually changed
//       if (JSON.stringify(billsRef.current) !== JSON.stringify(billsList)) {
//         billsRef.current = billsList;
//         setBills(billsList);
//       }
//       if (JSON.stringify(ordersRef.current) !== JSON.stringify(ordersList)) {
//         ordersRef.current = ordersList;
//         setOrders(ordersList);
//       }
//       setRestaurant(orgList[0] || null);

//       const paid = billsList.filter((b: any) => b.is_paid);
//       const unpaid = billsList.filter((b: any) => !b.is_paid);
//       const totalRevenue = paid.reduce((sum: number, b: any) => sum + (Number(b.grand_total) || 0), 0);
//       const pendingAmount = unpaid.reduce((sum: number, b: any) => sum + (Number(b.grand_total) || 0), 0);
//       const avgBillValue = paid.length > 0 ? totalRevenue / paid.length : 0;

//       const today = new Date();
//       const yesterday = subDays(today, 1);
//       const todayBills = billsList.filter((b: any) => b.created_at && isSameDay(new Date(b.created_at), today));
//       const yesterdayBills = billsList.filter((b: any) => b.created_at && isSameDay(new Date(b.created_at), yesterday));
//       const todayOrdersList = ordersList.filter((o: any) => o.created_at && isSameDay(new Date(o.created_at), today));

//       const todayRevenue = todayBills.reduce((sum: number, b: any) => sum + (Number(b.grand_total) || 0), 0);
//       const yesterdayRevenue = yesterdayBills.reduce((sum: number, b: any) => sum + (Number(b.grand_total) || 0), 0);
//       const revenueTrend = yesterdayRevenue > 0
//         ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
//         : undefined;

//       const openOrders = ordersList.filter((o: any) => ["pending", "accepted", "preparing", "served"].includes(o.status)).length;
//       const completedOrders = ordersList.filter((o: any) => o.status === "completed_settled").length;
//       const cancelledOrders = ordersList.filter((o: any) => o.status === "cancelled").length;

//       setStats({
//         totalBills: billsList.length,
//         paidBills: paid.length,
//         unpaidBills: unpaid.length,
//         totalRevenue,
//         pendingAmount,
//         avgBillValue,
//         todayRevenue,
//         todayOrders: todayOrdersList.length,
//         totalOrders: ordersList.length,
//         openOrders,
//         completedOrders,
//         cancelledOrders,
//         revenueTrend,
//       });

//       setTrend(buildTrend(billsList, ordersList));
//     } catch {
//       if (!opts.silent) toast.error("Failed to load dashboard data");
//     } finally {
//       if (!opts.silent) setLoading(false);
//       hasLoadedOnce.current = true;
//     }
//   }, [playNotificationSound]);

//   useEffect(() => {
//     fetchAll();
//   }, [fetchAll]);

//   // Real-time polling: silently refresh every 6s
//   usePolling(() => fetchAll({ silent: true }), 6000, true);

//   if (loading) return <DashboardSkeleton />;

//   const paymentDistribution = Object.entries(
//     bills.reduce((acc: Record<string, number>, b: any) => {
//       const method = b.payment_method || "other";
//       acc[method] = (acc[method] || 0) + (Number(b.grand_total) || 0);
//       return acc;
//     }, {})
//   )
//     .map(([method, value]) => ({
//       method,
//       name: PAYMENT_LABELS[method] || method,
//       value: value as number,
//       color: PAYMENT_COLORS[method] || "#9ca3af",
//     }))
//     .filter((d) => d.value > 0);

//   const recentBills = [...bills]
//     .sort((a: any, b: any) =>
//       a.created_at && b.created_at
//         ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//         : 0
//     )
//     .slice(0, 5);

//   return (
//     <div className="h-screen overflow-y-auto scrollbar-hide">
//       <div className="space-y-5 ">
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="relative rounded-lg overflow-hidden p-6 md:p-8 "
//           style={{
//             background: `linear-gradient(120deg, ${primaryColor} 0%, ${shade(primaryColor, -25)} 100%)`,
//           }}
//         >
//           <div
//             className="absolute inset-0 opacity-[0.07]"
//             style={{
//               backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
//               backgroundSize: "18px 18px",
//             }}
//           />
//           <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full border border-white/10" />
//           <div className="absolute -right-4 top-10 w-32 h-32 rounded-full border border-white/10" />

//           <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
//             <div>
//               <div className="flex items-center gap-1.5 text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
//                 <Sparkles size={12} />
//                 {format(new Date(), "EEEE, dd MMMM yyyy")}
//                 {!audioUnlocked && (
//                   <span className="ml-2 inline-flex items-center gap-1 text-white/50 normal-case tracking-normal font-normal">
//                     {/* · Click anywhere to enable sound */}
//                   </span>
//                 )}
//               </div>
//               <h1 className="text-2xl md:text-[24px] font-bold text-white leading-tight">
//                 Welcome back{restaurant?.title ? `,  ${restaurant.title}` : ""}
//               </h1>
//               <p className="text-white/75 text-sm mt-1.5 max-w-md">
//                 {stats.totalBills} bill{stats.totalBills !== 1 ? "s" : ""} generated so far, with{" "}
//                 {stats.unpaidBills} still awaiting payment.
//               </p>
//             </div>

//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setSoundEnabled((s) => !s)}
//                 title={soundEnabled ? "Mute new-order sound" : "Unmute new-order sound"}
//                 className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
//               >
//                 {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
//               </button>

//               <div className="relative w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
//                 <AnimatePresence mode="wait">
//                   {newOrderPulse ? (
//                     <motion.div
//                       key="ringing"
//                       initial={{ rotate: -10, scale: 0.8 }}
//                       animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: 1 }}
//                       transition={{ duration: 0.6, repeat: 2 }}
//                     >
//                       <BellRing size={16} className="text-amber-300" />
//                     </motion.div>
//                   ) : (
//                     <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                       <Bell size={15} />
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//                 {newOrderPulse && (
//                   <motion.span
//                     initial={{ scale: 0.6, opacity: 0.8 }}
//                     animate={{ scale: 1.6, opacity: 0 }}
//                     transition={{ duration: 1, repeat: 2 }}
//                     className="absolute inset-0 rounded-lg border-2 border-amber-300"
//                   />
//                 )}
//               </div>

//               <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[88px]">
//                 <p className="text-white text-xl font-black tabular-nums">${stats.todayRevenue.toFixed(0)}</p>
//                 <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
//                   Revenue Today
//                 </p>
//               </div>
//               <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[88px]">
//                 <p className="text-white text-xl font-black tabular-nums">{stats.todayOrders}</p>
//                 <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
//                   Orders Today
//                 </p>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         <div className="flex justify-end mt-4">
//           <Link
//             href="/"
//             className="px-6 py-2  text-[#007f35] font-bold  hover:underline flex items-center gap-2"
//           >
//             Visit Website <span>→</span>
//           </Link>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <PrimaryStat
//             icon={DollarSign}
//             label="Today's Revenue"
//             value={`$${stats.todayRevenue.toFixed(2)}`}
//             href="/cms/bill"
//             trend={stats.revenueTrend}
//             primaryColor={primaryColor}
//             index={0}
//           />
//           <PrimaryStat
//             icon={ClipboardList}
//             label="Orders Today"
//             value={stats.todayOrders}
//             href="/cms/order"
//             primaryColor={primaryColor}
//             index={1}
//             pulse={newOrderPulse}
//           />
//           <PrimaryStat
//             icon={ChefHat}
//             label="Open Orders"
//             value={stats.openOrders}
//             href="/cms/order"
//             primaryColor={primaryColor}
//             index={2}
//             pulse={newOrderPulse}
//           />
//           <PrimaryStat
//             icon={AlertCircle}
//             label="Unpaid Bills"
//             value={stats.unpaidBills}
//             href="/cms/bills"
//             primaryColor={primaryColor}
//             index={3}
//           />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.25 }}
//             className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm p-5"
//           >
//             <div className="flex items-center justify-between mb-1">
//               <div>
//                 <h3 className="text-sm font-bold text-gray-800">
//                   Revenue & Orders — Last 14 Days
//                 </h3>
//                 <p className="text-[11px] text-gray-400 mt-0.5">
//                   Daily billed revenue vs. order volume
//                 </p>
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-1.5">
//                   <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
//                   <span className="text-[11px] text-gray-500 font-medium">Revenue</span>
//                 </div>
//                 <div className="flex items-center gap-1.5">
//                   <span className="w-2 h-2 rounded-full bg-amber-400" />
//                   <span className="text-[11px] text-gray-500 font-medium">Orders</span>
//                 </div>
//               </div>
//             </div>

//             <ResponsiveContainer width="100%" height={260}>
//               <AreaChart data={trend} margin={{ top: 16, right: 8, left: -4, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor={primaryColor} stopOpacity={0.35} />
//                     <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
//                   </linearGradient>
//                   <linearGradient id="ordGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.3} />
//                     <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <XAxis
//                   dataKey="label"
//                   tick={{ fontSize: 10, fill: "#9ca3af" }}
//                   axisLine={false}
//                   tickLine={false}
//                   interval={1}
//                 />
//                 <YAxis
//                   yAxisId="revenue"
//                   tick={{ fontSize: 10, fill: "#9ca3af" }}
//                   axisLine={false}
//                   tickLine={false}
//                   width={40}
//                   tickFormatter={(v) => `$${v}`}
//                 />
//                 <YAxis
//                   yAxisId="orders"
//                   orientation="right"
//                   allowDecimals={false}
//                   tick={{ fontSize: 10, fill: "#9ca3af" }}
//                   axisLine={false}
//                   tickLine={false}
//                   width={24}
//                 />
//                 <Tooltip content={<ChartTooltip primaryColor={primaryColor} />} />
//                 <Area
//                   yAxisId="revenue"
//                   type="monotone"
//                   dataKey="revenue"
//                   stroke={primaryColor}
//                   strokeWidth={2.5}
//                   fill="url(#revGradient)"
//                 />
//                 <Area
//                   yAxisId="orders"
//                   type="monotone"
//                   dataKey="orders"
//                   stroke="#fbbf24"
//                   strokeWidth={2.5}
//                   fill="url(#ordGradient)"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.32 }}
//             className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 flex flex-col"
//           >
//             <h3 className="text-sm font-bold text-gray-800 mb-1">
//               Payment Methods
//             </h3>
//             <p className="text-[11px] text-gray-400 mb-2">
//               ${stats.totalRevenue.toFixed(2)} collected across {stats.paidBills} paid bill{stats.paidBills !== 1 ? "s" : ""}
//             </p>

//             {paymentDistribution.length === 0 ? (
//               <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
//                 <Wallet size={28} className="text-gray-200" />
//                 <span className="text-[11px] text-gray-400 font-bold">No paid bills yet</span>
//               </div>
//             ) : (
//               <>
//                 <div className="relative flex-1 min-h-[200px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={paymentDistribution}
//                         dataKey="value"
//                         nameKey="name"
//                         innerRadius={58}
//                         outerRadius={82}
//                         paddingAngle={3}
//                         strokeWidth={0}
//                       >
//                         {paymentDistribution.map((entry) => (
//                           <Cell key={entry.name} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         content={({ active, payload }) => {
//                           if (!active || !payload?.length) return null;
//                           const d = payload[0];
//                           return (
//                             <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 text-xs">
//                               <span className="font-bold text-gray-700">{d.name}</span>
//                               <span className="text-gray-400">: ${Number(d.value).toFixed(2)}</span>
//                             </div>
//                           );
//                         }}
//                       />
//                     </PieChart>
//                   </ResponsiveContainer>
//                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//                     <span className="text-2xl font-black text-gray-900">${stats.totalRevenue.toFixed(0)}</span>
//                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
//                       Revenue
//                     </span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-y-1.5 mt-3">
//                   {paymentDistribution.map((d) => {
//                     const Icon = PAYMENT_ICONS[d.method] || Wallet;
//                     return (
//                       <div key={d.name} className="flex items-center gap-1.5">
//                         <Icon size={11} style={{ color: d.color }} />
//                         <span className="text-[11px] text-gray-500 truncate flex-1">{d.name}</span>
//                         <span className="text-[11px] font-bold text-gray-700">${d.value.toFixed(2)}</span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </>
//             )}
//           </motion.div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.4 }}
//             className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden"
//           >
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
//               <div className="flex items-center gap-2">
//                 <Receipt size={16} style={{ color: primaryColor }} />
//                 <h3 className="text-sm font-bold text-gray-800">Recent Bills</h3>
//               </div>
//               <Link
//                 href="/cms/bills"
//                 className="text-[11px] font-bold uppercase tracking-wider hover:underline"
//                 style={{ color: primaryColor }}
//               >
//                 View All
//               </Link>
//             </div>

//             <div className="divide-y divide-gray-50">
//               {recentBills.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-12 gap-2">
//                   <Receipt size={28} className="text-gray-200" />
//                   <p className="text-xs text-gray-400">No bills yet.</p>
//                 </div>
//               ) : (
//                 recentBills.map((b) => (
//                   <div
//                     key={b.id}
//                     className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
//                   >
//                     <div
//                       className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
//                       style={{ backgroundColor: primaryColor }}
//                     >
//                       #{b.id}
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="text-[12px] font-bold text-gray-800 truncate">
//                         Table {b.table_number ?? "—"} · ${Number(b.grand_total).toFixed(2)}
//                       </p>
//                       <p className="text-[11px] text-gray-400 truncate">
//                         {PAYMENT_LABELS[b.payment_method] || b.payment_method}
//                       </p>
//                     </div>
//                     <span
//                       className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
//                         b.is_paid ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
//                       }`}
//                     >
//                       {b.is_paid ? "Paid" : "Unpaid"}
//                     </span>
//                     {b.created_at && (
//                       <span className="flex items-center gap-1 text-[10px] text-gray-300 shrink-0">
//                         <Clock size={10} />
//                         {format(new Date(b.created_at), "dd MMM")}
//                       </span>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4, delay: 0.46 }}
//             className="bg-white rounded-lg border border-gray-100 shadow-sm p-3"
//           >
//             <h3 className="text-sm font-bold text-gray-800 px-2 pt-2 mb-1">
//               Quick Stats
//             </h3>
//             <div className="flex flex-col">
//               <MiniStat icon={CheckCircle2} label="Paid Bills" value={stats.paidBills} href="/cms/bills" primaryColor={primaryColor} />
//               <MiniStat icon={AlertCircle} label="Unpaid Bills" value={stats.unpaidBills} href="/cms/bills" primaryColor={primaryColor} />
//               <MiniStat icon={XCircle} label="Cancelled Orders" value={stats.cancelledOrders} href="/cms/orders" primaryColor={primaryColor} />
//               <MiniStat icon={Wallet} label="Avg Bill Value" value={`$${stats.avgBillValue.toFixed(2)}`} href="/cms/bills" primaryColor={primaryColor} />
//             </div>
//           </motion.div>
//         </div>

//         <p className="text-center border-t border-gray-300 mt-5 text-[11px] text-gray-600 p-4">
//           {restaurant?.title || "Restaurant"} · POS · © {new Date().getFullYear()}
//         </p>
//       </div>
//     </div>
//   );
// }


"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Bell,
  BellRing,
  VolumeX,
  Volume2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
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
import { useWebSocket } from "@/hooks/useWebSocket";

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
  pulse,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  href: string;
  trend?: number;
  primaryColor: string;
  index: number;
  pulse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Link href={href}>
        <div className="group relative bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer">
          {pulse && (
            <motion.div
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 1.2, repeat: 2 }}
              className="absolute inset-0 rounded-lg border-2 pointer-events-none"
              style={{ borderColor: primaryColor }}
            />
          )}
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
        <span className="text-[12px] font-bold text-gray-600 flex-1">{label}</span>
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
  const hasLoadedOnce = useRef(false);

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

  // ── New-order detection + notifications ───────────────────────────────────
  const knownOrderIds = useRef<Set<number> | null>(null); // null = not initialized yet
  const [newOrderPulse, setNewOrderPulse] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // ── Audio unlock handling ───────────────────────────────────────────────
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    return audioCtxRef.current;
  }, []);

  useEffect(() => {
    const unlock = () => {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume().then(() => setAudioUnlocked(true)).catch(() => {});
      } else {
        setAudioUnlocked(true);
      }
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [getAudioContext]);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const playTone = (freq: number, startTime: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(880, now, 0.25); // A5
      playTone(1108.73, now + 0.15, 0.35); // C#6
    } catch {
      // Audio API unavailable — fail silently
    }
  }, [getAudioContext]);

  const billsRef = useRef<any[]>([]);
  const ordersRef = useRef<any[]>([]);

  // ── Full data refresh (REST — WS/polling just tell us WHEN to call this) ──
  const fetchAll = useCallback(async (opts: { silent?: boolean } = {}) => {
    try {
      if (!opts.silent) setLoading(true);

      const [billsRes, ordersRes, orgRes] = await Promise.all([
        BillServices.getDetailsFresh().catch(() => []),
        OrderServices.getDetailsFresh().catch(() => []),
        OrganizationServices.getDetails().catch(() => []),
      ]);

      const billsList = Array.isArray(billsRes) ? billsRes : billsRes?.results || [];
      const ordersList = Array.isArray(ordersRes) ? ordersRes : ordersRes?.results || [];
      const orgList = Array.isArray(orgRes) ? orgRes : orgRes?.results || orgRes?.data || [];

      // ── Detect brand-new orders since last sync ──
      const currentIds = new Set<number>(ordersList.map((o: any) => o.id));
      if (knownOrderIds.current === null) {
        knownOrderIds.current = currentIds;
      } else {
        const newOrders = ordersList.filter(
          (o: any) => !knownOrderIds.current!.has(o.id)
        );
        if (newOrders.length > 0) {
          knownOrderIds.current = currentIds;

          if (soundEnabledRef.current) playNotificationSound();

          setNewOrderPulse(true);
          setTimeout(() => setNewOrderPulse(false), 2500);

          if (newOrders.length === 1) {
            const o = newOrders[0];
            toast.success(
              `New order #${o.id}${o.table_number ? ` · Table ${o.table_number}` : ""}`,
              { icon: "🔔" }
            );
          } else {
            toast.success(`${newOrders.length} new orders received`, { icon: "🔔" });
          }
        } else {
          knownOrderIds.current = currentIds;
        }
      }

      if (JSON.stringify(billsRef.current) !== JSON.stringify(billsList)) {
        billsRef.current = billsList;
        setBills(billsList);
      }
      if (JSON.stringify(ordersRef.current) !== JSON.stringify(ordersList)) {
        ordersRef.current = ordersList;
        setOrders(ordersList);
      }
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

      const openOrders = ordersList.filter((o: any) => ["pending", "accepted", "preparing", "served"].includes(o.status)).length;
      const completedOrders = ordersList.filter((o: any) => o.status === "completed_settled").length;
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
      if (!opts.silent) toast.error("Failed to load dashboard data");
    } finally {
      if (!opts.silent) setLoading(false);
      hasLoadedOnce.current = true;
    }
  }, [playNotificationSound]);

  // Initial full load (with skeleton)
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─────────────────────────────────────────────────────────────────────────
  // WEBSOCKET
  //
  // ⚠️ Set NEXT_PUBLIC_WS_URL in .env.local, matching your backend's actual
  // Channels route, e.g.:
  //   NEXT_PUBLIC_WS_URL=wss://api.mountcurrypoint.com/ws/dashboard/
  // Must be wss:// since your site/API run over https.
  // ─────────────────────────────────────────────────────────────────────────
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || null;

  const handleSocketMessage = useCallback(
    (data: any) => {
      if (data && typeof data === "object" && data.type === "order_created" && data.order) {
        const o = data.order;
        if (soundEnabledRef.current) playNotificationSound();
        setNewOrderPulse(true);
        setTimeout(() => setNewOrderPulse(false), 2500);
        toast.success(
          `New order #${o.id}${o.table_number ? ` · Table ${o.table_number}` : ""}`,
          { icon: "🔔" }
        );
      }

      // Resync full dashboard state from REST regardless of message shape.
      fetchAll({ silent: true });
    },
    [fetchAll, playNotificationSound]
  );

  // ⚠️ This MUST come before any code that reads `wsStatus` below.
  const { status: wsStatus } = useWebSocket(wsUrl, {
    onMessage: handleSocketMessage,
    enabled: true,
    debug: true, // flip to false once you've confirmed it connects
  });

  // Safety-net polling: only runs while the socket isn't open, so you still
  // get near-real-time updates even if the WS route/backend isn't fixed yet.
  useEffect(() => {
    if (wsStatus === "open") return;
    const interval = setInterval(() => {
      fetchAll({ silent: true });
    }, 12000);
    return () => clearInterval(interval);
  }, [wsStatus, fetchAll]);

  if (loading) return <DashboardSkeleton />;

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
          <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full border border-white/10" />
          <div className="absolute -right-4 top-10 w-32 h-32 rounded-full border border-white/10" />

          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              <div className="flex items-center gap-1.5 text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
                <Sparkles size={12} />
                {format(new Date(), "EEEE, dd MMMM yyyy")}

                {/* WS connection indicator */}
                {/* <span className="ml-2 inline-flex items-center gap-1 text-white/50 normal-case tracking-normal font-normal">
                  {wsStatus === "open" ? (
                    <>
                      <Wifi size={11} className="text-emerald-300" /> Live
                    </>
                  ) : wsStatus === "connecting" ? (
                    <>
                      <Wifi size={11} className="text-amber-300 animate-pulse" /> Connecting…
                    </>
                  ) : (
                    <>
                      <WifiOff size={11} className="text-red-300" /> Reconnecting…
                    </>
                  )}
                </span> */}
              </div>
              <h1 className="text-2xl md:text-[24px] font-bold text-white leading-tight">
                Welcome back{restaurant?.title ? `,  ${restaurant.title}` : ""}
              </h1>
              <p className="text-white/75 text-sm mt-1.5 max-w-md">
                {stats.totalBills} bill{stats.totalBills !== 1 ? "s" : ""} generated so far, with{" "}
                {stats.unpaidBills} still awaiting payment.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled((s) => !s)}
                title={soundEnabled ? "Mute new-order sound" : "Unmute new-order sound"}
                className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              <div className="relative w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center text-white">
                <AnimatePresence mode="wait">
                  {newOrderPulse ? (
                    <motion.div
                      key="ringing"
                      initial={{ rotate: -10, scale: 0.8 }}
                      animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: 1 }}
                      transition={{ duration: 0.6, repeat: 2 }}
                    >
                      <BellRing size={16} className="text-amber-300" />
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Bell size={15} />
                    </motion.div>
                  )}
                </AnimatePresence>
                {newOrderPulse && (
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1, repeat: 2 }}
                    className="absolute inset-0 rounded-lg border-2 border-amber-300"
                  />
                )}
              </div>

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
            className="px-6 py-2  text-[#007f35] font-bold  hover:underline flex items-center gap-2"
          >
            Visit Website <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PrimaryStat
            icon={DollarSign}
            label="Today's Revenue"
            value={`$${stats.todayRevenue.toFixed(2)}`}
            href="/cms/bill"
            trend={stats.revenueTrend}
            primaryColor={primaryColor}
            index={0}
          />
          <PrimaryStat
            icon={ClipboardList}
            label="Orders Today"
            value={stats.todayOrders}
            href="/cms/order"
            primaryColor={primaryColor}
            index={1}
            pulse={newOrderPulse}
          />
          <PrimaryStat
            icon={ChefHat}
            label="Open Orders"
            value={stats.openOrders}
            href="/cms/order"
            primaryColor={primaryColor}
            index={2}
            pulse={newOrderPulse}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
                <span className="text-[11px] text-gray-400 font-bold">No paid bills yet</span>
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-gray-900">${stats.totalRevenue.toFixed(0)}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Revenue
                    </span>
                  </div>
                </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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

        <p className="text-center border-t border-gray-300 mt-5 text-[11px] text-gray-600 p-4">
          {restaurant?.title || "Restaurant"} · POS · © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}