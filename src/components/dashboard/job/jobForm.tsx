"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Briefcase, Save, Loader2 } from "lucide-react";
import { ConfigProvider, Select } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { JobServices } from "@/services/jobServices";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "HIRING", label: "Hiring" },
  { value: "HIRED", label: "Hired" },
];

export function JobForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const form = useForm({
    defaultValues: { name: "", description: "", status: "DRAFT" },
  });
  const handleClose = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          name: initialData.name || "",
          description: initialData.description || "",
          status: initialData.status || "DRAFT",
        });
      } else {
        form.reset({ name: "", description: "", status: "DRAFT" });
      }
    }
  }, [initialData, isOpen]);

const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isUpdate) {
        await JobServices.updateDetails(initialData.slug, values); 
        toast.success("Job updated!");
      } else {
        await JobServices.createDetails(values);
        toast.success("Job created!");
      }
      onSuccess?.(); 
      handleClose();
    } catch (err: any) { 
      toast.error(JobServices.parseError(err));
    } finally { 
      setLoading(false); 
    }
};

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      />
      <div
        className={`fixed inset-0 z-[101] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        <div className="w-full max-w-lg bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta">
          <ConfigProvider
            theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}
          >
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Briefcase size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Job Post" : "New Job Post"}
              </h2>
              <button
                onClick={handleClose}
                className="text-red-500 hover:rotate-90 transition-transform"
              >
                <X size={20} />
              </button>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="px-6 py-4 space-y-4"
              >
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Job Title"
                        icon={<Briefcase size={12} />}
                        placeholder="Enter job title"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <div className="w-full space-y-1">
                  <label className="text-[11px] font-medium text-gray-400 block">
                    Status
                  </label>
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={STATUS_OPTIONS}
                        style={{ width: "100%" }}
                        size="middle"
                      />
                    )}
                  />
                </div>
                <div className="w-full space-y-1">
                  <label className="text-[11px] font-medium text-gray-400 block">
                    Description / Requirements
                  </label>
                  <Controller
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={5}
                        placeholder="Job responsibilities, requirements, etc..."
                        className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 resize-none"
                      />
                    )}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <CancelButton onClick={handleClose} disabled={loading} />
                  <ThemedButton type="submit" size="sm" disabled={loading}>
                    <div className="flex items-center gap-2">
                      {loading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      <span>{isUpdate ? "Update" : "Create"}</span>
                    </div>
                  </ThemedButton>
                </div>
              </form>
            </Form>
          </ConfigProvider>
        </div>
      </div>
    </>
  );
}
