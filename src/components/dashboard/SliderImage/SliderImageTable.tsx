"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Inbox, Image, Download, LucideImage } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SliderServices } from "@/services/sliderServices";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import { Image as AntImage } from "antd";

const PAGE_SIZE = 20;
export default function SliderTable({ onEdit, refreshTrigger }: any) {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);

  const fetchData = async () => {
    try { setLoading(true); const res = await SliderServices.getDetails(); setDataList(Array.isArray(res) ? res : res?.results || []); }
    catch { toast.error("Failed to load sliders"); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [refreshTrigger]);

  const paginated = dataList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(dataList.length / PAGE_SIZE);
  const handleSelectAll = () => selectedIds.length === paginated.length ? setSelectedIds([]) : setSelectedIds(paginated.map((i) => i.id));
  const handleSelectOne = (id: any) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleConfirmDelete = async () => {
    const ids = selectedIds.length > 0 ? selectedIds : deleteId ? [deleteId] : [];
    if (!ids.length) return;
    try {
      setDeleteLoading(true);
      await Promise.all(ids.map((id) => SliderServices.deleteDetails(id)));
      toast.success(`${ids.length} slider(s) deleted`);
      setDataList((p) => p.filter((i) => !ids.includes(i.id)));
      setIsModalOpen(false); setSelectedIds([]);
    } catch { toast.error("Delete failed"); } finally { setDeleteLoading(false); setDeleteId(null); }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[400] scrollbar-hide relative">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-30 shadow-sm">
              <tr className="bg-[#f5f6fa]">
                <th className="px-4 py-1.5 w-10 text-center"><input type="checkbox" checked={selectedIds.length === paginated.length && paginated.length > 0} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">S.N.</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Slider Image</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <TableLoadingSkeleton rows={3} cols={4} /> : paginated.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16"><div className="flex flex-col items-center gap-2"><Image size={32} className="text-gray-200" /><span className="text-sm font-bold text-[#364a63]">No slider images yet.</span></div></td></tr>
              ) : paginated.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                    <td className="px-4 py-1.5 text-center"><input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                    <td className="px-4 py-1.5 text-[10px] text-[#526484]">{(currentPage - 1) * PAGE_SIZE + index + 1}.</td>
                    <td className="px-4 py-1.5">
                      <div className="w-32 h-16 rounded border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center custom-antd-image">
                        {item.image ? (
                          <AntImage
                            src={item.image}
                            alt={`Slider ${item.id}`}
                            className="w-full h-full object-cover"
                            
                            placeholder={
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse" />
                            }
                          />
                        ) : (
                          <LucideImage size={16} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-1.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => onEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded active:scale-90 transition-all"><Pencil size={12} /></button>
                        <button onClick={() => { setSelectedIds([]); setDeleteId(item.id); setIsModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-90 transition-all"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && dataList.length > 0 && (
          <div className="flex items-center justify-between px-6 py-1.5 border-t border-gray-300 bg-[#f5f6fa]">
            <span className="text-[11px] text-[#8094ae]">{dataList.length}   sliders </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1 disabled:opacity-30"><ChevronLeft size={14} /></button>
              <span className="text-[11px] font-bold px-2">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-1 disabled:opacity-30"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
          <span className="text-xs font-bold text-red-600 uppercase">{selectedIds.length} Selected</span>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded text-[11px] font-bold hover:bg-red-600 active:scale-95"><Trash2 size={12} /> Delete Selected</button>
        </div>
      )}
      <ConfirmModal isOpen={isModalOpen} title="Delete Slider?" message={selectedIds.length > 0 ? `Delete ${selectedIds.length} sliders?` : "Delete this slider?"} onConfirm={handleConfirmDelete} onCancel={() => { setIsModalOpen(false); setDeleteId(null); }} loading={deleteLoading} />
    </div>
  );
}