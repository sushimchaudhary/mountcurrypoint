"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { PageHeader } from "@/components/dashboard/PageHeader";
import UserTable from "@/components/dashboard/user/userTable";
import UserRegistrationForm from "@/components/dashboard/user/registerForm";

export default function UserPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editData, setEditData] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <PageHeader title="User Management" description="Manage system users, staff, and teachers." />
        <div className="flex gap-3">
          <ThemedInput placeholder="Search user..." icon={<Search size={14} />} onChange={(e: any) => setSearchQuery(e.target.value)} />
          <ThemedButton onClick={() => setIsOpen(true)} size="sm">Add User</ThemedButton>
        </div>
      </div>
      
      <UserTable 
        onEdit={(data: any) => { setEditData(data); setIsOpen(true); }} 
        refreshTrigger={refreshTrigger} 
        searchQuery={searchQuery} 
      />
      
      <UserRegistrationForm
        isOpen={isOpen} 
        onClose={() => { setIsOpen(false); setEditData(null); }} 
        onSuccess={() => setRefreshTrigger(p => p + 1)} 
      />
    </div>
  );
}