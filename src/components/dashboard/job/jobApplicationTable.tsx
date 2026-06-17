"use client";
import React, { useState, useEffect } from "react";
import { Trash2, ChevronLeft, ChevronRight, Inbox, SearchX, User, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import { JobApplicationServices } from "@/services/jobServices";

const PAGE_SIZE = 20;
export default function JobApplicationTable({ jobId, jobName, refreshTrigger, searchQuery = "" }: any) {
  const [dataList, setDataList] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);

  const fetchData = async () => {
    try { setLoading(true); const res = await JobApplicationServices.getDetails(jobId); setDataList(Array.isArray(res) ? res : res?.results || []); }
    catch { toast.error("Failed to load applications"); } finally { setLoading(false); }
  };
  useEffect(() => { if (jobId) fetchData(); }, [jobId, refreshTrigger]);
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredData(dataList.filter((i) => i.name?.toLowerCase().includes(q) || i.email?.toLowerCase().includes(q)));
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
      await Promise.all(ids.map((id) => JobApplicationServices.deleteDetails(id)));
      toast.success(`${ids.length} application(s) deleted`);
      setDataList((p) => p.filter((i) => !ids.includes(i.id)));
      setIsModalOpen(false); setSelectedIds([]);
    } catch { toast.error("Delete failed"); } finally { setDeleteLoading(false); setDeleteId(null); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Applications – ${jobName}`, 14, 15);
    autoTable(doc, { head: [["S.N.", "Name", "Email", "Contact", "Address"]], body: paginated.map((item, i) => [(currentPage - 1) * PAGE_SIZE + i + 1, item.name, item.email, item.contact, item.address]), startY: 25, styles: { fontSize: 8 }, headStyles: { fillColor: [54, 74, 99] } });
    doc.save("Applications.pdf"); toast.success("PDF Downloaded");
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[400] scrollbar-hide relative">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="sticky top-0 z-30 shadow-sm">
              <tr className="bg-[#f5f6fa]">
                <th className="px-4 py-2 w-10 text-center"><input type="checkbox" checked={selectedIds.length === paginated.length && paginated.length > 0} onChange={handleSelectAll} className="rounded border-gray-300 cursor-pointer" /></th>
                <th className="px-4 py-2 text-[11px] font-bold text-[#8094ae] uppercase">S.N.</th>
                <th className="px-4 py-2 text-[11px] font-bold text-[#8094ae] uppercase">Name</th>
                <th className="px-4 py-2 text-[11px] font-bold text-[#8094ae] uppercase">Email</th>
                <th className="px-4 py-2 text-[11px] font-bold text-[#8094ae] uppercase">Contact</th>
                <th className="px-4 py-2 text-[11px] font-bold text-[#8094ae] uppercase">Address</th>
                <th className="px-4 py-2 text-[11px] font-bold text-[#8094ae] uppercase">CV</th>
                <th className="px-4 py-2 text-[11px] font-bold text-[#8094ae] uppercase text-right w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <TableLoadingSkeleton rows={5} cols={8} /> : paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16"><div className="flex flex-col items-center gap-2">{searchQuery ? <SearchX size={32} className="text-rose-300" /> : <Inbox size={32} className="text-gray-200" />}<span className="text-sm font-bold text-[#364a63]">{searchQuery ? "No results." : "No applications yet."}</span></div></td></tr>
              ) : paginated.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                    <td className="px-4 py-2 text-center"><input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(item.id)} className="rounded border-gray-300 cursor-pointer" /></td>
                    <td className="px-4 py-2 text-[10px] text-[#526484]">{(currentPage - 1) * PAGE_SIZE + index + 1}.</td>
                    <td className="px-4 py-2"><span className="text-[11px] font-bold text-[#364a63]">{item.name}</span></td>
                    <td className="px-4 py-2"><span className="text-[10px] text-[#8094ae]">{item.email}</span></td>
                    <td className="px-4 py-2"><span className="text-[10px] text-[#8094ae]">{item.contact}</span></td>
                    <td className="px-4 py-2"><span className="text-[10px] text-[#8094ae]">{item.address}</span></td>
                    <td className="px-4 py-2">
                      {item.cv ? <a href={item.cv} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-blue-500 hover:underline"><ExternalLink size={10} /> View CV</a> : <span className="text-[10px] text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => { setSelectedIds([]); setDeleteId(item.id); setIsModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded active:scale-90 transition-all"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filteredData.length > 0 && (
          <div className="flex items-center justify-between px-6 py-2 border-t bg-[#f5f6fa]">
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
      <ConfirmModal isOpen={isModalOpen} title="Delete Application?" message={selectedIds.length > 0 ? `Delete ${selectedIds.length} applications?` : "Delete this application?"} onConfirm={handleConfirmDelete} onCancel={() => { setIsModalOpen(false); setDeleteId(null); }} loading={deleteLoading} />
    </div>
  );
}