"use client";
import React, { useState, useEffect } from "react";
import {
  Pencil, Trash2, ChevronLeft, ChevronRight,
  Inbox, SearchX, Download, LucideImage, Eye, X,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import { StrategyServices } from "@/services/strategyServices";
import { Image as AntImage } from "antd";

const PAGE_SIZE = 20;

// ── Strip HTML tags → plain text for table preview ────────────────────────────
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ── Full HTML preview modal ───────────────────────────────────────────────────
function StrategyPreviewModal({
  item,
  onClose,
}: {
  item: any | null;
  onClose: () => void;
}) {
  if (!item) return null;

  const FIELDS = [
    { key: "mission_statement", label: "Mission Statement" },
    { key: "objective",         label: "Objective"         },
    { key: "management",        label: "Management"        },
    { key: "goals",             label: "Goals"             },
  ];

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <p className="text-sm font-bold text-[#364a63]">
                Strategy Detail
              </p>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Cover image */}
            {(item.image_url || item.image) && (
              <div className="w-full h-44 shrink-0 overflow-hidden">
                <img
                  src={item.image_url || item.image}
                  alt="Strategy cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
              {FIELDS.map(({ key, label }) =>
                item[key] ? (
                  <div key={key}>
                    <p className="text-[10px] font-bold text-[#8094ae] uppercase tracking-widest mb-2">
                      {label}
                    </p>
                    {/* Render raw CKEditor HTML */}
                    <div
                      className="prose prose-sm max-w-none text-[#526484] leading-relaxed
                        [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                        [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold
                        [&_strong]:text-[#364a63] [&_a]:text-indigo-600 [&_a]:underline
                        [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-200
                        [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-gray-200 [&_th]:px-2 [&_th]:py-1"
                      dangerouslySetInnerHTML={{ __html: item[key] }}
                    />
                  </div>
                ) : null
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 shrink-0 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-[11px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────
export default function CompanyStrategyTable({
  onEdit,
  refreshTrigger,
  searchQuery = "",
}: any) {
  const [dataList,     setDataList]     = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [selectedIds,  setSelectedIds]  = useState<any[]>([]);
  const [deleteLoading,setDeleteLoading]= useState(false);
  const [deleteId,     setDeleteId]     = useState<any>(null);
  const [previewItem,  setPreviewItem]  = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await StrategyServices.getDetails();
      setDataList(Array.isArray(res) ? res : res?.results || []);
    } catch {
      toast.error("Failed to load strategies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [refreshTrigger]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredData(
      dataList.filter(
        (i) =>
          stripHtml(i.mission_statement).toLowerCase().includes(q) ||
          stripHtml(i.objective).toLowerCase().includes(q)
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
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const handleConfirmDelete = async () => {
    const ids = selectedIds.length > 0 ? selectedIds : deleteId ? [deleteId] : [];
    if (!ids.length) return;
    try {
      setDeleteLoading(true);
      await Promise.all(ids.map((id) => StrategyServices.deleteDetails(id)));
      toast.success(`${ids.length} strategy(s) deleted`);
      setDataList((p) => p.filter((i) => !ids.includes(i.id)));
      if (previewItem && ids.includes(previewItem.id)) setPreviewItem(null);
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
    doc.text("Company Strategy", 14, 15);
    autoTable(doc, {
      head: [["S.N.", "Mission", "Objective"]],
      body: paginated.map((item, i) => [
        (currentPage - 1) * PAGE_SIZE + i + 1,
        stripHtml(item.mission_statement).slice(0, 80),
        stripHtml(item.objective).slice(0, 80),
      ]),
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [54, 74, 99] },
    });
    doc.save("CompanyStrategy.pdf");
    toast.success("PDF Downloaded");
  };

  return (
    <>
      <div className="space-y-3">
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[400px] scrollbar-hide relative">
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
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Mission</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Management</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Objective</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Goals</th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase text-right w-28">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableLoadingSkeleton rows={5} cols={8} />
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        {searchQuery
                          ? <SearchX size={32} className="text-rose-300" />
                          : <Inbox size={32} className="text-gray-200" />}
                        <span className="text-sm font-bold text-[#364a63]">
                          {searchQuery ? "No results." : "No strategies yet."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((item, index) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isPreviewing = previewItem?.id === item.id;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-blue-50/40" : ""
                        } ${isPreviewing ? "bg-indigo-50/20" : ""}`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(item.id)}
                            className="rounded border-gray-300 cursor-pointer"
                          />
                        </td>

                        {/* S.N. */}
                        <td className="px-4 py-2 text-[10px] text-[#526484]">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}.
                        </td>

                        {/* Image */}
                        <td className="px-4 py-2">
                          <div className="w-14 h-10 rounded border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                            {item.image_url || item.image ? (
                              <AntImage
                                src={item.image_url || item.image}
                                alt="Strategy"
                                className="w-full h-full object-cover"
                                wrapperStyle={{ width: "100%", height: "100%" }}
                                placeholder={
                                  <div className="w-full h-full bg-gray-100 animate-pulse" />
                                }
                              />
                            ) : (
                              <LucideImage size={16} className="text-gray-300" />
                            )}
                          </div>
                        </td>

                        {/* Mission — stripped plain text */}
                        <td className="px-4 py-2 max-w-[160px]">
                          <p className="text-[10px] text-[#8094ae] line-clamp-2">
                            {stripHtml(item.mission_statement) || "—"}
                          </p>
                        </td>

                        {/* Management — stripped */}
                        <td className="px-4 py-2 max-w-[160px]">
                          <p className="text-[10px] text-[#8094ae] line-clamp-2">
                            {stripHtml(item.management) || "—"}
                          </p>
                        </td>

                        {/* Objective — stripped */}
                        <td className="px-4 py-2 max-w-[160px]">
                          <p className="text-[10px] text-[#8094ae] line-clamp-2">
                            {stripHtml(item.objective) || "—"}
                          </p>
                        </td>

                        {/* Goals — stripped */}
                        <td className="px-4 py-2 max-w-[160px]">
                          <p className="text-[10px] text-[#8094ae] line-clamp-2">
                            {stripHtml(item.goals) || "—"}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            {/* Preview */}
                            <button
                              onClick={() =>
                                setPreviewItem(isPreviewing ? null : item)
                              }
                              className={`p-1.5 rounded active:scale-90 transition-all ${
                                isPreviewing
                                  ? "text-indigo-600 bg-indigo-50"
                                  : "text-indigo-400 hover:bg-indigo-50"
                              }`}
                              title="Preview"
                            >
                              <Eye size={12} />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => onEdit(item)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded active:scale-90 transition-all"
                              title="Edit"
                            >
                              <Pencil size={12} />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => {
                                setSelectedIds([]);
                                setDeleteId(item.id);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-90 transition-all"
                              title="Delete"
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

          {/* Footer */}
          {!loading && filteredData.length > 0 && (
            <div className="flex items-center justify-between px-6 py-1.5 border-t border-gray-300 bg-[#f5f6fa]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8094ae]">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of{" "}
                  {filteredData.length}
                </span>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Download size={12} /> PDF
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[11px] font-bold px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk delete bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
            <span className="text-xs font-bold text-red-600 uppercase">
              {selectedIds.length} Selected
            </span>
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
          title="Delete Strategy?"
          message={
            selectedIds.length > 0
              ? `Delete ${selectedIds.length} strategies?`
              : "Delete this strategy?"
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => { setIsModalOpen(false); setDeleteId(null); }}
          loading={deleteLoading}
        />
      </div>

      {/* Full HTML preview modal */}
      <StrategyPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </>
  );
}