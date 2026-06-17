"use client";
import React, { useState } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { PageHeader } from "@/components/dashboard/PageHeader";
import JobTable from "@/components/dashboard/job/jobTable";
import { JobForm } from "@/components/dashboard/job/jobForm";
import JobApplicationTable from "@/components/dashboard/job/jobApplicationTable";

export default function JobPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editData, setEditData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const handleClose = () => { setIsOpen(false); setEditData(null); };
  const handleEdit = (data: any) => { setEditData(data); setIsOpen(true); };
  const handleSuccess = () => setRefreshTrigger((p) => p + 1);

  if (selectedJob) return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedJob(null)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"><ArrowLeft size={16} /></button>
          <PageHeader title={`Applications – ${selectedJob.name}`} description="All job applications for this position." />
        </div>
        <div className="relative w-72">
          <ThemedInput type="text" placeholder="Search applicants..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search size={15} />} className="h-7" />
          {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-20"><X size={14} /></button>}
        </div>
      </div>
      <JobApplicationTable jobId={selectedJob.id} jobName={selectedJob.name} refreshTrigger={refreshTrigger} searchQuery={searchQuery} />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader title="Job Posts" description="Manage job postings shown on the public website." />
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <ThemedInput type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search size={15} />} className="h-7" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-20"><X size={14} /></button>}
          </div>
          <ThemedButton onClick={() => setIsOpen(true)} size="sm" className="px-5 py-1.5">Add Job</ThemedButton>
        </div>
      </div>
      <JobTable onEdit={handleEdit} onViewApplications={setSelectedJob} refreshTrigger={refreshTrigger} searchQuery={searchQuery} />
      <JobForm isOpen={isOpen} initialData={editData} onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
}