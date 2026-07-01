"use client";
import React, { useState, useEffect } from "react";
import {
  Pencil, Trash2, ChevronLeft, ChevronRight,
  Inbox, SearchX, Download, ChevronDown, ChevronRight as ChevronRightIcon,
  Clock, Receipt, AlertTriangle, Hash, UtensilsCrossed, Eye, X,
  CheckCircle2, Wallet, Banknote,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import { OrderServices } from "@/services/orderServices";
import { BillForm } from "@/components/dashboard/bill/billForm";
import { Select } from "antd";
import { usePolling } from "@/hooks/usePolling";

const PAGE_SIZE = 20;

const STATUS_DOT: Record<string, string> = {
  pending:           "bg-yellow-400",
  accepted:          "bg-cyan-500",
  preparing:         "bg-blue-500",
  served:            "bg-purple-500",
  completed_settled: "bg-green-500",
  cancelled:         "bg-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending:           "Pending",
  accepted:          "Accepted",
  preparing:         "Preparing",
  served:            "Served",
  completed_settled: "Completed & Settled",
  cancelled:         "Cancelled",
};

const STATUS_BADGE: Record<string, string> = {
  pending:           "bg-yellow-50 text-yellow-700 border-yellow-200",
  accepted:          "bg-cyan-50 text-cyan-700 border-cyan-200",
  preparing:         "bg-blue-50 text-blue-700 border-blue-200",
  served:            "bg-purple-50 text-purple-700 border-purple-200",
  completed_settled: "bg-green-50 text-green-700 border-green-200",
  cancelled:         "bg-red-50 text-red-600 border-red-200",
};

const PAYMENT_BADGE: Record<string, string> = {
  uncommitted: "bg-gray-50 text-gray-500 border-gray-200",
  pay_now:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  pay_later:   "bg-amber-50 text-amber-700 border-amber-200",
};

const PAYMENT_LABEL: Record<string, string> = {
  uncommitted: "Not chosen",
  pay_now:     "Pay Now",
  pay_later:   "Pay Later",
};

// Minutes after which an order in this status is considered "needs attention"
const URGENT_AFTER: Record<string, number> = {
  pending:   10,
  accepted:  10,
  preparing: 20,
};

function formatDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMinutesAgo(iso: string): number | null {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return null;
  return Math.floor(diffMs / 60000);
}

function relativeOrAbsolute(iso: string) {
  const mins = getMinutesAgo(iso);
  if (mins === null) return "—";
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  return formatDateTime(iso);
}

// ── Order View Modal — bigger card-style item display ───────────────────────
function OrderViewModal({
  order,
  onGenerateBill,
  onClose,
}: {
  order: any;
  onGenerateBill: () => void;
  onClose: () => void;
}) {
  if (!order) return null;
  const orderItems: any[] = order.items || [];
  const canBill = order.status !== "cancelled" && order.status !== "completed_settled";

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[420px] overflow-hidden flex flex-col max-h-[88vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-[#f5f6fa] flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#364a63] flex items-center gap-1">
                <Hash size={13} className="text-[#526484]" />{order.id}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[order.status]}`} />
                {STATUS_LABEL[order.status] || order.status}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Meta info bar */}
          <div className="flex items-center justify-between px-5 py-2 border-b border-gray-100 bg-white flex-shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#526484]">
              <UtensilsCrossed size={11} className="text-gray-400" />
              {order.table_number ? `Table ${order.table_number}` : "No table"}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#8094ae]">
              <Clock size={10} /> {formatDateTime(order.created_at)}
            </span>
          </div>

          {/* Payment choice bar */}
          {order.payment_choice && (
            <div className="flex items-center justify-between px-5 py-2 border-b border-gray-100 bg-white flex-shrink-0">
              <span className="text-[10px] font-bold text-[#8094ae] uppercase">Payment</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${PAYMENT_BADGE[order.payment_choice] || PAYMENT_BADGE.uncommitted}`}>
                {order.payment_choice === "pay_now" ? <Wallet size={10} /> : order.payment_choice === "pay_later" ? <Banknote size={10} /> : null}
                {PAYMENT_LABEL[order.payment_choice] || order.payment_choice}
              </span>
            </div>
          )}

          {/* Items list — bigger thumbnails, clearer hierarchy */}
          <div className="overflow-y-auto flex-1 bg-gray-50 p-4 space-y-2.5">
            {orderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Inbox size={28} className="text-gray-200" />
                <span className="text-[11px] text-gray-400 font-semibold">No items in this order</span>
              </div>
            ) : (
              orderItems.map((oi: any, idx: number) => {
                const subtotal =
                  oi.portion_price !== undefined
                    ? (Number(oi.portion_price) * oi.quantity).toFixed(2)
                    : null;
                return (
                  <div
                    key={`view-item-${oi.id ?? idx}`}
                    className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 shadow-sm p-3"
                  >
                    <div className="w-14 h-14 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {oi.menu_item_image ? (
                        <img src={oi.menu_item_image} alt={oi.menu_item_name} className="w-full h-full object-cover" />
                      ) : (
                        <UtensilsCrossed size={18} className="text-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-[#364a63] truncate">
                        {oi.menu_item_name ?? `Item #${oi.menu_item}`}
                      </p>
                      <p className="text-[10px] text-[#8094ae] font-medium mt-0.5">
                        {oi.portion_name ?? `Portion #${oi.selected_portion_id}`}
                        {oi.portion_price !== undefined && ` · $${Number(oi.portion_price).toFixed(2)} each`}
                      </p>
                      <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1 mt-1.5 rounded-full bg-[#f0f2f8] text-[10px] font-bold text-[#364a63]">
                        ×{oi.quantity}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {subtotal !== null ? (
                        <span className="text-[13px] font-black text-[#364a63]">${subtotal}</span>
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: order total + generate bill shortcut */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-[#f5f6fa] flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#8094ae] uppercase">Order Total</span>
              <span className="text-[16px] font-black text-[#364a63]">${Number(order.total_amount).toFixed(2)}</span>
            </div>
            <button
              onClick={onGenerateBill}
              disabled={!canBill}
              title={canBill ? "Generate bill" : "Cannot bill this order"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-all active:scale-95 ${
                canBill
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "opacity-30 cursor-not-allowed bg-gray-200 text-gray-400"
              }`}
            >
              <Receipt size={12} /> Generate Bill
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrderTable({ onEdit, refreshTrigger, searchQuery = "" }: any) {
  const [dataList, setDataList]           = useState<any[]>([]);
  const [filteredData, setFilteredData]   = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [currentPage, setCurrentPage]     = useState(1);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [selectedIds, setSelectedIds]     = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId]           = useState<any>(null);
  const [expandedRows, setExpandedRows]   = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [viewOrder, setViewOrder]         = useState<any>(null);
  const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));
  // Forces "X min ago" labels and urgency flags to refresh periodically
  const [, forceTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // ── Bill form state ──────────────────────────────────────────────────────
  const [billFormOpen, setBillFormOpen]     = useState(false);
  const [billPrefillOrder, setBillPrefillOrder] = useState<any>(null);

  const openBillForm = (order: any) => {
    setBillPrefillOrder(order);
    setBillFormOpen(true);
  };
  const closeBillForm = () => {
    setBillFormOpen(false);
    setBillPrefillOrder(null);
  };

// Replace the existing fetchData function
const fetchData = async (opts: { silent?: boolean } = {}) => {
  try {
    if (!opts.silent) setLoading(true);
    const res = await OrderServices.getDetailsFresh();
    const next = Array.isArray(res) ? res : res?.results || [];

    setDataList((prev) => {
      // Avoid needless re-renders if nothing actually changed
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  } catch {
    if (!opts.silent) toast.error("Failed to load orders");
  } finally {
    if (!opts.silent) setLoading(false);
  }
};

useEffect(() => {
  fetchData(); // full load with spinner on mount / refreshTrigger change
}, [refreshTrigger]);

// ── Real-time polling: silently refresh every 6s, no spinner, no reset of UI state ──
usePolling(() => fetchData({ silent: true }), 6000, !billFormOpen && !viewOrder);
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredData(
      dataList.filter(
        (i) =>
          String(i.id).includes(q) ||
          i.table_number?.toString().toLowerCase().includes(q) ||
          i.status?.toLowerCase().includes(q)
      )
    );
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, dataList]);

  const paginated  = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const handleSelectAll = () =>
    selectedIds.length === paginated.length
      ? setSelectedIds([])
      : setSelectedIds(paginated.map((i) => i.id));

  const handleSelectOne = (id: any) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleExpand = (id: number) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Admin accepts a pending order ───────────────────────────────────────
  const handleAccept = async (orderId: number) => {
    setActionLoading((p) => ({ ...p, [orderId]: true }));
    try {
      const res = await OrderServices.acceptOrder(orderId);
      setDataList((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: res.status ?? "accepted" } : o))
      );
      toast.success(res.message || `Order #${orderId} accepted`);
    } catch (err: any) {
      toast.error(OrderServices.parseError(err));
    } finally {
      setActionLoading((p) => ({ ...p, [orderId]: false }));
    }
  };

  // ── Customer/admin picks pay_now or pay_later ───────────────────────────
  const handlePaymentChoice = async (orderId: number, choice: "pay_now" | "pay_later") => {
    setActionLoading((p) => ({ ...p, [orderId]: true }));
    try {
      const res = await OrderServices.selectPaymentChoice(orderId, choice);
      setDataList((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: res.order_status ?? "preparing", payment_choice: choice }
            : o
        )
      );
      toast.success(
        res.message ||
          (choice === "pay_now"
            ? `Order #${orderId} paid — sent to kitchen`
            : `Order #${orderId} sent to kitchen (pay later)`)
      );
    } catch (err: any) {
      toast.error(OrderServices.parseError(err));
    } finally {
      setActionLoading((p) => ({ ...p, [orderId]: false }));
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setActionLoading((p) => ({ ...p, [orderId]: true }));
    try {
      const res = await OrderServices.setStatus(orderId, newStatus);
      setDataList((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: res.status ?? newStatus } : o))
      );
      toast.success(res.message || `Order #${orderId} → ${STATUS_LABEL[newStatus]}`);
    } catch (err: any) {
      toast.error(OrderServices.parseError(err));
    } finally {
      setActionLoading((p) => ({ ...p, [orderId]: false }));
    }
  };

  const handleConfirmDelete = async () => {
    const ids = selectedIds.length > 0 ? selectedIds : deleteId ? [deleteId] : [];
    if (!ids.length) return;
    try {
      setDeleteLoading(true);
      await Promise.all(ids.map((id) => OrderServices.deleteDetails(id)));
      toast.success(`${ids.length} order(s) deleted`);
      setDataList((p) => p.filter((i) => !ids.includes(i.id)));
      setIsModalOpen(false);
      setSelectedIds([]);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders", 14, 15);
    autoTable(doc, {
      head: [["#", "Order ID", "Table", "Items", "Total", "Status", "Payment", "Time"]],
      body: paginated.map((item, i) => [
        (currentPage - 1) * PAGE_SIZE + i + 1,
        `#${item.id}`,
        item.table_number ? `Table ${item.table_number}` : "—",
        item.items?.length ?? 0,
        `$${Number(item.total_amount).toFixed(2)}`,
        STATUS_LABEL[item.status] || item.status,
        PAYMENT_LABEL[item.payment_choice] || "—",
        formatDateTime(item.created_at),
      ]),
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [54, 74, 99] },
    });
    doc.save("Orders.pdf");
    toast.success("PDF Downloaded");
  };

  return (
    <>
      <div className="space-y-3">
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[480px] scrollbar-hide relative">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 z-30 shadow-sm">
                <tr className="bg-[#f5f6fa]">
                  <th className="px-4 py-1.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginated.length && paginated.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">S.N.</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Order</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Table</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Items</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Total</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase w-36">Status</th>
                  {/* ── NEW: dedicated Payment column ── */}
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase w-36">Payment</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Time</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase text-right w-36">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableLoadingSkeleton rows={5} cols={10} />
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        {searchQuery
                          ? <SearchX size={32} className="text-rose-300" />
                          : <Inbox size={32} className="text-gray-200" />}
                        <span className="text-sm font-bold text-[#364a63]">
                          {searchQuery ? "No results." : "No orders yet."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((item, index) => {
                    const isSelected        = selectedIds.includes(item.id);
                    const isExpanded        = expandedRows.has(item.id);
                    const orderItems: any[] = item.items || [];
                    const isActing          = actionLoading[item.id];
                    const canBill           = item.status !== "cancelled" && item.status !== "completed_settled";

                    const minsAgo         = getMinutesAgo(item.created_at);
                    const urgentThreshold  = URGENT_AFTER[item.status];
                    const isUrgent =
                      urgentThreshold !== undefined &&
                      minsAgo !== null &&
                      minsAgo >= urgentThreshold;

                    const rowTint = isSelected
                      ? "bg-blue-50/40"
                      : isUrgent
                      ? "bg-red-50/40"
                      : "";

                    return (
                      <React.Fragment key={item.id}>
                        <tr className={`hover:bg-gray-50 transition-colors ${rowTint}`}>
                          <td className="px-4 py-2 text-center">
                            <input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" />
                          </td>
                          <td className="px-4 py-2 text-[10px] text-[#526484]">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}.
                          </td>
                          <td className="px-4 py-2">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#364a63]">
                              <Hash size={10} className="text-gray-300" />{item.id}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {item.table_number ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#526484] bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                                <UtensilsCrossed size={10} className="text-gray-400" /> Table {item.table_number}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-300">—</span>
                            )}
                          </td>

                          {/* Items count + thumbnail preview + expand toggle */}
                          <td className="px-4 py-2">
                            {orderItems.length > 0 ? (
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="flex items-center gap-2 group"
                              >
                                <div className="flex items-center -space-x-1.5">
                                  {orderItems.slice(0, 3).map((oi: any, idx: number) => (
                                    <div
                                      key={`thumb-${oi.id ?? idx}`}
                                      style={{ zIndex: 3 - idx }}
                                      className="w-5 h-5 rounded-full border-2 border-white bg-gray-100 overflow-hidden flex items-center justify-center shadow-sm flex-shrink-0"
                                    >
                                      {oi.menu_item_image ? (
                                        <img src={oi.menu_item_image} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-[7px] text-gray-300">—</span>
                                      )}
                                    </div>
                                  ))}
                                  {orderItems.length > 3 && (
                                    <div className="w-5 h-5 rounded-full border-2 border-white bg-[#364a63] text-white text-[7px] font-bold flex items-center justify-center flex-shrink-0">
                                      +{orderItems.length - 3}
                                    </div>
                                  )}
                                </div>
                                <span className="flex items-center gap-1 text-[11px] font-bold text-blue-500 group-hover:text-blue-700 transition-colors">
                                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRightIcon size={12} />}
                                  {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
                                </span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-300">—</span>
                            )}
                          </td>

                          {/* Total */}
                          <td className="px-4 py-2">
                            <span className="text-[11px] font-bold text-[#364a63]">
                              ${Number(item.total_amount).toFixed(2)}
                            </span>
                          </td>

                          {/* Status — admin-editable dropdown + Accept (only) */}
                          <td className="px-4 py-2">
                            <div className={`inline-flex items-center rounded-full border pl-2 pr-1 ${STATUS_BADGE[item.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                              <Select
                                value={item.status}
                                onChange={(val) => handleStatusChange(item.id, val)}
                                loading={isActing}
                                disabled={isActing}
                                size="small"
                                variant="borderless"
                                className="!text-[10px] !font-bold min-w-[110px]"
                                popupMatchSelectWidth={false}
                                options={STATUS_OPTIONS.map((opt) => ({
                                  value: opt.value,
                                  label: (
                                    <span className="flex items-center gap-1.5 text-[10px]">
                                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[opt.value]}`} />
                                      {opt.label}
                                    </span>
                                  ),
                                }))}
                              />
                            </div>

                            {item.status === "pending" && (
                              <button
                                onClick={() => handleAccept(item.id)}
                                disabled={isActing}
                                className="mt-1 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 disabled:opacity-40 transition-colors"
                              >
                                <CheckCircle2 size={10} />
                                {isActing ? "Accepting..." : "Accept"}
                              </button>
                            )}
                          </td>

                          {/* ── NEW: dedicated Payment column ── */}
                          <td className="px-4 py-2">
                            {item.payment_choice && item.payment_choice !== "uncommitted" ? (
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${PAYMENT_BADGE[item.payment_choice]}`}>
                                {item.payment_choice === "pay_now" ? <Wallet size={10} /> : <Banknote size={10} />}
                                {PAYMENT_LABEL[item.payment_choice]}
                              </div>
                            ) : item.status === "accepted" ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handlePaymentChoice(item.id, "pay_now")}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                                >
                                  <Wallet size={10} /> Now
                                </button>
                                <button
                                  onClick={() => handlePaymentChoice(item.id, "pay_later")}
                                  disabled={isActing}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-40 transition-colors"
                                >
                                  <Banknote size={10} /> Later
                                </button>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-gray-50 text-gray-400 border-gray-200">
                                — Not chosen
                              </span>
                            )}
                          </td>

                          {/* Time — relative label + urgency flag */}
                          <td className="px-4 py-2">
                            <div className={`flex items-center gap-1 text-[10px] whitespace-nowrap ${isUrgent ? "text-red-500 font-bold" : "text-[#8094ae]"}`}>
                              {isUrgent ? (
                                <AlertTriangle size={10} className="flex-shrink-0" />
                              ) : (
                                <Clock size={10} className="flex-shrink-0" />
                              )}
                              {relativeOrAbsolute(item.created_at)}
                            </div>
                          </td>

                          {/* Actions — edit | delete | generate bill */}
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end items-center gap-1">
                              <button
                                onClick={() => setViewOrder(item)}
                                className="p-1.5 text-purple-500 hover:bg-purple-50 rounded active:scale-90 transition-all"
                                title="View items"
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                onClick={() => onEdit(item)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded active:scale-90 transition-all"
                                title="Edit order"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => { setSelectedIds([]); setDeleteId(item.id); setIsModalOpen(true); }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-90 transition-all"
                                title="Delete order"
                              >
                                <Trash2 size={12} />
                              </button>

                              <button
                                onClick={() => openBillForm(item)}
                                disabled={!canBill}
                                title={canBill ? "Generate bill" : "Cannot bill this order"}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all active:scale-95 ${
                                  canBill
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                                    : "opacity-30 cursor-not-allowed bg-gray-50 text-gray-400 border border-gray-200"
                                }`}
                              >
                                <Receipt size={11} />
                                Bill
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ── Expanded items sub-panel ──────────────────────── */}
                        {isExpanded && (
                          <tr key={`expanded-${item.id}`}>
                            <td colSpan={10} className="px-0 py-0 bg-[#f8f9fc] border-b border-gray-100">
                              <div className="mx-6 my-2 rounded border border-gray-100 bg-white overflow-hidden shadow-sm">
                                <table className="w-full text-left border-separate border-spacing-0">
                                  <thead>
                                    <tr className="bg-[#f5f6fa] border-b border-gray-100">
                                      <th className="px-3 py-1.5 text-[10px] font-bold text-[#8094ae] uppercase w-8">#</th>
                                      <th className="px-3 py-1.5 text-[10px] font-bold text-[#8094ae] uppercase">Item</th>
                                      <th className="px-3 py-1.5 text-[10px] font-bold text-[#8094ae] uppercase">Portion</th>
                                      <th className="px-3 py-1.5 text-[10px] font-bold text-[#8094ae] uppercase text-center w-16">Qty</th>
                                      <th className="px-3 py-1.5 text-[10px] font-bold text-[#8094ae] uppercase text-right w-24">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-50">
                                    {orderItems.map((oi: any, oidx: number) => {
                                      const subtotal =
                                        oi.portion_price !== undefined
                                          ? (Number(oi.portion_price) * oi.quantity).toFixed(2)
                                          : null;
                                      return (
                                        <tr key={`oi-${oi.id ?? oidx}`} className="hover:bg-gray-50/60">
                                          <td className="px-3 py-2 text-[10px] text-gray-300 align-top">{oidx + 1}</td>
                                          <td className="px-3 py-2 align-top">
                                            <div className="flex items-center gap-2">
                                              <div className="w-7 h-7 rounded border border-gray-100 bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {oi.menu_item_image ? (
                                                  <img src={oi.menu_item_image} alt={oi.menu_item_name} className="w-full h-full object-cover" />
                                                ) : (
                                                  <span className="text-[9px] text-gray-200">—</span>
                                                )}
                                              </div>
                                              <span className="text-[11px] font-semibold text-[#364a63]">
                                                {oi.menu_item_name ?? `Item #${oi.menu_item}`}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 align-top">
                                            <div className="flex flex-col">
                                              <span className="text-[10px] font-medium text-[#526484]">
                                                {oi.portion_name ?? `Portion #${oi.selected_portion_id}`}
                                              </span>
                                              {oi.portion_price !== undefined && (
                                                <span className="text-[9px] text-gray-400">
                                                  ${Number(oi.portion_price).toFixed(2)} each
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 text-center align-top">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f2f8] text-[10px] font-bold text-[#364a63]">
                                              {oi.quantity}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 text-right align-top">
                                            {subtotal !== null ? (
                                              <span className="text-[11px] font-bold text-[#364a63]">${subtotal}</span>
                                            ) : (
                                              <span className="text-[10px] text-gray-300">—</span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>

                                <div className="flex justify-between items-center px-3 py-1.5 bg-[#f5f6fa] border-t border-gray-100">
                                  <button
                                    onClick={() => openBillForm(item)}
                                    disabled={!canBill}
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all active:scale-95 ${
                                      canBill
                                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                                        : "opacity-30 cursor-not-allowed bg-gray-50 text-gray-400 border border-gray-200"
                                    }`}
                                  >
                                    <Receipt size={11} /> Generate Bill
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-[#8094ae] uppercase">Order Total</span>
                                    <span className="text-[12px] font-bold text-[#364a63]">
                                      ${Number(item.total_amount).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredData.length > 0 && (
            <div className="flex items-center justify-between px-6 py-1.5 border-t border-gray-300 bg-[#f5f6fa]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8094ae]">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredData.length)} of {filteredData.length}
                </span>
                <button onClick={downloadPDF} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  <Download size={12} /> PDF
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1 disabled:opacity-30">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[11px] font-bold px-2">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1 disabled:opacity-30">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
            <span className="text-xs font-bold text-red-600 uppercase">{selectedIds.length} Selected</span>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded text-[11px] font-bold hover:bg-red-600 active:scale-95">
              <Trash2 size={12} /> Delete Selected
            </button>
          </div>
        )}

        <ConfirmModal
          isOpen={isModalOpen}
          title="Delete Order?"
          message={selectedIds.length > 0 ? `Delete ${selectedIds.length} orders?` : "Delete this order? All linked items will also be removed."}
          onConfirm={handleConfirmDelete}
          onCancel={() => { setIsModalOpen(false); setDeleteId(null); }}
          loading={deleteLoading}
        />
      </div>

      {/* ── BillForm modal — mounted at root level to avoid z-index issues ── */}
      <BillForm
        isOpen={billFormOpen}
        prefillOrder={billPrefillOrder}
        initialData={null}
        onSuccess={() => toast.success("Bill generated!")}
        onClose={closeBillForm}
      />

      {/* ── Order view modal ── */}
      {viewOrder && (
        <OrderViewModal
          order={viewOrder}
          onGenerateBill={() => {
            const order = viewOrder;
            setViewOrder(null);
            openBillForm(order);
          }}
          onClose={() => setViewOrder(null)}
        />
      )}
    </>
  );
}