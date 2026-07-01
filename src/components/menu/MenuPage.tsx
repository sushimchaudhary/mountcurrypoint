"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  UtensilsCrossed,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Inbox,
  History,
  Download,
  Truck,
  Wallet,
  Banknote,
  CheckCircle2,
  Clock,
  Receipt,
  PartyPopper,
  Eye,
  Printer,
  Store,
  MapPin,
  Phone,
  ChevronDown,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MenuServices } from "@/services/menuServices";
import { CategoryServices } from "@/services/categoryServices";
import { TableServices } from "@/services/tableServices";
import { OrderServices } from "@/services/orderServices";
import { OrganizationServices } from "@/services/organizationServices";
import Image from "next/image";
import { usePolling } from "@/hooks/usePolling";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const formatPrice = (n: number) => `$${Number(n || 0).toFixed(2)}`;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-600",
  accepted: "bg-cyan-100 text-cyan-600",
  preparing: "bg-blue-100 text-blue-600",
  served: "bg-green-100 text-green-600",
  completed_settled: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-500",
};

type CartLine = {
  key: string;
  menuItemId: number;
  name: string;
  portionId: number;
  portionName: string;
  price: number;
  quantity: number;
};

type PaymentResult =
  | { state: "success"; choice: "pay_now" | "pay_later"; message: string }
  | { state: "waiting"; message: string }
  | null;

const getOrderItems = (order: any) => order.items || [];
const getItemName = (it: any) => it.menu_item_name || "Item";
const getItemPortion = (it: any) => it.portion_name || "";
const getItemQty = (it: any) => it.quantity || 0;
const getItemPrice = (it: any) => Number(it.portion_price) || 0;
const getOrderTotal = (order: any) => Number(order.total_amount) || 0;
const getOrderStatus = (order: any) => order.status || "pending";
const getOrderDate = (order: any) =>
  order.created_at ? new Date(order.created_at) : null;

const getOrderIsPaid = (order: any): boolean => {
  if (typeof order?.is_paid === "boolean") return order.is_paid;
  if (typeof order?.bill?.is_paid === "boolean") return order.bill.is_paid;
  if (typeof order?.payment_status === "string")
    return order.payment_status.toLowerCase() === "paid";
  return order?.payment_choice === "pay_now";
};

const getPaymentMethodLabel = (order: any) => {
  const raw =
    order?.payment_method ||
    order?.bill?.payment_method ||
    order?.payment_choice;
  const map: Record<string, string> = {
    cash: "Cash",
    card: "Card",
    digital_wallet: "QR Pay",
    pay_now: "Paid Online",
    pay_later: "Pay at Table",
  };
  return map[raw] || raw || "—";
};

const isBillReady = (order: any) =>
  getOrderStatus(order) === "completed_settled";

const canAddItems = (order: any) =>
  !["served", "completed_settled", "cancelled"].includes(getOrderStatus(order));

const MY_ORDERS_KEY = (tableId: number | string) =>
  `my_orders_table_${tableId}`;
const BILL_SEEN_KEY = (orderId: number | string) =>
  `bill_seen_order_${orderId}`;
const BILL_DOWNLOADED_KEY = (orderId: number | string) =>
  `bill_downloaded_order_${orderId}`;

function getMyOrderIds(tableId: number | string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MY_ORDERS_KEY(tableId));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function addMyOrderId(tableId: number | string, orderId: number) {
  if (typeof window === "undefined") return;
  try {
    const current = getMyOrderIds(tableId);
    if (!current.includes(orderId)) {
      current.push(orderId);
      window.localStorage.setItem(
        MY_ORDERS_KEY(tableId),
        JSON.stringify(current),
      );
    }
  } catch {}
}

function markBillSeen(orderId: number) {
  try {
    window.localStorage.setItem(BILL_SEEN_KEY(orderId), "1");
  } catch {}
}
function wasBillSeen(orderId: number) {
  try {
    return window.localStorage.getItem(BILL_SEEN_KEY(orderId)) === "1";
  } catch {
    return false;
  }
}
function markBillDownloaded(orderId: number) {
  try {
    window.localStorage.setItem(BILL_DOWNLOADED_KEY(orderId), "1");
  } catch {}
}
function wasBillDownloaded(orderId: number) {
  try {
    return window.localStorage.getItem(BILL_DOWNLOADED_KEY(orderId)) === "1";
  } catch {
    return false;
  }
}

function BillInvoiceModal({
  order,
  restaurant,
  tableNumber,
  onClose,
}: {
  order: any;
  restaurant?: any;
  tableNumber?: string | null;
  onClose: () => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
  if (!order) return null;

  const restaurantName = restaurant?.title || "RESTAURANT";
  const restaurantLogo = restaurant?.logo_url || restaurant?.logo;
  const restaurantAddress = restaurant?.address;
  const restaurantPhone = restaurant?.contactNo || restaurant?.telephone_number;

  const isPaid = getOrderIsPaid(order);
  const items = getOrderItems(order);
  const total = getOrderTotal(order);
  const date = getOrderDate(order);
  const paymentLabel = getPaymentMethodLabel(order);

  const handlePrint = () => {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=460,height=720");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Bill #${order.id}</title>
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
    .receipt-header .meta { font-size:10px; color:#333; margin-top:8px; line-height:1.6; }
    .receipt-header .logo { height:26px; width:26px; object-fit:contain; }
    .divider-solid { border-top:1px solid #000; margin:10px 0; }
    .divider-dash  { border-top:1px dashed #999; margin:10px 0; }
    .items-table { width:100%; border-collapse:collapse; margin-bottom:4px; }
    .items-table thead tr { border-bottom:1px solid #000; }
    .items-table th { text-align:left; font-size:9px; font-weight:700; letter-spacing:1px; color:#555; text-transform:uppercase; padding-bottom:6px; }
    .items-table th.qty, .items-table td.qty { text-align:center; width:34px; }
    .items-table th.right, .items-table td.right { text-align:right; }
    .items-table td { padding:5px 0; font-size:11px; vertical-align:top; border-bottom:1px dashed #eee; }
    .items-table tr:last-child td { border-bottom:none; }
    .items-table .item-name { font-weight:700; font-size:11px; }
    .items-table .item-portion { font-size:9px; color:#555; margin-top:1px; }
    .items-table .total-cell { font-weight:600; font-size:11px; }
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: [80, 220] });
    let y = 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(restaurantName.toUpperCase(), 40, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    if (restaurantAddress) {
      doc.text(restaurantAddress, 40, y, { align: "center", maxWidth: 70 });
      y += 4;
    }
    if (restaurantPhone) {
      doc.text(String(restaurantPhone), 40, y, { align: "center" });
      y += 4;
    }
    doc.setFontSize(8);
    doc.text(`Bill #${order.id}  |  Table ${tableNumber ?? "—"}`, 40, y, {
      align: "center",
    });
    y += 4;
    doc.text(date ? date.toLocaleString() : "—", 40, y, { align: "center" });
    y += 5;

    doc.setDrawColor(0);
    doc.line(5, y, 75, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      margin: { left: 5, right: 5 },
      head: [["Item", "Qty", "Price", "Total"]],
      body: items.map((it: any) => [
        `${getItemName(it)}\n${getItemPortion(it) || ""}`,
        getItemQty(it),
        `$${Number(getItemPrice(it)).toFixed(2)}`,
        `$${Number(getItemPrice(it) * getItemQty(it)).toFixed(2)}`,
      ]),
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1.4, lineColor: [220, 220, 220] },
      headStyles: { fillColor: [196, 124, 48], textColor: 255, fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 9, halign: "center" },
        2: { cellWidth: 15, halign: "right" },
        3: { cellWidth: 14, halign: "right" },
      },
    });

    y = (doc as any).lastAutoTable.finalY + 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("GRAND TOTAL", 5, y);
    doc.text(`$${total.toFixed(2)}`, 75, y, { align: "right" });
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Payment: ${paymentLabel}`, 5, y);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text(isPaid ? "✓ PAID" : "✗ UNPAID", 40, y, { align: "center" });
    doc.save(`Bill_${order.id}.pdf`);
    toast.success("Bill downloaded");
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[360px] max-w-full overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-[#fcf7f2] flex-shrink-0">
            <span className="text-[13px] font-bold text-[#241712] flex items-center gap-2">
              <Eye size={14} className="text-[#c47c30]" />
              Bill #{order.id}
            </span>
            <div className="flex items-center gap-2">
              
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-white bg-[#c47c30] rounded hover:bg-[#a8651f] transition-colors"
              >
                <Download size={11} /> Download
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-red-500 hover:rotate-90 transition-all ml-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 bg-gray-50 p-4">
            <div
              ref={receiptRef}
              className="bg-white rounded-lg border border-dashed border-gray-200 px-6 py-5 font-mono text-[11px] shadow-sm"
            >
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
                    <Store size={16} className="text-[#241712]" />
                  )}
                  <span className="text-[15px] font-black tracking-widest text-[#241712] uppercase">
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
                  <p>
                    Bill:{order.id} · Table:{tableNumber ?? "—"}
                  </p>
                  <p>{date ? date.toLocaleString() : "—"}</p>
                </div>
              </div>

              <div className="border-t border-gray-800 my-1" />

              <table
                className="items-table w-full mb-1"
                style={{ borderCollapse: "collapse" }}
              >
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-[9px] font-bold tracking-widest text-gray-400 uppercase pb-1.5">
                      Item
                    </th>
                    <th className="qty text-center text-[9px] font-bold tracking-widest text-gray-400 uppercase pb-1.5 w-10">
                      Qty
                    </th>
                    <th className="right text-right text-[9px] font-bold tracking-widest text-gray-400 uppercase pb-1.5">
                      Price
                    </th>
                    <th className="right text-right text-[9px] font-bold tracking-widest text-gray-400 uppercase pb-1.5">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="py-1.5 pr-2 align-top">
                        <p className="item-name font-bold text-[#241712] text-[11px]">
                          {getItemName(it)}
                        </p>
                        {getItemPortion(it) && (
                          <p className="item-portion text-[9px] text-gray-400">
                            {getItemPortion(it)}
                          </p>
                        )}
                      </td>
                      <td className="qty py-1.5 text-center text-[10px] text-gray-500 align-top">
                        {getItemQty(it)}
                      </td>
                      <td className="right price-cell py-1.5 text-right text-[10px] text-gray-500 align-top">
                        ${Number(getItemPrice(it)).toFixed(2)}
                      </td>
                      <td className="right total-cell py-1.5 text-right text-[11px] font-semibold text-[#241712] align-top">
                        ${Number(getItemPrice(it) * getItemQty(it)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-gray-300 my-3" />

              <div className="grand-row flex justify-between text-[14px] font-black text-[#241712]">
                <span>GRAND TOTAL</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              <div className="payment-row flex justify-between text-[10px] text-gray-500">
                <span>Payment Method</span>
                <span className="font-semibold text-[#241712]">
                  {paymentLabel}
                </span>
              </div>

              <div
                className={`status-badge mt-3 py-1.5 text-center text-[12px] font-black tracking-widest rounded border-2 ${
                  isPaid
                    ? "text-green-700 border-green-600 bg-green-50 paid"
                    : "text-red-600 border-red-400 bg-red-50 unpaid"
                }`}
              >
                {isPaid ? "✓  PAID" : "⚠  UNPAID"}
              </div>

              <p className="footer text-center text-[9px] text-gray-400 mt-4 leading-relaxed">
                Please come again!
                <br />
                Powered by {restaurantName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MenuContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get("table_number");

  const [loading, setLoading] = useState(true);
  const [tableValid, setTableValid] = useState(false);
  const [tableId, setTableId] = useState<number | null>(null);

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");

  const [selectedPortion, setSelectedPortion] = useState<
    Record<number, number>
  >({});
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cartManuallyClosed, setCartManuallyClosed] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showOrderSuccessMessage, setShowOrderSuccessMessage] = useState(false);

  const [restaurant, setRestaurant] = useState<any>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState<
    "pay_now" | "pay_later" | null
  >(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult>(null);

  const [settledOrder, setSettledOrder] = useState<any>(null);
  const billAutoDownloadedRef = useRef<Set<number>>(new Set());

  const [viewBillOrder, setViewBillOrder] = useState<any>(null);

  const [addItemsOrder, setAddItemsOrder] = useState<any>(null);
  const [addCart, setAddCart] = useState<Record<string, CartLine>>({});
  const [addItemsCategory, setAddItemsCategory] = useState<number | "all">(
    "all",
  );
  const [addItemsSubmitting, setAddItemsSubmitting] = useState(false);

  // ---- Cart drawer height tracking (so cards are never hidden behind the floating cart) ----
  const cartDrawerRef = useRef<HTMLDivElement>(null);
  const [cartDrawerHeight, setCartDrawerHeight] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const el = cartDrawerRef.current;
    if (!el) return;

    const update = () => setCartDrawerHeight(el.offsetHeight);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cartOpen, cart]);

  useEffect(() => {
    init();
  }, [tableNumber]);
  useEffect(() => {
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (cartCount > 0) {
      if (!cartManuallyClosed) setCartOpen(true);
    } else {
      setCartOpen(false);
      setCartManuallyClosed(false);
    }
  }, [cart]);

  useEffect(() => {
    if (!tableId) return;
    const check = () => checkMyOrdersStatus(tableId);
    check();
    const t = setInterval(check, 12000);
    return () => clearInterval(t);
  }, [tableId]);

  // ── Real-time: keep the open history drawer fresh without a spinner ──
const refreshOrdersSilently = async () => {
  if (!tableId) return;
  try {
    const res = await OrderServices.getDetailsFresh({ table_id: tableId });
    const list = Array.isArray(res) ? res : res?.results || [];
    const myIds = getMyOrderIds(tableId);
    const mine = list.filter((order: any) => myIds.includes(order.id));

    setOrders((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(mine)) return prev;
      return mine;
    });
  } catch {
    // stay silent — don't toast on background polling failures
  }
};

usePolling(refreshOrdersSilently, 5000, historyOpen && !!tableId);

  const fetchRestaurant = async () => {
    try {
      const res = await OrganizationServices.getDetails();
      const list = Array.isArray(res) ? res : res?.results || res?.data || [];
      if (list.length) setRestaurant(list[0]);
    } catch {}
  };

  const checkMyOrdersStatus = async (tid: number) => {
    const myIds = getMyOrderIds(tid);
    if (myIds.length === 0) return;
    try {
      const res = await OrderServices.getDetails({ table_id: tid });
      const list = Array.isArray(res) ? res : res?.results || [];
      const mine = list.filter((o: any) => myIds.includes(o.id));

      const newlySettled = mine
        .filter((o: any) => isBillReady(o) && !wasBillSeen(o.id))
        .sort(
          (a: any, b: any) =>
            (getOrderDate(b)?.getTime() || 0) -
            (getOrderDate(a)?.getTime() || 0),
        )[0];

      if (newlySettled) {
        setSettledOrder(newlySettled);
        markBillDownloaded(newlySettled.id);
      }
    } catch {}
  };


  const refreshMenuSilently = async () => {
  try {
    const menuRes = await MenuServices.getDetails();
    const menuList: any[] = Array.isArray(menuRes) ? menuRes : menuRes?.results || [];
    setMenuItems((prev) => {
      const next = menuList.filter((m) => m.status === "available");
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  } catch {}
};

usePolling(refreshMenuSilently, 10000, true); // every 10s, always on



  const init = async () => {
    try {
      setLoading(true);

      if (tableNumber) {
        try {
          const tables = await TableServices.getDetails();
          const tableList = Array.isArray(tables)
            ? tables
            : tables?.results || [];
          const match = tableList.find(
            (t: any) => t.table_number === tableNumber,
          );
          if (match) {
            setTableValid(true);
            setTableId(match.id);
          } else {
            setTableValid(false);
            toast.error(
              `Table ${tableNumber} not recognized — you can still browse`,
            );
          }
        } catch {
          setTableValid(false);
        }
      }

      const [catRes, menuRes] = await Promise.all([
        CategoryServices.getDetails(),
        MenuServices.getDetails(),
      ]);

      const catList = Array.isArray(catRes) ? catRes : catRes?.results || [];
      const menuList: any[] = Array.isArray(menuRes)
        ? menuRes
        : menuRes?.results || [];

      setCategories(catList);
      setMenuItems(menuList.filter((m) => m.status === "available"));

      const defaults: Record<number, number> = {};
      menuList.forEach((m) => {
        if (m.portions?.length > 0) defaults[m.id] = m.portions[0].id;
      });
      setSelectedPortion(defaults);
    } catch {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  // const visibleItems =
  //   activeCategory === "all"
  //     ? menuItems
  //     : menuItems.filter((m) => m.category === activeCategory);

  const visibleItems = menuItems.filter((m) =>
  m.name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
);

  const getPortion = (item: any, portionId: number) =>
    item.portions?.find((p: any) => p.id === portionId);

  const addToCart = (item: any) => {
    const portionId = selectedPortion[item.id] ?? item.portions?.[0]?.id;
    const portion = getPortion(item, portionId);
    if (!portion) {
      toast.error("This item has no available portion");
      return;
    }
    const key = `${item.id}_${portionId}`;

    setCartManuallyClosed(false);

    setCart((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          key,
          menuItemId: item.id,
          name: item.name,
          portionId,
          portionName: portion.portion_name,
          price: portion.price,
          quantity: (existing?.quantity || 0) + 1,
        },
      };
    });
  };

  const updateLineQty = (key: string, delta: number) => {
    setCart((prev) => {
      const line = prev[key];
      if (!line) return prev;
      const qty = line.quantity + delta;
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else next[key] = { ...line, quantity: qty };
      return next;
    });
  };

  const cartLines = Object.values(cart);
  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
  const cartTotal = cartLines.reduce((sum, l) => sum + l.quantity * l.price, 0);

  const handlePlaceOrder = async () => {
    if (cartLines.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!tableId) {
      toast.error("Scan your table's QR code to place an order");
      return;
    }
    try {
      setPlacing(true);
      const payload = {
        table_id: tableId,
        items: cartLines.map((l) => ({
          menu_item: l.menuItemId,
          selected_portion_id: l.portionId,
          quantity: l.quantity,
        })),
      };
      const created = await OrderServices.createDetails(payload);

      setCart({});
      setCartOpen(false);
      setCartManuallyClosed(false);

      if (created?.id) addMyOrderId(tableId, created.id);

      setShowOrderSuccessMessage(true);
      openHistory();
    } catch (err) {
      toast.error(OrderServices.parseError(err));
    } finally {
      setPlacing(false);
    }
  };

  const handlePaymentChoice = async (choice: "pay_now" | "pay_later") => {
    if (!placedOrder?.id) return;
    setPaymentSubmitting(choice);
    try {
      const res = await OrderServices.selectPaymentChoice(
        placedOrder.id,
        choice,
      );
      setPaymentResult({
        state: "success",
        choice,
        message:
          res.message ||
          (choice === "pay_now"
            ? "Payment received — your order is on its way to the kitchen."
            : "Got it — your order is on its way to the kitchen."),
      });
      toast.success(
        choice === "pay_now" ? "Payment confirmed" : "Pay later selected",
      );
    } catch (err: any) {
      const msg = OrderServices.parseError(err);
      setPaymentResult({
        state: "waiting",
        message:
          msg.toLowerCase().includes("accept") || err?.response?.status === 400
            ? "Your order is still being reviewed by our staff. You can choose your payment method once it's accepted — check Order History shortly."
            : msg,
      });
    } finally {
      setPaymentSubmitting(null);
    }
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setPlacedOrder(null);
    setPaymentResult(null);
  };

  const openHistory = async () => {
    if (!tableId) {
      toast.error("Scan your table's QR code to view order history");
      return;
    }
    setHistoryOpen(true);
    try {
      setOrdersLoading(true);
      const res = await OrderServices.getDetails({ table_id: tableId });
      const list = Array.isArray(res) ? res : res?.results || [];
      const myIds = getMyOrderIds(tableId);
      const mine = list.filter((order: any) => myIds.includes(order.id));
      setOrders(mine);
    } catch {
      toast.error("Failed to load order history");
    } finally {
      setOrdersLoading(false);
    }
  };

  const todayOrders = orders.filter((order) => {
    const d = getOrderDate(order);
    if (!d) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  const sortedOrders = [...todayOrders].sort((a, b) => {
    const da = getOrderDate(a)?.getTime() || 0;
    const db = getOrderDate(b)?.getTime() || 0;
    return db - da;
  });

  const handleRetryPaymentFromHistory = (order: any) => {
    setPlacedOrder(order);
    setPaymentResult(null);
    setHistoryOpen(false);
    setPaymentModalOpen(true);
  };

  const openAddItemsDrawer = (order: any) => {
    setAddItemsOrder(order);
    setAddCart({});
    setAddItemsCategory("all");
  };

  const closeAddItemsDrawer = () => {
    if (addItemsSubmitting) return;
    setAddItemsOrder(null);
    setAddCart({});
  };

  const addToAddCart = (item: any) => {
    const portionId = selectedPortion[item.id] ?? item.portions?.[0]?.id;
    const portion = getPortion(item, portionId);
    if (!portion) {
      toast.error("This item has no available portion");
      return;
    }
    const key = `${item.id}_${portionId}`;
    setAddCart((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          key,
          menuItemId: item.id,
          name: item.name,
          portionId,
          portionName: portion.portion_name,
          price: portion.price,
          quantity: (existing?.quantity || 0) + 1,
        },
      };
    });
  };

  const updateAddCartQty = (key: string, delta: number) => {
    setAddCart((prev) => {
      const line = prev[key];
      if (!line) return prev;
      const qty = line.quantity + delta;
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else next[key] = { ...line, quantity: qty };
      return next;
    });
  };

  const addCartLines = Object.values(addCart);
  const addCartCount = addCartLines.reduce((sum, l) => sum + l.quantity, 0);
  const addCartTotal = addCartLines.reduce(
    (sum, l) => sum + l.quantity * l.price,
    0,
  );

  const submitAddItems = async () => {
    if (!addItemsOrder?.id || addCartLines.length === 0) {
      toast.error("Pick at least one item to add");
      return;
    }
    try {
      setAddItemsSubmitting(true);
      await OrderServices.appendItems(
        addItemsOrder.id,
        addCartLines.map((l) => ({
          menu_item: l.menuItemId,
          selected_portion_id: l.portionId,
          quantity: l.quantity,
        })),
      );
      toast.success("Items added to your order");
      setAddItemsOrder(null);
      setAddCart({});
      if (tableId) {
        try {
          const res = await OrderServices.getDetails({ table_id: tableId });
          const list = Array.isArray(res) ? res : res?.results || [];
          const myIds = getMyOrderIds(tableId);
          setOrders(list.filter((o: any) => myIds.includes(o.id)));
        } catch {}
      }
    } catch (err) {
      toast.error(OrderServices.parseError(err));
    } finally {
      setAddItemsSubmitting(false);
    }
  };

  const dismissSettledOrder = () => {
    if (settledOrder?.id) markBillSeen(settledOrder.id);
    setSettledOrder(null);
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex justify-center bg-white">
      <div className="w-full max-w-7xl min-h-screen relative ">{children}</div>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-sm relative z-10">
                <Image
                  src="/logo.png"
                  alt="Loading..."
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#c47c30] rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (settledOrder) {
    const isPaid = getOrderIsPaid(settledOrder);
    return (
      <Shell>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <PartyPopper size={28} className="text-green-600" />
          </div>
          <h1 className="text-xl font-extrabold text-[#241712] text-center">
            Thanks for dining with us!
          </h1>
          <p className="text-[13px] text-[#8a7a6e] max-w-xs text-center">
            Order #{settledOrder.id} for Table {tableNumber} has been completed
            and settled.
          </p>

          <div className="w-full max-w-xs bg-white border border-[#e8dccd] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-bold text-[#241712]">
                Bill #{settledOrder.id}
              </p>
              <p className="text-[13px] font-extrabold text-[#241712]">
                {formatPrice(getOrderTotal(settledOrder))}
              </p>
            </div>
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isPaid ? "PAID" : "UNPAID"}
            </span>
          </div>

          <button
            onClick={() => setViewBillOrder(settledOrder)}
            className="w-full max-w-xs flex items-center justify-center gap-2 py-3 bg-[#c47c30] text-white rounded-full text-sm font-bold active:scale-[0.98] transition-transform"
          >
            <Receipt size={16} /> View & Download Bill
          </button>

          <button
            onClick={dismissSettledOrder}
            className="w-full max-w-xs py-3 bg-[#241712] text-white rounded-full text-sm font-bold active:scale-[0.98] transition-transform"
          >
            Start a new order
          </button>
        </div>

        {viewBillOrder && (
          <BillInvoiceModal
            order={viewBillOrder}
            restaurant={restaurant}
            tableNumber={tableNumber}
            onClose={() => setViewBillOrder(null)}
          />
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      {/* ---- Dynamic bottom padding so cards are never hidden behind the cart drawer ---- */}
      <div
        style={{
          paddingBottom:
            cartOpen && cartCount > 0
              ? cartDrawerHeight + 24
              : cartCount > 0
                ? 96
                : 80,
          transition: "padding-bottom 0.25s ease",
        }}
      >
        {/* Redesigned Premium Sticky Header Block */}
      <header className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 sticky top-0 z-30 backdrop-blur-md bg-white/90 border-b border-gray-100 shadow-sm">
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-3 min-w-0">
      {/* Restaurant logo */}
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 bg-white flex items-center justify-center">
        {restaurant?.logo ? (
          <img
            src={restaurant.logo}
            alt={restaurant?.title || "Restaurant logo"}
            className="w-full h-full object-cover"
          />
        ) : (
          <UtensilsCrossed size={20} className="text-[#c47c30]" />
        )}
      </div>

      <div className="min-w-0">
        <h1 className="text-[15px] sm:text-lg font-extrabold text-[#241712] truncate leading-tight">
          {restaurant?.title || "Our Special Menu"}
        </h1>

        {tableNumber && tableValid ? (
          <span className="inline-flex items-center font-sans bg-[#c47c30] text-white px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-sm mt-0.5">
            Table: {tableNumber}
          </span>
        ) : tableNumber && !tableValid ? (
          <span className="inline-flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-red-50 border border-red-100 text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Table unrecognized
          </span>
        ) : (
          <p className="text-[10px] sm:text-[11px] text-[#8a7a6e] truncate flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="flex-shrink-0" />
            {restaurant?.address || "Scan table QR to place direct orders"}
          </p>
        )}
      </div>
    </div>

    <button
      onClick={() => {
        setShowOrderSuccessMessage(false);
        openHistory();
      }}
      className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-[#c47c30] hover:border-[#c47c30]/40 active:scale-90 transition-all"
    >
      <History size={17} className="sm:size-[18px]" />
    </button>
  </div>

  {tableNumber && !tableValid && (
    <p className="text-[10px] sm:text-[11px] text-[#8a7a6e] mt-1.5">
      Please re-scan code to place orders
    </p>
  )}
</header>

        {/* Clean, Non-overlapping Sticky Category Filter Row */}
        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto px-4 sm:px-5 py-3 sm:py-3.5 bg-white sticky top-[65px] sm:top-[73px] z-20 border-b border-gray-200/60 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex-shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold tracking-wide transition-all ${
              activeCategory === "all"
                ? "bg-[#c47c30] text-white shadow-md shadow-[#c47c30]/20"
                : "bg-white text-[#8a7a6e] border border-gray-200/80 hover:bg-gray-50"
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex-shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold tracking-wide transition-all whitespace-nowrap ${
                activeCategory === c.id
                  ? "bg-[#c47c30] text-white shadow-md shadow-[#c47c30]/20"
                  : "bg-white text-[#8a7a6e] border border-gray-200/80 hover:bg-gray-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-bold text-[#241712]">
              No active items found
            </p>
            <p className="text-xs text-[#8a7a6e] mt-1">
              Try selecting another category panel above.
            </p>
          </div>
        ) : (
          /*
            MOBILE (default): single-column LIST rows — image left, details right,
            qty stepper inline — so every card is fully visible without horizontal
            cropping or 2-up squeeze.
            sm+ : switches to a proper grid of cards (2 / 4 columns).
          */
          <div className="flex flex-col gap-3 px-4 pt-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-5 sm:pt-5 lg:grid-cols-4">
            {visibleItems.map((item) => {
              const portionId =
                selectedPortion[item.id] ?? item.portions?.[0]?.id;
              const portion = getPortion(item, portionId);
              const key = `${item.id}_${portionId}`;
              const qty = cart[key]?.quantity || 0;

              return (
                <div
                  key={item.id}
                  className="
                    bg-white rounded-lg border border-gray-100 shadow-sm
                    flex flex-row items-stretch gap-3 p-2
                    sm:flex-col sm:items-start sm:gap-0 sm:overflow-hidden
                    transition-all hover:shadow-md
                  "
                >
                  {/* Image */}
                  <div
                    className="
                      w-14 h-14 flex-shrink-0 rounded-lg
                      sm:w-full sm:h-22 lg:h-22 sm:flex-shrink sm:mb-2.5
                      bg-gray-50 overflow-hidden flex items-center justify-center relative
                    "
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UtensilsCrossed size={24} className="text-gray-300" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="text-[13px] sm:text-[14px] font-bold leading-snug text-[#241712] line-clamp-2 sm:min-h-[2.5rem]">
                      {item.name}
                    </h3>

                    {item.portions?.length > 1 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                        {item.portions.map((p: any) => (
                          <button
                            key={p.id}
                            onClick={() =>
                              setSelectedPortion((prev) => ({
                                ...prev,
                                [item.id]: p.id,
                              }))
                            }
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded transition-all ${
                              portionId === p.id
                                ? "bg-[#241712] text-white"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {p.portion_name}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2 pt-1.5 sm:pt-2.5 sm:border-t sm:border-gray-50">
                      <span className="text-[13px] sm:text-[14px] font-black text-[#241712] tabular-nums">
                        {formatPrice(portion?.price)}
                      </span>

                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#c47c30] text-white rounded-lg text-[11px] font-bold shadow-sm hover:bg-[#b06d27] active:scale-95 transition-all"
                        >
                          <Plus size={13} /> Add
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-gray-50 rounded-full p-0.5 border border-gray-200">
                          <button
                            onClick={() => updateLineQty(key, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-[#241712] shadow-sm hover:bg-gray-100 active:scale-90 transition-all"
                          >
                            <Minus size={12} />
                          </button>

                          <span className="px-2.5 text-xs font-bold text-[#241712] tabular-nums">
                            {qty}
                          </span>

                          <button
                            onClick={() => addToCart(item)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-[#c47c30] text-white shadow-sm hover:bg-[#b06d27] active:scale-90 transition-all"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        onClick={() => setHistoryOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          historyOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        ref={cartDrawerRef}
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 transition-transform duration-300 ease-out ${
          cartOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="h-3"
          style={{
            backgroundImage:
              "linear-gradient(-45deg, #D6A36D 6px, transparent 0), linear-gradient(45deg, #D6A36D 6px, transparent 0)",
            backgroundSize: "12px 12px",
            backgroundPosition: "left top",
            backgroundRepeat: "repeat-x",
          }}
        />

       <div className="bg-[#fcf8f0] flex flex-col shadow-2xl">
  <button
    type="button"
    onClick={() => setCartOpen(false)}
    className="w-full flex items-center justify-between px-5 pt-1 pb-3 group"
  >
    <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#8a7a6e]">
      Order — Table {tableNumber || "—"}
    </h2>
    <span className="flex items-center gap-1 text-[#8a7a6e] bg-[#c47c30]/20 p-2 rounded-full group-hover:text-[#c47c30] transition-colors">
      {/* <span className="text-[10px] font-bold uppercase tracking-wide">Collapse</span> */}
      <ChevronDown size={20} />
    </span>
  </button>

  <div className="max-h-[144px] overflow-y-auto px-5 font-mono divide-y divide-dotted divide-[#d8cab9]/40">
    {cartLines.length === 0 ? (
      <p className="text-xs text-[#8a7a6e] text-center py-6">
        Nothing ordered yet — tap any item to add it.
      </p>
    ) : (
      cartLines.map((line) => (
        <div key={line.key} className="flex items-center gap-2 py-2">
          <span className="text-[12px] font-bold text-[#241712] flex-shrink-0">
            {line.quantity}×
          </span>
          <span className="text-[12px] text-[#241712] flex-shrink-0">
            {line.name}
            {line.portionName ? ` (${line.portionName})` : ""}
          </span>
          <span className="flex-1 border-b border-dotted border-[#d8cab9] mb-1" />
          <span className="text-[12px] font-bold text-[#241712] tabular-nums flex-shrink-0">
            {formatPrice(line.price * line.quantity)}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            <button
              onClick={() => updateLineQty(line.key, -1)}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-[#f3e9d8] text-[#241712] active:scale-90"
            >
              <Minus size={10} />
            </button>
            <button
              onClick={() => updateLineQty(line.key, 1)}
              className="w-5 h-5 flex items-center justify-center rounded-full bg-[#f3e9d8] text-[#241712] active:scale-90"
            >
              <Plus size={10} />
            </button>
          </div>
        </div>
      ))
    )}
  </div>

  <div className="border-t-2 border-dashed border-[#d8cab9] mx-5 mt-2" />
  <div
    className="px-5 py-3 space-y-3"
    style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
  >
    <div className="flex justify-between font-mono">
      <span className="text-[13px] font-bold text-[#241712]">
        Total
      </span>
      <span className="text-[15px] font-extrabold text-[#241712] tabular-nums">
        {formatPrice(cartTotal)}
      </span>
    </div>
    <button
      onClick={handlePlaceOrder}
      disabled={placing || cartLines.length === 0}
      className="w-full py-3 bg-[#c47c30] text-white rounded-full text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {placing && <Loader2 size={14} className="animate-spin" />}
      {placing ? "Placing order…" : "Place order"}
    </button>
  </div>
</div>
      </div>

      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => {
            setCartOpen(true);
            setCartManuallyClosed(false);
          }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#c47c30] text-white px-5 py-2 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          {/* <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-[#c47c30] text-[11px] font-bold">
            {cartCount}
          </span> */}
          <span className="text-[13px] font-bold">View Order</span>
          <span className="text-[13px] font-extrabold">
            {formatPrice(cartTotal)}
          </span>
        </button>
      )}

      <div
        onClick={paymentSubmitting ? undefined : closePaymentModal}
        className={`fixed inset-0 bg-[#241712]/55 z-[60] transition-opacity duration-200 ${
          paymentModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`fixed inset-0 z-[61] flex items-center justify-center p-4 transition-all duration-200 ${
          paymentModalOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 pt-5 pb-3 text-center border-b border-[#e8dccd]">
            {!paymentResult ? (
              <>
                <div className="w-12 h-12 mx-auto rounded-full bg-[#c47c30]/10 flex items-center justify-center mb-2">
                  <ShoppingCart size={20} className="text-[#c47c30]" />
                </div>
                <h2 className="text-[15px] font-bold text-[#241712]">
                  Choose payment
                </h2>
                <p className="text-[12px] text-[#8a7a6e] mt-1">
                  {placedOrder?.id ? `Order #${placedOrder.id} · ` : ""}
                  How would you like to pay?
                </p>
              </>
            ) : paymentResult.state === "success" ? (
              <>
                <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <CheckCircle2 size={22} className="text-green-600" />
                </div>
                <h2 className="text-[15px] font-bold text-[#241712]">
                  {paymentResult.choice === "pay_now"
                    ? "Payment confirmed"
                    : "Pay later selected"}
                </h2>
              </>
            ) : (
              <>
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-2">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <h2 className="text-[15px] font-bold text-[#241712]">
                  Order received
                </h2>
              </>
            )}
          </div>

          <div className="px-5 py-4">
            {!paymentResult ? (
              <div className="space-y-2.5">
                {placedOrder?.total_amount !== undefined && (
                  <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-[#fcf7f2] mb-1">
                    <span className="text-[11px] font-bold text-[#8a7a6e] uppercase">
                      Total
                    </span>
                    <span className="text-[15px] font-extrabold text-[#241712]">
                      {formatPrice(getOrderTotal(placedOrder))}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handlePaymentChoice("pay_now")}
                  disabled={paymentSubmitting !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#c47c30] bg-[#c47c30]/5 hover:bg-[#c47c30]/10 transition-colors disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-full bg-[#c47c30] text-white flex items-center justify-center flex-shrink-0">
                    {paymentSubmitting === "pay_now" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Wallet size={16} />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-[#241712]">
                      Pay Now
                    </p>
                    <p className="text-[10px] text-[#8a7a6e]">
                      Pay online, sent to kitchen instantly
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentChoice("pay_later")}
                  disabled={paymentSubmitting !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-[#e8dccd] hover:bg-[#fcf7f2] transition-colors disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-full bg-[#241712] text-white flex items-center justify-center flex-shrink-0">
                    {paymentSubmitting === "pay_later" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Banknote size={16} />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-[#241712]">
                      Pay Later
                    </p>
                    <p className="text-[10px] text-[#8a7a6e]">
                      Settle the bill at your table
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-[12px] text-[#8a7a6e] leading-relaxed">
                  {paymentResult.message}
                </p>
                <button
                  onClick={closePaymentModal}
                  className="w-full py-2.5 bg-[#241712] text-white rounded-full text-[13px] font-bold active:scale-[0.98] transition-transform"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[400px] z-50 transition-transform duration-300 ease-out ${
          historyOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full bg-white border-l border-[#e8dccd] flex flex-col">
          <div className="px-5 pt-5 pb-4 border-b border-[#e8dccd]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-bold text-[#241712]">
                  Your order history
                </h2>
                {tableNumber && (
                  <p className="text-[12px] text-[#8a7a6e] mt-0.5">
                    Table {tableNumber} · special only your orders
                  </p>
                )}

                {showOrderSuccessMessage ? (
                  <div className="mt-2 text-[11px] font-bold px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg animate-fade-in">
                    Order placed! Pay via Order History once accepted.
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#c47c30]/10 text-[#c47c30]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c47c30]" />
                    Today only
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowOrderSuccessMessage(false);
                  setHistoryOpen(false);
                }}
                className="w-8 h-8 rounded-lg border border-[#e8dccd] flex items-center justify-center text-[#8a7a6e] hover:bg-[#fcf7f2] active:scale-90 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {ordersLoading ? (
              <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-sm relative z-10">
                    <Image
                      src="/logo.png"
                      alt="Loading..."
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#c47c30] rounded-full animate-spin" />
                </div>
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                <Inbox size={28} className="text-[#e8dccd]" />
                <p className="text-[13px] font-bold text-[#241712]">
                  No orders today
                </p>
                <p className="text-[11px] text-[#8a7a6e]">
                  Orders you place today will appear here.
                </p>
              </div>
            ) : (
              sortedOrders.map((order) => {
                const date = getOrderDate(order);
                const status = getOrderStatus(order);

                if (isBillReady(order)) {
                  const isPaid = getOrderIsPaid(order);
                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-[#e8dccd] overflow-hidden bg-[#fcf7f2]"
                    >
                      <div className="flex items-center justify-between px-3.5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#c47c30]/10 flex items-center justify-center flex-shrink-0">
                            <Receipt size={15} className="text-[#c47c30]" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[#241712]">
                              Bill · Order #{order.id}
                            </p>
                            <p className="text-[10px] text-[#8a7a6e] mt-0.5">
                              {date
                                ? date.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "—"}
                              {"  ·  "}
                              {formatPrice(getOrderTotal(order))}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full flex-shrink-0 ${
                            isPaid
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {isPaid ? "PAID" : "UNPAID"}
                        </span>
                      </div>
                      <div className="px-3.5 pb-3">
                        <button
                          onClick={() => setViewBillOrder(order)}
                          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-[#c47c30] px-3 py-2 rounded-full active:scale-95 transition-transform"
                        >
                          <Eye size={12} /> View Bill
                        </button>
                      </div>
                    </div>
                  );
                }

                const needsPaymentChoice =
                  status === "accepted" &&
                  (!order.payment_choice ||
                    order.payment_choice === "uncommitted");
                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-[#e8dccd] overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#fcf7f2] border-b border-[#e8dccd]">
                      <div>
                        <p className="text-[13px] font-bold text-[#241712]">
                          Order #{order.id}
                        </p>
                        <p className="text-[10px] text-[#8a7a6e] mt-0.5">
                          {date
                            ? date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                          STATUS_STYLE[status] || "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="px-3.5 py-2.5 space-y-1.5">
                      {getOrderItems(order).map((it: any, i: number) => (
                        <div key={i} className="flex items-baseline gap-2">
                          <span className="text-[11px] font-bold text-[#8a7a6e] flex-shrink-0 w-5">
                            {getItemQty(it)}×
                          </span>
                          <span className="text-[12px] text-[#241712] flex-1">
                            {getItemName(it)}
                            {getItemPortion(it) && (
                              <span className="text-[#8a7a6e]">
                                {" "}
                                ({getItemPortion(it)})
                              </span>
                            )}
                          </span>
                          <span className="text-[12px] font-bold text-[#241712] tabular-nums flex-shrink-0">
                            {formatPrice(getItemPrice(it) * getItemQty(it))}
                          </span>
                        </div>
                      ))}
                    </div>

                    {needsPaymentChoice && (
                      <div className="px-3.5 pb-2.5">
                        <button
                          onClick={() => handleRetryPaymentFromHistory(order)}
                          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-[#c47c30] px-3 py-2 rounded-full active:scale-95 transition-transform"
                        >
                          <Wallet size={11} /> Choose payment method
                        </button>
                      </div>
                    )}

                    {status === "pending" && (
                      <div className="px-3.5 pb-2.5">
                        <p className="text-[10px] text-[#8a7a6e] text-center bg-[#fcf7f2] rounded-full py-1.5">
                          Payment options will appear once staff accepts your
                          order
                        </p>
                      </div>
                    )}

                    {canAddItems(order) && (
                      <div className="px-3.5 pb-2.5">
                        <button
                          onClick={() => openAddItemsDrawer(order)}
                          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#c47c30] bg-[#c47c30]/10 px-3 py-2 rounded-full active:scale-95 transition-transform"
                        >
                          <Plus size={12} /> Add more items
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-dashed border-[#e8dccd]">
                      <span className="text-[14px] font-extrabold text-[#241712]">
                        {formatPrice(getOrderTotal(order))}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div
        onClick={addItemsSubmitting ? undefined : closeAddItemsDrawer}
        className={`fixed inset-0 bg-[#241712]/55 z-[70] transition-opacity duration-200 ${
          addItemsOrder ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[71] transition-transform duration-300 ease-out ${
          addItemsOrder ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#e8dccd]">
            <div>
              <h2 className="text-[14px] font-bold text-[#241712]">
                Add items {addItemsOrder ? `· Order #${addItemsOrder.id}` : ""}
              </h2>
              <p className="text-[11px] text-[#8a7a6e] mt-0.5">
                Tap to add, then send to kitchen
              </p>
            </div>
            <button
              onClick={closeAddItemsDrawer}
              className="text-[#8a7a6e] hover:text-[#c47c30]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto px-5 py-2.5 scrollbar-hide border-b border-[#e8dccd]">
            <button
              onClick={() => setAddItemsCategory("all")}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                addItemsCategory === "all"
                  ? "bg-[#c47c30] text-white"
                  : "bg-[#fcf7f2] text-[#8a7a6e] border border-[#e8dccd]"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setAddItemsCategory(c.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-colors whitespace-nowrap ${
                  addItemsCategory === c.id
                    ? "bg-[#c47c30] text-white"
                    : "bg-[#fcf7f2] text-[#8a7a6e] border border-[#e8dccd]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {menuItems
              .filter(
                (m) =>
                  addItemsCategory === "all" || m.category === addItemsCategory,
              )
              .map((item) => {
                const portionId =
                  selectedPortion[item.id] ?? item.portions?.[0]?.id;
                const portion = getPortion(item, portionId);
                const key = `${item.id}_${portionId}`;
                const qty = addCart[key]?.quantity || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5 border-b border-[#f1e9dd] last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#241712] truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#8a7a6e]">
                        {formatPrice(portion?.price)}
                      </p>
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => addToAddCart(item)}
                        className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[#c47c30] text-white rounded-lg text-[11px] font-bold active:scale-95 transition-transform"
                      >
                        <Plus size={13} /> Add
                      </button>
                    ) : (
                      <div className="flex-shrink-0 flex items-center justify-between bg-[#fcf7f2] rounded-full p-1 border border-[#e8dccd]">
                        <button
                          onClick={() => updateAddCartQty(key, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-[#241712] shadow-sm active:scale-90 transition-transform"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-[12px] font-bold">
                          {qty}
                        </span>
                        <button
                          onClick={() => addToAddCart(item)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-[#c47c30] text-white shadow-sm active:scale-90 transition-transform"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div
            className="px-5 py-3 border-t border-[#e8dccd]"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-[13px] font-bold text-[#241712]">
                {addCartCount > 0
                  ? `${addCartCount} item${addCartCount > 1 ? "s" : ""}`
                  : "No items selected"}
              </span>
              <span className="text-[15px] font-extrabold text-[#241712]">
                {formatPrice(addCartTotal)}
              </span>
            </div>
            <button
              onClick={submitAddItems}
              disabled={addItemsSubmitting || addCartLines.length === 0}
              className="w-full py-3 bg-[#c47c30] text-white rounded-full text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addItemsSubmitting && (
                <Loader2 size={14} className="animate-spin" />
              )}
              {addItemsSubmitting ? "Sending…" : "Send to kitchen"}
            </button>
          </div>
        </div>
      </div>

      {viewBillOrder && (
        <BillInvoiceModal
          order={viewBillOrder}
          restaurant={restaurant}
          tableNumber={tableNumber}
          onClose={() => setViewBillOrder(null)}
        />
      )}
    </Shell>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex justify-center">
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-sm relative z-10">
                <Image
                  src="/logo.png"
                  alt="Loading..."
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#c47c30] rounded-full animate-spin" />
            </div>
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
