"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Pencil, Trash2, ChevronLeft, ChevronRight,
  Inbox, SearchX, Download, Eye, X,
  CheckCircle2, Clock, CreditCard, Banknote, Smartphone,
  Printer, Store, MapPin, Phone,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import { BillServices } from "@/services/billServices";
import { OrganizationServices } from "@/services/organizationServices";

const PAGE_SIZE = 20;

const PAYMENT_ICON: Record<string, React.ReactNode> = {
  cash:           <Banknote size={11} className="text-green-500" />,
  card:           <CreditCard size={11} className="text-blue-500" />,
  digital_wallet: <Smartphone size={11} className="text-purple-500" />,
};

const PAYMENT_LABEL: Record<string, string> = {
  cash:           "Cash",
  card:           "Card",
  digital_wallet: "QR Pay",
};

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Invoice Modal ────────────────────────────────────────────────────────────
function InvoiceModal({ bill, restaurant, onClose }: { bill: any; restaurant?: any; onClose: () => void }) {
  const receiptRef = useRef<HTMLDivElement>(null);
  if (!bill) return null;

  const restaurantName = restaurant?.title || "RESTAURANT";
  const restaurantLogo = restaurant?.logo_url || restaurant?.logo;
  const restaurantAddress = restaurant?.address;
  const restaurantPhone = restaurant?.contactNo || restaurant?.telephone_number;

  // ── Print: inject the receipt HTML into a styled popup ──────────────────
  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=460,height=720");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${bill.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'IBM Plex Mono', monospace;
      font-size: 12px;
      background: #fff;
      color: #000;
      padding: 24px 28px;
      max-width: 380px;
      margin: 0 auto;
    }
    .receipt-header { text-align:center; margin-bottom:16px; }
    .receipt-header .brand { font-size:20px; font-weight:700; letter-spacing:2px; }
    .receipt-header .subtitle { font-size:10px; color:#555; margin-top:2px; }
    .receipt-header .meta { font-size:10px; color:#333; margin-top:8px; line-height:1.6; }
    .receipt-header .logo { height:26px; width:26px; object-fit:contain; }
    .divider-solid { border-top:1px solid #000; margin:10px 0; }
    .divider-dash  { border-top:1px dashed #999; margin:10px 0; }
    .section-label { font-size:9px; font-weight:700; letter-spacing:1.5px; color:#555; margin-bottom:6px; text-transform:uppercase; }
    .items-table { width:100%; border-collapse:collapse; margin-bottom:4px; }
    .items-table thead tr { border-bottom:1px solid #000; }
    .items-table th { text-align:left; font-size:9px; font-weight:700; letter-spacing:1px; color:#555; text-transform:uppercase; padding-bottom:6px; }
    .items-table th.qty, .items-table td.qty { text-align:center; width:34px; }
    .items-table th.right, .items-table td.right { text-align:right; }
    .items-table td { padding:5px 0; font-size:11px; vertical-align:top; border-bottom:1px dashed #eee; }
    .items-table tr:last-child td { border-bottom:none; }
    .items-table .item-name { font-weight:700; font-size:11px; }
    .items-table .item-portion { font-size:9px; color:#555; margin-top:1px; }
    .items-table .price-cell { color:#444; font-size:10px; }
    .items-table .total-cell { font-weight:600; font-size:11px; }
    .totals-row { display:flex; justify-content:space-between; margin-bottom:5px; font-size:11px; }
    .totals-row.discount { color:#166534; }
    .totals-row.vat { color:#444; }
    .grand-row { display:flex; justify-content:space-between; font-size:15px; font-weight:700; margin-top:4px; }
    .payment-row { display:flex; justify-content:space-between; font-size:10px; color:#555; margin-top:10px; }
    .status-badge {
      text-align:center; margin-top:14px; padding:6px 0;
      font-size:13px; font-weight:700; letter-spacing:1px;
    }
    .status-badge.paid { color:#166534; border:2px solid #166534; border-radius:4px; }
    .status-badge.unpaid { color:#b91c1c; border:2px solid #b91c1c; border-radius:4px; }
    .footer { text-align:center; font-size:9px; color:#888; margin-top:16px; line-height:1.6; }
    @media print {
      body { padding:0; }
      button { display:none; }
    }
  </style>
</head>
<body>
  ${content}
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`);
    win.document.close();
  };

  // ── PDF download ─────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: [80, 220] });
    let y = 10;

    // Header
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(restaurantName.toUpperCase(), 40, y, { align: "center" }); y += 5;
    doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    if (restaurantAddress) {
      doc.text(restaurantAddress, 40, y, { align: "center", maxWidth: 70 });
      y += 4;
    }
    if (restaurantPhone) {
      doc.text(String(restaurantPhone), 40, y, { align: "center" });
      y += 4;
    }
    doc.setFontSize(8);
    doc.text(`Invoice #${bill.id}  |  Table ${bill.table_number ?? "—"}`, 40, y, { align: "center" }); y += 4;
    doc.text(formatDate(bill.created_at), 40, y, { align: "center" }); y += 5;

    doc.setDrawColor(0); doc.line(5, y, 75, y); y += 3;

    // Items table
    autoTable(doc, {
      startY: y,
      margin: { left: 5, right: 5 },
      head: [["Item", "Qty", "Price", "Total"]],
      body: (bill.order_items || []).map((item: any) => [
        `${item.item_name}\n${item.portion_name}`,
        item.quantity,
        `$${Number(item.unit_price).toFixed(2)}`,
        `$${Number(item.total_price).toFixed(2)}`,
      ]),
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1.4, lineColor: [220, 220, 220] },
      headStyles: { fillColor: [54, 74, 99], textColor: 255, fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 9, halign: "center" },
        2: { cellWidth: 15, halign: "right" },
        3: { cellWidth: 14, halign: "right" },
      },
    });

    // @ts-ignore - lastAutoTable is added at runtime by jspdf-autotable
    y = (doc as any).lastAutoTable.finalY + 4;

    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text("Sub Total", 5, y); doc.text(`$${Number(bill.sub_total).toFixed(2)}`, 75, y, { align: "right" }); y += 4;
    if (Number(bill.discount_amount) > 0) {
      doc.text(`Discount (${bill.discount_percentage}%)`, 5, y);
      doc.text(`-$${Number(bill.discount_amount).toFixed(2)}`, 75, y, { align: "right" }); y += 4;
    }
    doc.text(`VAT (${bill.vat_percentage}%)`, 5, y);
    doc.text(`+$${Number(bill.vat_amount).toFixed(2)}`, 75, y, { align: "right" }); y += 4;
    doc.line(5, y, 75, y); y += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("GRAND TOTAL", 5, y); doc.text(`$${Number(bill.grand_total).toFixed(2)}`, 75, y, { align: "right" }); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text(`Payment: ${PAYMENT_LABEL[bill.payment_method] || bill.payment_method}`, 5, y); y += 4;
    doc.setFont("helvetica", "bold");
    doc.text(bill.is_paid ? "✓ PAID" : "✗ UNPAID", 40, y, { align: "center" });
    doc.save(`Invoice_${bill.id}.pdf`);
    toast.success("Invoice PDF downloaded");
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[360px] overflow-hidden flex flex-col max-h-[90vh]">

          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-[#f5f6fa] flex-shrink-0">
            <span className="text-[13px] font-bold text-[#364a63] flex items-center gap-2">
              <Eye size={14} className="text-[#526484]" />
              Invoice #{bill.id}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-[#526484] border border-gray-200 rounded hover:bg-white transition-colors"
              >
                <Printer size={11} /> Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-white bg-[#364a63] rounded hover:bg-[#2c3e52] transition-colors"
              >
                <Download size={11} /> PDF
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:rotate-90 transition-all ml-1">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable receipt area */}
          <div className="overflow-y-auto flex-1 bg-gray-50 p-4">
            {/* The receipt card — also injected into the print window */}
            <div ref={receiptRef} className="bg-white rounded-lg border border-dashed border-gray-200 px-6 py-5 font-mono text-[11px] shadow-sm">

              {/* Brand header */}
              <div className="receipt-header text-center mb-4">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {restaurantLogo ? (
                    <img
                      src={restaurantLogo}
                      alt={restaurantName}
                      className="logo h-6 w-6 object-contain rounded-sm"
                      style={{ height: 24, width: 24, objectFit: "contain" }}
                    />
                  ) : (
                    <Store size={16} className="text-[#364a63]" />
                  )}
                  <span className="text-[15px] font-black tracking-widest text-[#364a63] uppercase">
                    {restaurantName}
                  </span>
                </div>
               
                <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                 {(restaurantAddress || restaurantPhone) && (
                    <div className="flex items-center justify-center gap-4">
                        {restaurantAddress && (
                        <p className="flex items-center gap-1">
                            <MapPin size={9} /> {restaurantAddress}
                        </p>
                        )}
                        {restaurantPhone && (
                        <p className="flex items-center gap-1">
                            <Phone size={9} /> {restaurantPhone}
                        </p>
                        )}
                    </div>
                    )}
                  <p>Invoice:{bill.id}  ·  Table:{bill.table_number ?? "—"}</p>
                  <p>{formatDate(bill.created_at)}</p>
                </div>
              </div>

              {/* Solid divider */}
              <div className="border-t border-gray-800 my-1" />

              {/* Items table */}
              <table className="items-table w-full mb-1" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-[9px] font-bold tracking-widest text-gray-400 uppercase pb-1.5">Item</th>
                    <th className="qty text-center text-[9px] font-bold tracking-widest text-gray-400 uppercase pb-1.5 w-10">Qty</th>
                    <th className="right text-right text-[9px] font-bold tracking-widest text-gray-400 uppercase pb-1.5">Price</th>
                    <th className="right text-right text-[9px] font-bold tracking-widest text-gray-400 uppercase pb-1.5">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bill.order_items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-1.5 pr-2 align-top">
                        <p className="item-name font-bold text-[#364a63] text-[11px]">{item.item_name}</p>
                        <p className="item-portion text-[9px] text-gray-400">{item.portion_name}</p>
                      </td>
                      <td className="qty py-1.5 text-center text-[10px] text-gray-500 align-top">
                        {item.quantity}
                      </td>
                      <td className="right price-cell py-1.5 text-right text-[10px] text-gray-500 align-top">
                        ${Number(item.unit_price).toFixed(2)}
                      </td>
                      <td className="right total-cell py-1.5 text-right text-[11px] font-semibold text-[#364a63] align-top">
                        ${Number(item.total_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Dashed divider */}
              <div className="border-t border-dashed border-gray-300 my-1.5" />

              {/* Totals breakdown */}
              <div className="space-y-1.5 text-[11px]">
                <div className="totals-row flex justify-between text-gray-500">
                  <span>Sub Total</span>
                  <span>${Number(bill.sub_total).toFixed(2)}</span>
                </div>
                {Number(bill.discount_amount) > 0 && (
                  <div className="totals-row discount flex justify-between text-green-700">
                    <span>Discount ({bill.discount_percentage}%)</span>
                    <span>− ${Number(bill.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="totals-row vat flex justify-between text-gray-500">
                  <span>VAT ({bill.vat_percentage}%)</span>
                  <span>+ ${Number(bill.vat_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Solid divider */}
              <div className="border-t border-gray-800 my-3" />

              {/* Grand total */}
              <div className="grand-row flex justify-between text-[14px] font-black text-[#364a63]">
                <span>GRAND TOTAL</span>
                <span>${Number(bill.grand_total).toFixed(2)}</span>
              </div>

              {/* Dashed divider */}
              <div className="border-t border-dashed border-gray-300 my-3" />

              {/* Payment + status */}
              <div className="payment-row flex justify-between text-[10px] text-gray-500">
                <span>Payment Method</span>
                <span className="font-semibold text-[#364a63]">
                  {PAYMENT_LABEL[bill.payment_method] || bill.payment_method}
                </span>
              </div>

              <div className={`status-badge mt-3 py-1.5 text-center text-[12px] font-black tracking-widest rounded border-2 ${
                bill.is_paid
                  ? "text-green-700 border-green-600 bg-green-50 paid"
                  : "text-red-600 border-red-400 bg-red-50 unpaid"
              }`}>
                {bill.is_paid ? "✓  PAID" : "⚠  UNPAID"}
              </div>

              {/* Footer */}
              <p className="footer text-center text-[9px] text-gray-400 mt-4 leading-relaxed">
                Please come again!<br />
                Powered by {restaurantName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main BillTable ───────────────────────────────────────────────────────────
export default function BillTable({ onEdit, refreshTrigger, searchQuery = "" }: any) {
  const [dataList, setDataList]           = useState<any[]>([]);
  const [filteredData, setFilteredData]   = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [currentPage, setCurrentPage]     = useState(1);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [selectedIds, setSelectedIds]     = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId]           = useState<any>(null);
  const [viewBill, setViewBill]           = useState<any>(null);
  const [paidLoading, setPaidLoading]     = useState<Record<number, boolean>>({});
  const [restaurant, setRestaurant]       = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await BillServices.getDetails();
      setDataList(Array.isArray(res) ? res : res?.results || []);
    } catch {
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  // Pull the restaurant's own profile (name, address, logo) to brand the invoice.
  // Falls back to a generic "RESTAURANT" label inside InvoiceModal if none exists yet.
  const fetchRestaurant = async () => {
    try {
      const res = await OrganizationServices.getDetails();
      const list = Array.isArray(res) ? res : res?.results || res?.data || [];
      if (list.length) setRestaurant(list[0]);
    } catch {
      // no organization profile configured — invoice keeps default branding
    }
  };

  useEffect(() => { fetchData(); }, [refreshTrigger]);
  useEffect(() => { fetchRestaurant(); }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredData(
      dataList.filter(
        (i) =>
          String(i.id).includes(q) ||
          String(i.order_id).includes(q) ||
          i.table_number?.toLowerCase().includes(q) ||
          (i.is_paid ? "paid" : "unpaid").includes(q) ||
          i.payment_method?.toLowerCase().includes(q)
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

  const handleTogglePaid = async (bill: any) => {
    setPaidLoading((p) => ({ ...p, [bill.id]: true }));
    try {
      const updated = await BillServices.updateDetails(bill.id, { is_paid: !bill.is_paid });
      setDataList((prev) => prev.map((b) => (b.id === bill.id ? { ...b, is_paid: updated.is_paid } : b)));
      toast.success(updated.is_paid ? `Bill #${bill.id} marked Paid` : `Bill #${bill.id} marked Unpaid`);
    } catch {
      toast.error("Failed to update payment status");
    } finally {
      setPaidLoading((p) => ({ ...p, [bill.id]: false }));
    }
  };

  const handleConfirmDelete = async () => {
    const ids = selectedIds.length > 0 ? selectedIds : deleteId ? [deleteId] : [];
    if (!ids.length) return;
    try {
      setDeleteLoading(true);
      await Promise.all(ids.map((id) => BillServices.deleteDetails(id)));
      toast.success(`${ids.length} bill(s) deleted`);
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
    doc.text("Bills / Invoices", 14, 15);
    autoTable(doc, {
      head: [["#", "Bill", "Order", "Table", "Sub Total", "Disc / VAT", "Grand Total", "Payment", "Paid", "Date"]],
      body: paginated.map((item, i) => [
        (currentPage - 1) * PAGE_SIZE + i + 1,
        `#${item.id}`,
        `#${item.order_id}`,
        item.table_number ?? "—",
        `$${Number(item.sub_total).toFixed(2)}`,
        `−${item.discount_percentage}% / +${item.vat_percentage}%`,
        `$${Number(item.grand_total).toFixed(2)}`,
        PAYMENT_LABEL[item.payment_method] || item.payment_method,
        item.is_paid ? "Paid" : "Unpaid",
        formatDate(item.created_at),
      ]),
      startY: 25,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [54, 74, 99] },
    });
    doc.save("Bills.pdf");
    toast.success("PDF Downloaded");
  };

  return (
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
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Bill</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Order</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Table</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Sub Total</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Disc / VAT</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Grand Total</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Payment</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Paid</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Date</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableLoadingSkeleton rows={5} cols={12} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      {searchQuery
                        ? <SearchX size={32} className="text-rose-300" />
                        : <Inbox size={32} className="text-gray-200" />}
                      <span className="text-sm font-bold text-[#364a63]">
                        {searchQuery ? "No results." : "No bills yet."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isToggling = paidLoading[item.id];
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                      <td className="px-4 py-2 text-center">
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" />
                      </td>
                      <td className="px-4 py-2 text-[10px] text-[#526484]">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}.
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[11px] font-bold text-[#364a63]">#{item.id}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[11px] text-[#526484]">#{item.order_id}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[11px] font-semibold text-[#526484]">
                          {item.table_number ? `Table ${item.table_number}` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[11px] text-[#364a63]">${Number(item.sub_total).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col gap-0.5">
                          {Number(item.discount_amount) > 0 && (
                            <span className="text-[9px] text-green-600 font-medium">
                              −${Number(item.discount_amount).toFixed(2)} ({item.discount_percentage}%)
                            </span>
                          )}
                          <span className="text-[9px] text-[#8094ae]">
                            +${Number(item.vat_amount).toFixed(2)} VAT ({item.vat_percentage}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[12px] font-bold text-[#364a63]">${Number(item.grand_total).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          {PAYMENT_ICON[item.payment_method]}
                          <span className="text-[10px] text-[#526484]">
                            {PAYMENT_LABEL[item.payment_method] || item.payment_method}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleTogglePaid(item)}
                          disabled={isToggling}
                          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors disabled:opacity-40 ${
                            item.is_paid
                              ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                              : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                          }`}
                        >
                          {item.is_paid
                            ? <><CheckCircle2 size={10} /> Paid</>
                            : <><Clock size={10} /> Unpaid</>}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[10px] text-[#8094ae]">{formatDate(item.created_at)}</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setViewBill(item)}
                            className="p-1.5 text-purple-500 hover:bg-purple-50 rounded active:scale-90 transition-all"
                            title="View & Print Invoice"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded active:scale-90 transition-all"
                            title="Edit Bill"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => { setSelectedIds([]); setDeleteId(item.id); setIsModalOpen(true); }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-90 transition-all"
                            title="Delete Bill"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
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
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of {filteredData.length}
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
        title="Delete Bill?"
        message={selectedIds.length > 0 ? `Delete ${selectedIds.length} bills?` : "Delete this bill?"}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsModalOpen(false); setDeleteId(null); }}
        loading={deleteLoading}
      />

      {viewBill && <InvoiceModal bill={viewBill} restaurant={restaurant} onClose={() => setViewBill(null)} />}
    </div>
  );
}