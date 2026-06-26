"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2, UtensilsCrossed, ShoppingCart, Plus, Minus, X, Inbox, History, Download,
  Heart,
  Truck,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MenuServices } from "@/services/menuServices";
import { CategoryServices } from "@/services/categoryServices";
import { TableServices } from "@/services/tableServices";
import { OrderServices } from "@/services/orderServices";
import Image from "next/image";

// ── Palette ──────────────────────────────────────────────────────
// accent #c47c30  ink #241712  muted #8a7a6e  paper #fcf7f2  line #e8dccd  frame #e7d9c8

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const formatPrice = (n: number) => `$${Number(n || 0).toFixed(2)}`;

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-600",
  preparing: "bg-blue-100 text-blue-600",
  served: "bg-green-100 text-green-600",
  completed: "bg-green-100 text-green-600",
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

// ── Best-guess accessors for the Order GET response ─────────────
// Adjust these if your serializer uses different field names.
// ── Accessors for the Order GET response (confirmed shape) ──────
const getOrderItems = (order: any) => order.items || [];
const getItemName = (it: any) => it.menu_item_name || "Item";
const getItemPortion = (it: any) => it.portion_name || "";
const getItemQty = (it: any) => it.quantity || 0;
const getItemPrice = (it: any) => Number(it.portion_price) || 0;       // ← was it.price
const getOrderTotal = (order: any) => Number(order.total_amount) || 0; // ← was order.total
const getOrderStatus = (order: any) => order.status || "pending";
const getOrderDate = (order: any) => (order.created_at ? new Date(order.created_at) : null);

function MenuContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get("table_number");

  const [loading, setLoading]       = useState(true);
  const [tableValid, setTableValid] = useState(false);
  const [tableId, setTableId]       = useState<number | null>(null);

  const [menuItems, setMenuItems]   = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");

  const [selectedPortion, setSelectedPortion] = useState<Record<number, number>>({});
  const [cart, setCart]       = useState<Record<string, CartLine>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [historyOpen, setHistoryOpen]   = useState(false);
  const [orders, setOrders]             = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => { init(); }, [tableNumber]);

  const init = async () => {
    try {
      setLoading(true);

      // Table is optional now — both "has table_number" and "no table_number"
      // states fall through to load the menu below.
      if (tableNumber) {
        try {
          const tables = await TableServices.getDetails();
          const tableList = Array.isArray(tables) ? tables : tables?.results || [];
          const match = tableList.find((t: any) => t.table_number === tableNumber);
          if (match) {
            setTableValid(true);
            setTableId(match.id);
          } else {
            setTableValid(false);
            toast.error(`Table ${tableNumber} not recognized — you can still browse`);
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
      const menuList: any[] = Array.isArray(menuRes) ? menuRes : menuRes?.results || [];

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

  const visibleItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((m) => m.category === activeCategory);

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
  const cartTotal  = cartLines.reduce((sum, l) => sum + l.quantity * l.price, 0);

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
      await OrderServices.createDetails(payload);
      toast.success("Order placed");
      setCart({});
      setCartOpen(false);
    } catch (err) {
      toast.error(OrderServices.parseError(err));
    } finally {
      setPlacing(false);
    }
  };

  // ── Order history ────────────────────────────────────────────
  const openHistory = async () => {
    if (!tableId) {
      toast.error("Scan your table's QR code to view order history");
      return;
    }
    setCartOpen(false);
    setHistoryOpen(true);
    try {
      setOrdersLoading(true);
      const res = await OrderServices.getDetails({ table_id: tableId });
      const list = Array.isArray(res) ? res : res?.results || [];
      setOrders(list);
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

  const downloadOrderReceipt = (order: any) => {
    const doc = new jsPDF();
    const date = getOrderDate(order);

    doc.setFontSize(14);
    doc.text("Order Receipt", 14, 15);
    doc.setFontSize(9);
    doc.text(`Order #${order.id}`, 14, 22);
    doc.text(`Table ${tableNumber || ""}`, 14, 27);
    doc.text(date ? date.toLocaleString() : "—", 14, 32);

    autoTable(doc, {
      head: [["Item", "Portion", "Qty", "Price"]],
      body: getOrderItems(order).map((it: any) => [
        getItemName(it),
        getItemPortion(it) || "—",
        getItemQty(it),
        formatPrice(getItemPrice(it)),
      ]),
      startY: 38,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [227, 89, 30] }, // #c47c30
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 45;
    doc.setFontSize(10);
    doc.text(`Total: ${formatPrice(getOrderTotal(order))}`, 14, finalY + 8);

    doc.save(`Order_${order.id}.pdf`);
    toast.success("Receipt downloaded");
  };

  // ── Shared phone-canvas shell ────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-7xl min-h-screen  relative ">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-screen">
<div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-sm relative z-10">
            <Image src="/logo.png" alt="Loading..." width={80} height={80} className="w-full h-full object-cover" />
          </div>
          <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#c47c30] rounded-full animate-spin" />
        </div>
      </div>        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="pb-20">
        {/* Header */}
        <header className="px-5 pt-5 pb-4 sticky top-0 z-20 flex items-start justify-between gap-3">
          <div>
            {tableNumber && tableValid && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a7a6e]">
                    Table : 
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-[#241712] tracking-tight mt-0.5">
                  {tableNumber}
                </h1>
              </>
            )}

            {tableNumber && !tableValid && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#c47c30]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c47c30]">
                    Table not recognized
                  </span>
                </div>
                <p className="text-xs text-[#8a7a6e] mt-0.5">
                  You can browse, but rescan to order.
                </p>
              </>
            )}

            {!tableNumber && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-bold uppercase tracking-wider text-[#352519]">
                   Our Special Menu
                  </span>
                </div>
                <p className="text-xs text-[#352519] mt-0.5">
                  Scan your table's QR code to order.
                </p>
              </>
            )}
          </div>

          <button
            onClick={openHistory}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-[#e8dccd] flex items-center justify-center text-[#8a7a6e] active:scale-90 transition-transform"
          >
            <History size={16} />
          </button>
        </header>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide sticky top-[81]  z-20 border-b border-[#e8dccd]">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors ${
              activeCategory === "all"
                ? "bg-[#c47c30] text-white"
                : "bg-white text-[#8a7a6e] border border-[#e8dccd]"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors whitespace-nowrap ${
                activeCategory === c.id
                  ? "bg-[#c47c30] text-white"
                  : "bg-white text-[#8a7a6e] border border-[#e8dccd]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Menu grid — 2 cols base/sm, 4 cols lg+ */}
        {visibleItems.length === 0 ? (
          <div className="text-center py-16">
            <Inbox className="mx-auto text-[#e8dccd] mb-2" size={32} />
            <p className="text-sm font-bold text-[#241712]">Nothing here yet</p>
            <p className="text-xs text-[#8a7a6e] mt-1">Try a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-5 pt-4">
            {visibleItems.map((item) => {
              const portionId = selectedPortion[item.id] ?? item.portions?.[0]?.id;
              const portion = getPortion(item, portionId);
              const key = `${item.id}_${portionId}`;
              const qty = cart[key]?.quantity || 0;

              return (
               <div className="bg-white rounded-lg border border-[#e8dccd] overflow-hidden flex flex-col h-full p-2">
  

               {/* Image Section - Height limited to 32 (128px) */}
                <div className="lg:h-52 h-32 w-full bg-[#fcf7f2] overflow-hidden rounded-lg flex items-center justify-center mb-2">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-center" 
                    />
                  ) : (
                    <UtensilsCrossed size={32} className="text-[#e8dccd]" />
                  )}
                </div>

                {/* Name & Details */}
                <h3 className="text-[16px] font-semibold leading-tight text-[#241712] line-clamp-2">
                  {item.name}
                </h3>

                

              

                {/* Portion Selector */}
                {item.portions?.length > 1 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.portions.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPortion((prev) => ({ ...prev, [item.id]: p.id }))}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                          portionId === p.id ? "bg-[#241712] text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.portion_name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Price & Add to Cart */}
                <div className="mt-auto flex items-center justify-between gap-4 pt-2">
                  <span className="text-[14px] font-extrabold text-[#241712]">
                    {formatPrice(portion?.price)}
                  </span>

                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#c47c30] text-white rounded-lg text-[12px] font-bold active:scale-95 transition-transform"
                    >
                      <Plus size={16} /> Add
                    </button>
                  ) : (
                   <div className="flex items-center justify-between bg-[#fcf7f2] rounded-full p-1 border">
                    {/* Minus Button - Rounded Full */}
                    <button 
                      onClick={() => updateLineQty(key, -1)} 
                      className="p-1 rounded-full bg-white text-[#241712] shadow-sm active:scale-90 transition-transform"
                    >
                      <Minus size={14} />
                    </button>
                    
                    <span className="px-3 text-sm font-bold">{qty}</span>
                    
                    {/* Plus Button - Rounded Full */}
                    <button 
                      onClick={() => addToCart(item)} 
                      className="p-1 rounded-full bg-[#c47c30] text-white shadow-sm active:scale-90 transition-transform"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating cart tab */}
      {cartCount > 0 && (
        <button
          onClick={() => { setHistoryOpen(false); setCartOpen(true); }}
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full  bg-[#c47c30] text-white px-5 py-6.5 rounded-t-2xl flex items-center justify-between z-30 transition-transform duration-200 ${
            cartOpen ? "translate-y-full" : "translate-y-0"
          }`}
        >
          <span className="flex items-center gap-2 text-[13px] font-bold">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-[#c47c30] text-[11px]">
              {cartCount}
            </span>
            View order
          </span>
          <span className="text-[13px] font-extrabold">{formatPrice(cartTotal)}</span>
        </button>
      )}

      {/* Shared backdrop for cart + history */}
      <div
        onClick={() => { setCartOpen(false); setHistoryOpen(false); }}
        className={`fixed inset-0 bg-[#241712]/50 z-40 transition-opacity duration-200 ${
          cartOpen || historyOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Receipt-style cart drawer */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 transition-transform duration-300 ease-out ${
          cartOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="h-3"
          style={{
            backgroundImage:
              "linear-gradient(-45deg, #fff 6px, transparent 0), linear-gradient(45deg, #fff 6px, transparent 0)",
            backgroundSize: "12px 12px",
            backgroundPosition: "left top",
            backgroundRepeat: "repeat-x",
          }}
        />
        <div className="bg-white max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between px-5 pt-1 pb-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#8a7a6e]">
              Order — Table {tableNumber || "—"}
            </h2>
            <button onClick={() => setCartOpen(false)} className="text-[#8a7a6e] hover:text-[#c47c30]">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 font-mono">
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
                    {line.name}{line.portionName ? ` (${line.portionName})` : ""}
                  </span>
                  <span className="flex-1 border-b border-dotted border-[#d8cab9] mb-1" />
                  <span className="text-[12px] font-bold text-[#241712] tabular-nums flex-shrink-0">
                    {formatPrice(line.price * line.quantity)}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => updateLineQty(line.key, -1)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-[#fcf7f2] text-[#241712] active:scale-90"
                    >
                      <Minus size={10} />
                    </button>
                    <button
                      onClick={() => updateLineQty(line.key, 1)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-[#fcf7f2] text-[#241712] active:scale-90"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t-2 border-[#241712] mx-5 mt-2" />
          <div className="px-5 py-3 space-y-3" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <div className="flex justify-between font-mono">
              <span className="text-[13px] font-bold text-[#241712]">Total</span>
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

   {/* Order history drawer — desktop side panel */}
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-[400px] z-50 transition-transform duration-300 ease-out ${
        historyOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="h-full bg-white border-l border-[#e8dccd] flex flex-col">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#e8dccd]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-[#241712]">Order history</h2>
              {tableNumber && (
                <p className="text-[12px] text-[#8a7a6e] mt-0.5">Table {tableNumber}</p>
              )}
              <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#c47c30]/10 text-[#c47c30]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c47c30]" />
                Today only
              </span>
            </div>
            <button
              onClick={() => setHistoryOpen(false)}
              className="w-8 h-8 rounded-lg border border-[#e8dccd] flex items-center justify-center text-[#8a7a6e] hover:bg-[#fcf7f2] active:scale-90 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {ordersLoading ? (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="relative flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-sm relative z-10">
                        <Image src="/logo.png" alt="Loading..." width={80} height={80} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute w-24 h-24 border-4 border-transparent border-t-[#2b98e1] rounded-full animate-spin" />
                    </div>
                  </div>
          ) : sortedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
              <Inbox size={28} className="text-[#e8dccd]" />
              <p className="text-[13px] font-bold text-[#241712]">No orders today</p>
              <p className="text-[11px] text-[#8a7a6e]">Orders placed today will appear here.</p>
            </div>
          ) : (
            sortedOrders.map((order) => {
              const date = getOrderDate(order);
              const status = getOrderStatus(order);
              return (
                <div key={order.id} className="rounded-xl border border-[#e8dccd] overflow-hidden">

                  {/* Card header */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#fcf7f2] border-b border-[#e8dccd]">
                    <div>
                      <p className="text-[13px] font-bold text-[#241712]">Order #{order.id}</p>
                      <p className="text-[10px] text-[#8a7a6e] mt-0.5">
                        {date ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                        STATUS_STYLE[status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="px-3.5 py-2.5 space-y-1.5">
                    {getOrderItems(order).map((it: any, i: number) => (
                      <div key={i} className="flex items-baseline gap-2">
                        <span className="text-[11px] font-bold text-[#8a7a6e] flex-shrink-0 w-5">
                          {getItemQty(it)}×
                        </span>
                        <span className="text-[12px] text-[#241712] flex-1">
                          {getItemName(it)}
                          {getItemPortion(it) && (
                            <span className="text-[#8a7a6e]"> ({getItemPortion(it)})</span>
                          )}
                        </span>
                        <span className="text-[12px] font-bold text-[#241712] tabular-nums flex-shrink-0">
                          {formatPrice(getItemPrice(it) * getItemQty(it))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-dashed border-[#e8dccd]">
                    <span className="text-[14px] font-extrabold text-[#241712]">
                      {formatPrice(getOrderTotal(order))}
                    </span>
                    <button
                      onClick={() => downloadOrderReceipt(order)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-[#c47c30] px-2.5 py-1 rounded-full border border-[#c47c30]/20 hover:bg-[#c47c30]/10 transition-colors"
                    >
                      <Download size={11} /> Receipt
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>

    </Shell>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#e7d9c8] flex justify-center">
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
                  <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-sm relative z-10">
                      <Image src="/logo.png" alt="Loading..." width={80} height={80} className="w-full h-full object-cover" />
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