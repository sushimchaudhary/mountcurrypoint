"use client";
import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { PageHeader } from "@/components/dashboard/PageHeader";
import ProjectTable from "@/components/dashboard/project/projectTable";
import { ProjectForm } from "@/components/dashboard/project/projectForm";


export default function ProjectsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editData, setEditData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleClose = () => { setIsOpen(false); setEditData(null); };
  const handleEdit = (data: any) => { setEditData(data); setIsOpen(true); };
  const handleSuccess = () => setRefreshTrigger((p) => p + 1);

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader title="Projects / Services" description="Manage projects and services displayed on the public website." />
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <ThemedInput type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search size={15} />} className="h-7" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-20"><X size={14} /></button>}
          </div>
          <ThemedButton onClick={() => setIsOpen(true)} size="sm" className="px-5 py-1.5">Add Project</ThemedButton>
        </div>
      </div>
      <ProjectTable onEdit={handleEdit} refreshTrigger={refreshTrigger} searchQuery={searchQuery} />
      <ProjectForm isOpen={isOpen} initialData={editData} onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
}