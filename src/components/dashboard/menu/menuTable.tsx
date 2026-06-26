"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Inbox, SearchX, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import { MenuServices } from "@/services/menuServices";
import { CategoryServices } from "@/services/categoryServices";

const PAGE_SIZE = 20;

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

const STATUS_BADGE: Record<string, string> = {
  available: "bg-green-100 text-green-600",
  not_available: "bg-red-100 text-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  not_available: "Not Available",
};

// Cycles through colors for dynamically named categories
const CATEGORY_COLORS = [
  "bg-yellow-100 text-yellow-600",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
  "bg-cyan-100 text-cyan-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  "bg-teal-100 text-teal-600",
];

export default function MenuTable({ onEdit, refreshTrigger, searchQuery = "" }: any) {
  const [dataList, setDataList] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);

  // Map of category id → { name, color }
  const [categoryMap, setCategoryMap] = useState<Record<number, { name: string; color: string }>>({});

  // Fetch categories once to resolve FK ids → names
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await CategoryServices.getDetails();
        const list: any[] = Array.isArray(res) ? res : res?.results || [];
        const map: Record<number, { name: string; color: string }> = {};
        list.forEach((c, idx) => {
          map[c.id] = {
            name: c.name,
            color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
          };
        });
        setCategoryMap(map);
      } catch {
        // non-critical — table still works without category labels
      }
    };
    loadCategories();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await MenuServices.getDetails();
      setDataList(Array.isArray(res) ? res : res?.results || []);
    } catch {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [refreshTrigger]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredData(dataList.filter((i) => i.name?.toLowerCase().includes(q)));
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, dataList]);

  const paginated = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const handleSelectAll = () =>
    selectedIds.length === paginated.length
      ? setSelectedIds([])
      : setSelectedIds(paginated.map((i) => i.id));

  const handleSelectOne = (id: any) =>
    setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleConfirmDelete = async () => {
    const ids = selectedIds.length > 0 ? selectedIds : deleteId ? [deleteId] : [];
    if (!ids.length) return;
    try {
      setDeleteLoading(true);
      await Promise.all(ids.map((id) => MenuServices.deleteDetails(id)));
      toast.success(`${ids.length} item(s) deleted`);
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
    doc.text("Menu Items", 14, 15);
    autoTable(doc, {
      head: [["S.N.", "Name", "Category", "Portions", "Status", "Created"]],
      body: paginated.map((item, i) => [
        (currentPage - 1) * PAGE_SIZE + i + 1,
        item.name,
        categoryMap[item.category]?.name || "—",
        item.portions?.map((p: any) => `${p.portion_name}: $${p.price}`).join(", ") || "—",
        STATUS_LABEL[item.status] || item.status,
        new Date(item.created_at).toLocaleDateString(),
      ]),
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [54, 74, 99] },
    });
    doc.save("MenuItems.pdf");
    toast.success("PDF Downloaded");
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[400] scrollbar-hide relative">
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
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Image</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Name</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Category</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Portions & Prices</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Status</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Created</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableLoadingSkeleton rows={5} cols={9} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      {searchQuery
                        ? <SearchX size={32} className="text-rose-300" />
                        : <Inbox size={32} className="text-gray-200" />}
                      <span className="text-sm font-bold text-[#364a63]">
                        {searchQuery ? "No results." : "No menu items yet."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                const cat = categoryMap[item.category];
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                    <td className="px-4 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(item.id)}
                        className="rounded border-gray-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-1.5 text-[10px] text-[#526484]">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}.
                    </td>
                    {/* Image */}
                    <td className="px-4 py-1.5">
                      <div className="w-9 h-9 rounded border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-300 text-[10px]">—</span>
                        )}
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-1.5">
                      <span className="text-[11px] font-bold text-[#364a63]">{item.name}</span>
                    </td>
                    {/* Category — resolved from categoryMap */}
                    <td className="px-4 py-1.5">
                      {cat ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.color}`}>
                          {cat.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </td>
                    {/* Portions */}
                    <td className="px-4 py-1.5 max-w-[180px]">
                      {item.portions?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.portions.map((p: any, i: number) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-[#526484] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                              {p.portion_name}: ${p.price}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[item.status] || "bg-gray-100 text-gray-500"}`}>
                        {STATUS_LABEL[item.status] || item.status}
                      </span>
                    </td>
                    {/* Created */}
                    <td className="px-4 py-1.5">
                      <span className="text-[10px] text-[#8094ae]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-1.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded active:scale-90 transition-all"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => { setSelectedIds([]); setDeleteId(item.id); setIsModalOpen(true); }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-90 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="flex items-center justify-between px-6 py-1.5 border-t border-gray-300 bg-[#f5f6fa]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#8094ae]">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredData.length)} of {filteredData.length}
              </span>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded text-[11px] font-bold hover:bg-red-600 active:scale-95"
          >
            <Trash2 size={12} /> Delete Selected
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        title="Delete Menu Item?"
        message={selectedIds.length > 0 ? `Delete ${selectedIds.length} item(s)?` : "Delete this menu item?"}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsModalOpen(false); setDeleteId(null); }}
        loading={deleteLoading}
      />
    </div>
  );
}