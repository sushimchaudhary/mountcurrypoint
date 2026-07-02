"use client";
import React, { useState, useEffect } from "react";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  SearchX,
  Mail,
  Phone,
  Download,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ContactServices } from "@/services/contactServices";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import MessagePreviewModal from "@/components/MessagePreviewModal";

const PAGE_SIZE = 20;

export default function ContactTable({
  refreshTrigger,
  searchQuery = "",
}: any) {
  const [dataList, setDataList] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);

  // ── Preview state ──
  const [previewMessage, setPreviewMessage] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ContactServices.getList();
      setDataList(Array.isArray(res) ? res : res?.results || []);
    } catch {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredData(
      dataList.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.email?.toLowerCase().includes(q) ||
          i.subject?.toLowerCase().includes(q),
      ),
    );
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, dataList]);

  const paginated = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const handleSelectAll = () =>
    selectedIds.length === paginated.length
      ? setSelectedIds([])
      : setSelectedIds(paginated.map((i) => i.id));

  const handleSelectOne = (id: any) =>
    setSelectedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const handleConfirmDelete = async () => {
    const ids =
      selectedIds.length > 0 ? selectedIds : deleteId ? [deleteId] : [];
    if (!ids.length) return;
    try {
      setDeleteLoading(true);
      await Promise.all(ids.map((id) => ContactServices.delete(id)));
      toast.success(`${ids.length} message(s) deleted`);
      setDataList((p) => p.filter((i) => !ids.includes(i.id)));
      setIsModalOpen(false);
      setSelectedIds([]);
      // Close preview if deleted message was open
      if (previewMessage && ids.includes(previewMessage.id)) {
        setPreviewMessage(null);
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Contact Messages", 14, 15);
    autoTable(doc, {
      head: [["S.N.", "Name", "Email", "Subject", "Phone", "Date"]],
      body: paginated.map((item, i) => [
        (currentPage - 1) * PAGE_SIZE + i + 1,
        item.name,
        item.email,
        item.subject,
        item.phone_number || "N/A",
        item.created_at
          ? format(new Date(item.created_at), "dd MMM yyyy")
          : "N/A",
      ]),
      startY: 25,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [54, 74, 99] },
    });
    doc.save("Contacts.pdf");
    toast.success("PDF Downloaded");
  };

  return (
    <>
      <div className="space-y-3">
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[420px] scrollbar-hide relative">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="sticky top-0 z-30 shadow-sm">
                <tr className="bg-[#f5f6fa]">
                  <th className="px-4 py-1.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === paginated.length &&
                        paginated.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                    S.N.
                  </th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                    Sender
                  </th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                    Subject
                  </th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                    Message
                  </th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                    Date
                  </th>
                  <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase text-right w-24">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableLoadingSkeleton rows={5} cols={8} />
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        {searchQuery ? (
                          <SearchX size={32} className="text-rose-300" />
                        ) : (
                          <Inbox size={32} className="text-gray-200" />
                        )}
                        <span className="text-sm font-bold text-[#364a63]">
                          {searchQuery ? "No results." : "No contact messages."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((item, index) => {
                    const isSelected = selectedIds.includes(item.id);
                    const isPreviewOpen = previewMessage?.id === item.id;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-blue-50/40" : ""
                        } ${isPreviewOpen ? "bg-indigo-50/30" : ""}`}
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
                        <td className="px-4 py-2 text-[12px] text-[#526484]">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}.
                        </td>

                        {/* Sender */}
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-[#364a63]">
                              {item.name}
                            </span>
                            <span className="text-[12px] text-[#8094ae] flex items-center gap-1">
                              <Mail size={9} /> {item.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-[12px] text-[#8094ae] flex items-center gap-1">
                            <Phone size={9} /> {item.phone_number || "N/A"}
                          </span>
                        </td>

                        {/* Subject */}
                        <td className="px-4 py-2">
                          <span className="text-[11px] font-semibold text-[#364a63]">
                            {item.subject}
                          </span>
                        </td>

                        {/* Message preview + View button */}
                        <td className="px-4 py-2 max-w-[200px]">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() =>
                                setPreviewMessage(isPreviewOpen ? null : item)
                              }
                              className={`flex items-center gap-1 text-[12px] font-semibold w-fit px-2 py-0.5 cursor-pointer rounded transition-colors ${
                                isPreviewOpen
                                  ? "bg-indigo-100 text-indigo-600"
                                  : "text-indigo-500 hover:bg-indigo-50"
                              }`}
                            >
                              <Eye size={10} />
                              {isPreviewOpen ? "Viewing" : "View"}
                            </button>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-2 text-[12px] text-[#526484] whitespace-nowrap">
                          {item.created_at
                            ? format(new Date(item.created_at), "dd MMM yyyy")
                            : "N/A"}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-2 text-right">
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
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
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
                  className="flex items-center gap-1 px-2 py-1 text-[12px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
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
          title="Delete Message?"
          message={
            selectedIds.length > 0
              ? `Delete ${selectedIds.length} messages?`
              : "Delete this contact message?"
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsModalOpen(false);
            setDeleteId(null);
          }}
          loading={deleteLoading}
        />
      </div>

      {/* ── Message preview modal ── */}
      <MessagePreviewModal
        message={previewMessage}
        onClose={() => setPreviewMessage(null)}
      />
    </>
  );
}
