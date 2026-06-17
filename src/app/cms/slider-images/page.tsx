"use client";
import React, { useState } from "react";
import { ThemedButton } from "@/components/ui/themedButton";
import { PageHeader } from "@/components/dashboard/PageHeader";
import SliderTable from "@/components/dashboard/SliderImage/SliderImageTable";
import { SliderForm } from "@/components/dashboard/SliderImage/SliderImageForm";

export default function SliderPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleClose = () => { setIsOpen(false); setEditData(null); };
  const handleEdit = (data: any) => { setEditData(data); setIsOpen(true); };
  const handleSuccess = () => setRefreshTrigger((p) => p + 1);

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader title="Slider Images" description="Manage homepage slider images (max 3)." />
        <ThemedButton onClick={() => setIsOpen(true)} size="sm" className="px-5 py-1.5">Add Slider</ThemedButton>
      </div>
      <SliderTable onEdit={handleEdit} refreshTrigger={refreshTrigger} />
      <SliderForm isOpen={isOpen} initialData={editData} onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
}