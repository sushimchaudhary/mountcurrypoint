"use client";
import React, { useState, useEffect } from "react";
import {
  Pencil, Trash2, ChevronLeft, ChevronRight,
  Inbox, SearchX, Download, QrCode, Eye, X,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import { TableServices } from "@/services/tableServices";

const PAGE_SIZE = 20;

// ── QR Preview Modal ────────────────────────────────────────────────────────
function QrModal({ table, onClose }: { table: any; onClose: () => void }) {
  if (!table) return null;

  const handleDownload = async () => {
    try {
      const res  = await fetch(table.qr_code);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `Table_${table.table_number}_QR.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("QR code downloaded");
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm"
      />
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-72 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#f5f6fa]">
            <div className="flex items-center gap-2">
              <QrCode size={14} className="text-[#526484]" />
              <span className="text-[12px] font-bold text-[#364a63]">
                Table {table.table_number}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 hover:rotate-90 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* QR image */}
          <div className="flex items-center justify-center p-6 bg-white">
            <img
              src={table.qr_code}
              alt={`QR for Table ${table.table_number}`}
              className="w-48 h-48 object-contain border border-gray-100 rounded"
            />
          </div>

          {/* Info */}
          <div className="px-4 pb-2 text-center">
            <p className="text-[10px] text-[#8094ae]">
              Scan to open the menu for this table
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-1.5 text-[11px] font-bold text-[#526484] border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-[#364a63] rounded hover:bg-[#2c3e52] transition-colors active:scale-95"
            >
              <Download size={11} /> Download
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Table ──────────────────────────────────────────────────────────────
export default function RestaurantTableTable({ onEdit, refreshTrigger, searchQuery = "" }: any) {
  const [dataList, setDataList]           = useState<any[]>([]);
  const [filteredData, setFilteredData]   = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [currentPage, setCurrentPage]     = useState(1);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [selectedIds, setSelectedIds]     = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId]           = useState<any>(null);
  const [qrTable, setQrTable]             = useState<any>(null); // for QR preview

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await TableServices.getDetails();
      setDataList(Array.isArray(res) ? res : res?.results || []);
    } catch {
      toast.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [refreshTrigger]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredData(dataList.filter((i) => i.table_number?.toLowerCase().includes(q)));
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

  const handleConfirmDelete = async () => {
    const ids = selectedIds.length > 0 ? selectedIds : deleteId ? [deleteId] : [];
    if (!ids.length) return;
    try {
      setDeleteLoading(true);
      await Promise.all(ids.map((id) => TableServices.deleteDetails(id)));
      toast.success(`${ids.length} table(s) deleted`);
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
    doc.text("Restaurant Tables", 14, 15);
    autoTable(doc, {
      head: [["S.N.", "Table Number", "QR Code URL"]],
      body: paginated.map((item, i) => [
        (currentPage - 1) * PAGE_SIZE + i + 1,
        `Table ${item.table_number}`,
        item.qr_code || "—",
      ]),
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [54, 74, 99] },
    });
    doc.save("Tables.pdf");
    toast.success("PDF Downloaded");
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[420px] scrollbar-hide relative">
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
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Table Number</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">QR Code</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase text-right w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableLoadingSkeleton rows={5} cols={5} />
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      {searchQuery
                        ? <SearchX size={32} className="text-rose-300" />
                        : <Inbox size={32} className="text-gray-200" />}
                      <span className="text-sm font-bold text-[#364a63]">
                        {searchQuery ? "No results." : "No tables yet."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(item.id)}
                          className="rounded border-gray-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-2 text-[10px] text-[#526484]">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}.
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-[11px] font-bold text-[#364a63]">
                          Table {item.table_number}
                        </span>
                      </td>

                      {/* QR Code thumbnail + actions */}
                      <td className="px-4 py-2">
                        {item.qr_code ? (
                          <div className="flex items-center gap-2">
                            {/* Thumbnail */}
                            <div className="w-9 h-9 rounded border border-gray-100 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center">
                              <img
                                src={item.qr_code}
                                alt={`QR Table ${item.table_number}`}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            {/* View button */}
                            <button
                              onClick={() => setQrTable(item)}
                              className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
                            >
                              <Eye size={11} /> View
                            </button>
                            {/* Download button */}
                            <a
                              href={item.qr_code}
                              download={`Table_${item.table_number}_QR.png`}
                              onClick={async (e) => {
                                // Force download via blob (avoids browser opening the image)
                                e.preventDefault();
                                try {
                                  const res  = await fetch(item.qr_code);
                                  const blob = await res.blob();
                                  const url  = URL.createObjectURL(blob);
                                  const a    = document.createElement("a");
                                  a.href     = url;
                                  a.download = `Table_${item.table_number}_QR.png`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                  toast.success("QR downloaded");
                                } catch {
                                  toast.error("Download failed");
                                }
                              }}
                              className="flex items-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-700 px-1.5 py-0.5 rounded hover:bg-green-50 transition-colors"
                            >
                              <Download size={11} /> Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300">No QR</span>
                        )}
                      </td>

                      {/* Edit / Delete */}
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded active:scale-90 transition-all"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIds([]);
                              setDeleteId(item.id);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-90 transition-all"
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
              <span className="text-[11px] font-bold px-2">{currentPage} / {totalPages}</span>
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
        title="Delete Table?"
        message={
          selectedIds.length > 0
            ? `Delete ${selectedIds.length} tables?`
            : "Delete this table? Any linked orders may be affected."
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsModalOpen(false); setDeleteId(null); }}
        loading={deleteLoading}
      />

      {/* QR Preview Modal */}
      {qrTable && <QrModal table={qrTable} onClose={() => setQrTable(null)} />}
    </div>
  );
}