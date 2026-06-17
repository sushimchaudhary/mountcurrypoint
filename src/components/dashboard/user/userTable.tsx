"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Mail, Phone, MapPin, User, Inbox, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "antd"; // antd बाट Avatar
import { UserServices } from "@/services/userServices";
import TableLoadingSkeleton from "../tableLoadingSkeleton";
import ConfirmModal from "@/components/delete/confirmModel";

const PAGE_SIZE = 20;

export default function UserTable({ onEdit, refreshTrigger, searchQuery = "" }: any) {
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await UserServices.getDetails(); // UserServices प्रयोग
      setDataList(Array.isArray(res) ? res : res?.results || []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [refreshTrigger]);

  const filteredData = dataList.filter((i) => 
    i.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async () => {
    try {
      await UserServices.deleteDetails(deleteId);
      toast.success("User deleted successfully");
      setDataList((p) => p.filter((i) => i.id !== deleteId));
      setIsModalOpen(false);
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-[#f5f6fa] text-[11px] font-bold text-[#8094ae] uppercase">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Address</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? <TableLoadingSkeleton rows={5} cols={4} /> : paginated.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 flex items-center gap-3">
                <Avatar src={item.image} icon={<User size={14} />} />
                <div>
                  <p className="text-[11px] font-bold text-gray-800">{item.fullname}</p>
                  <p className="text-[10px] text-gray-500">{item.email}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-600">
                <div className="flex items-center gap-1"><Phone size={10} /> {item.phone_no || "N/A"}</div>
              </td>
              <td className="px-4 py-3 text-[11px] text-gray-600 flex items-center gap-1">
                <MapPin size={10} /> {item.address || "N/A"}
              </td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => onEdit(item)} className="text-blue-500 p-1"><Pencil size={14} /></button>
                <button onClick={() => { setDeleteId(item.id); setIsModalOpen(true); }} className="text-red-500 p-1"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmModal isOpen={isModalOpen} onConfirm={handleDelete} onCancel={() => setIsModalOpen(false)} title="Delete User" message="Are you sure you want to delete this user?" />
    </div>
  );
}