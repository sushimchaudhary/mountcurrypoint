"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, ChevronLeft, ChevronRight, Inbox, SearchX, Briefcase, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { JobServices } from "@/services/jobServices";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";

const PAGE_SIZE = 20;
const STATUS_BADGE: Record<string, string> = { DRAFT: "bg-gray-100 text-gray-500", HIRING: "bg-green-100 text-green-600", HIRED: "bg-blue-100 text-blue-600" };

export default function JobTable({ onEdit, onViewApplications, refreshTrigger, searchQuery = "" }: any) {
  const [dataList, setDataList] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);

  const fetchData = async () => {
    try { setLoading(true); const res = await JobServices.getDetails(); setDataList(Array.isArray(res) ? res : res?.results || []); }
    catch { toast.error("Failed to load jobs"); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [refreshTrigger]);
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredData(dataList.filter((i) => i.name?.toLowerCase().includes(q)));
    setCurrentPage(1); setSelectedIds([]);
  }, [searchQuery, dataList]);

  const paginated = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const handleSelectAll = () => selectedIds.length === paginated.length ? setSelectedIds([]) : setSelectedIds(paginated.map((i) => i.id));
  const handleSelectOne = (id: any) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

const handleConfirmDelete = async () => {
  const ids = selectedIds.length > 0 ? selectedIds : deleteId ? [deleteId] : [];
  
  if (!ids.length) return;
  
  try {
    setDeleteLoading(true);
    
    await Promise.all(ids.map((slug) => JobServices.deleteDetails(slug)));
    
    toast.success(`${ids.length} job(s) deleted`);
    
    setDataList((p) => p.filter((i) => !ids.includes(i.slug))); 
    
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
    doc.text("Job Posts", 14, 15);
    autoTable(doc, { head: [["S.N.", "Title", "Status", "Created"]], body: paginated.map((item, i) => [(currentPage - 1) * PAGE_SIZE + i + 1, item.name, item.status, new Date(item.created_at).toLocaleDateString()]), startY: 25, styles: { fontSize: 8 }, headStyles: { fillColor: [54, 74, 99] } });
    doc.save("JobPosts.pdf"); toast.success("PDF Downloaded");
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
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Title</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Status</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">Created</th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase text-right w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <TableLoadingSkeleton rows={5} cols={6} /> : paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16"><div className="flex flex-col items-center gap-2">{searchQuery ? <SearchX size={32} className="text-rose-300" /> : <Inbox size={32} className="text-gray-200" />}<span className="text-sm font-bold text-[#364a63]">{searchQuery ? "No results." : "No jobs yet."}</span></div></td></tr>
              ) : paginated.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                    <td className="px-4 py-1.5 text-center"><input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(item.slug)} className="rounded border-gray-300 cursor-pointer" /></td>
                    <td className="px-4 py-1.5 text-[10px] text-[#526484]">{(currentPage - 1) * PAGE_SIZE + index + 1}.</td>
                    <td className="px-4 py-1.5"><span className="text-[11px] font-bold text-[#364a63]">{item.name}</span></td>
                    <td className="px-4 py-1.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[item.status] || "bg-gray-100 text-gray-500"}`}>{item.status}</span></td>
                    <td className="px-4 py-1.5"><span className="text-[10px] text-[#8094ae]">{new Date(item.created_at).toLocaleDateString()}</span></td>
                    <td className="px-4 py-1.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => onViewApplications?.(item)} title="View Applications" className="p-1.5 text-purple-500 hover:bg-purple-50 rounded active:scale-90 transition-all"><Eye size={12} /></button>
                        <button onClick={() => onEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded active:scale-90 transition-all"><Pencil size={12} /></button>
                        <button onClick={() => { setSelectedIds([]); setDeleteId(item.slug); setIsModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-90 transition-all"><Trash2 size={12} /></button>
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
              <span className="text-[11px] text-[#8094ae]">Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredData.length)} of {filteredData.length}</span>
              <button onClick={downloadPDF} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"><Download size={12} /> PDF</button>
            </div>
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
      <ConfirmModal isOpen={isModalOpen} title="Delete Job?" message={selectedIds.length > 0 ? `Delete ${selectedIds.length} jobs?` : "Delete this job?"} onConfirm={handleConfirmDelete} onCancel={() => { setIsModalOpen(false); setDeleteId(null); }} loading={deleteLoading} />
    </div>
  );
}