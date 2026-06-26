"use client";

import React, { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  SearchX,
  Mail,
  Phone,
  Globe,
  MapPin,
  
  PhoneCall,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Avatar from "antd/es/avatar/Avatar";
import { Building2 } from "lucide-react";
import { OrganizationServices } from "@/services/organizationServices";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";
import { FaFacebook } from "react-icons/fa";
import { BsInstagram, BsTwitter } from "react-icons/bs";
import { LiaLinkedin } from "react-icons/lia";

const PAGE_SIZE = 20;

export default function OrganizationTable({
  onEdit,
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await OrganizationServices.getDetails();
      const list = Array.isArray(res) ? res : res?.results || res?.data || [];
      setDataList([...list].reverse());
    } catch {
      toast.error("Failed to load organizations");
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
          i.title?.toLowerCase().includes(q) ||
          i.email1?.toLowerCase().includes(q) ||
          i.email2?.toLowerCase().includes(q) ||
          i.address?.toLowerCase().includes(q) ||
          i.contactNo?.toLowerCase().includes(q),
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
      await Promise.all(
        ids.map((id) => OrganizationServices.deleteDetails(id)),
      );
      toast.success(`${ids.length} record(s) deleted`);
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
    doc.text("Organization List", 14, 15);
    autoTable(doc, {
      head: [
        [
          "S.N.",
          "Title",
          "Email 1",
          "Email 2",
          "Contact",
          "Telephone",
          "Website",
          "Address",
        ],
      ],
      body: paginated.map((item, i) => [
        (currentPage - 1) * PAGE_SIZE + i + 1,
        item.title,
        item.email1 || "N/A",
        item.email2 || "N/A",
        item.contactNo || "N/A",
        item.telephone_number || "N/A",
        item.website || "N/A",
        item.address || "N/A",
      ]),
      startY: 25,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [54, 74, 99] },
    });
    doc.save("Organizations.pdf");
    toast.success("PDF Downloaded");
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`
        <html><head><title>Organizations</title>
        <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #e2e8f0;padding:8px;font-size:10px}th{background:#f8fafc}</style>
        </head><body><h2>Organization List</h2>
        <table><thead><tr>
          <th>S.N.</th><th>Title</th><th>Email 1</th><th>Email 2</th>
          <th>Contact</th><th>Telephone</th><th>Website</th><th>Address</th>
        </tr></thead><tbody>
        ${paginated
          .map(
            (item, i) => `<tr>
          <td>${(currentPage - 1) * PAGE_SIZE + i + 1}</td>
          <td>${item.title}</td>
          <td>${item.email1 || "N/A"}</td>
          <td>${item.email2 || "N/A"}</td>
          <td>${item.contactNo || "N/A"}</td>
          <td>${item.telephone_number || "N/A"}</td>
          <td>${item.website || "N/A"}</td>
          <td>${item.address || "N/A"}</td>
        </tr>`,
          )
          .join("")}
        </tbody></table></body></html>
      `);
      w.document.close();
      w.print();
    }
  };

  const SocialIcon = ({
    url,
    icon: Icon,
    label,
  }: {
    url?: string;
    icon: any;
    label: string;
  }) =>
    url ? (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={label}
        className="p-1 text-[#8094ae] hover:text-[#364a63] hover:bg-gray-100 rounded transition-colors"
      >
        <Icon size={11} />
      </a>
    ) : null;

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
                    className="rounded border-gray-300 cursor-pointer"
                    checked={
                      selectedIds.length === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                  S.N.
                </th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                  Organization
                </th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                  Desc
                </th>

                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                  Contact
                </th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                  Website
                </th>
                <th className="px-4 py-1.5 text-[11px] font-bold text-[#8094ae] uppercase">
                  Socials
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
                        {searchQuery
                          ? "No results found."
                          : "No organizations yet."}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  console.log("Logo URL:", item.logo_url || item.logo);
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="px-4 py-1.5 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 cursor-pointer"
                          checked={isSelected}
                          onChange={() => handleSelectOne(item.id)}
                        />
                      </td>

                      <td className="px-4 py-1.5 text-[10px] text-[#526484]">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}.
                      </td>

                      {/* Organization */}
                      <td className="px-4 py-1.5 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <Avatar
                           src={item.logo_url || item.logo}
                           icon={<Building2 size={14} />}
                            size={32}
                            shape="square"
                            className="border border-gray-100 shadow-sm bg-gray-50 text-blue-600 shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-[11px] text-[#364a63] font-bold uppercase">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-[#8094ae] flex items-center gap-1">
                              <MapPin size={9} /> {item.address || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex flex-col">
                          {item.description && (
                            <span
                              className="text-[10px] text-[#8094ae] italic truncate max-w-[140px]"
                              title={item.description}
                            >
                              {item.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-1.5 min-w-[160px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-[#526484] flex items-center gap-1">
                            <Mail size={9} /> {item.email1 || "N/A"}
                          </span>
                          {item.email2 && (
                            <span className="text-[10px] text-[#8094ae] flex items-center gap-1">
                              <Mail size={9} /> {item.email2}
                            </span>
                          )}
                          <span className="text-[10px] text-[#8094ae] flex items-center gap-1">
                            <Phone size={9} /> {item.contactNo || "N/A"},
                            {item.telephone_number && (
                            <span className="text-[10px] text-[#8094ae] flex items-center gap-1">
                              <PhoneCall size={9} /> {item.telephone_number}
                            </span>
                          )}
                          </span>
                          
                        </div>
                      </td>

                      {/* Website */}
                      <td className="px-4 py-1.5 min-w-[120px]">
                        {item.website ? (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-500 hover:underline flex items-center gap-1"
                          >
                            <Globe size={9} />
                            <span className="truncate max-w-[100px]">
                              {item.website}
                            </span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-400">N/A</span>
                        )}
                      </td>

                      {/* Socials */}
                      <td className="px-4 py-1.5">
                        <div className="flex items-center gap-0.5">
                          <SocialIcon
                            url={item.facebook_url}
                            icon={FaFacebook}
                            label="Facebook"
                          />
                          <SocialIcon
                            url={item.twitter_url}
                            icon={BsTwitter}
                            label="Twitter"
                          />
                          <SocialIcon
                            url={item.instagram_url}
                            icon={BsInstagram}
                            label="Instagram"
                          />
                          <SocialIcon
                            url={item.linkdin_url}
                            icon={LiaLinkedin}
                            label="LinkedIn"
                          />
                          {!item.facebook_url &&
                            !item.twitter_url &&
                            !item.instagram_url &&
                            !item.linkdin_url && (
                              <span className="text-[11px] text-gray-400">
                                N/A
                              </span>
                            )}
                        </div>
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
                {Math.min(currentPage * PAGE_SIZE, filteredData.length)} of{" "}
                {filteredData.length}
              </span>
              {/* <button
                onClick={downloadPDF}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 active:scale-95"
              >
                <Download size={12} /> PDF
              </button> */}
              {/* <ThemedButton onClick={handlePrint} size="sm">
                <Printer size={12} /> Print
              </ThemedButton> */}
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
        title={
          selectedIds.length > 0
            ? "Delete Selected Organizations?"
            : "Remove Organization?"
        }
        message={
          selectedIds.length > 0
            ? `Are you sure you want to delete ${selectedIds.length} organizations? This will remove all associated data.`
            : "Are you sure you want to delete this organization? This action cannot be undone."
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsModalOpen(false);
          setDeleteId(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
}
