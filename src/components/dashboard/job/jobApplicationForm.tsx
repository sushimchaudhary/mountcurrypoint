"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Briefcase, Save, Loader2, User, Mail, Phone, MapPin, FileUp, AlignLeft } from "lucide-react";
import { ConfigProvider, Select } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { JobApplicationServices, JobServices } from "@/services/jobServices";

export function JobApplicationForm({ initialData, onSuccess, onClose, isOpen, defaultJobId }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const [cvName, setCvName] = useState<string | null>(null);
  const [jobOptions, setJobOptions] = useState<{ value: any; label: string }[]>([]);
  const cvRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      job: defaultJobId || null,
      name: "",
      email: "",
      contact: "",
      address: "",
      cv: null as any,
      short_description: "",
    },
  });

  const handleClose = () => { form.reset(); setCvName(null); onClose(); };

  // Load job options for the dropdown
  useEffect(() => {
    JobServices.getDetails().then((res: any) => {
      const list = Array.isArray(res) ? res : res?.results || [];
      setJobOptions(list.map((j: any) => ({ value: j.id, label: j.name })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setCvName(initialData.cv ? "Existing CV" : null);
        form.reset({
          job: initialData.job || defaultJobId || null,
          name: initialData.name || "",
          email: initialData.email || "",
          contact: initialData.contact || "",
          address: initialData.address || "",
          cv: null,
          short_description: initialData.short_description || "",
        });
      } else {
        setCvName(null);
        form.reset({
          job: defaultJobId || null,
          name: "",
          email: "",
          contact: "",
          address: "",
          cv: null,
          short_description: "",
        });
      }
    }
  }, [initialData, isOpen, defaultJobId]);

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { form.setValue("cv", file); setCvName(file.name); }
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("job", values.job);
      fd.append("name", values.name);
      fd.append("email", values.email);
      fd.append("contact", values.contact);
      fd.append("address", values.address);
      fd.append("short_description", values.short_description);
      if (values.cv instanceof File) fd.append("cv", values.cv);

      if (isUpdate) {
        // await JobApplicationServices.updateDetails(initialData.id, fd);
      
        await JobApplicationServices.submitApplication(fd);
        toast.success("Application created!");
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
        <div className="w-full max-w-lg bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta max-h-[90vh] flex flex-col">
          <ConfigProvider theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}>

            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Briefcase size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Application" : "New Application"}
              </h2>
              <button onClick={handleClose} className="text-red-500 hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">

                  {/* Job selector */}
                  <div className="w-full space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 block">Job Position</label>
                    <Controller
                      control={form.control}
                      name="job"
                      rules={{ required: "Job is required" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={jobOptions}
                          placeholder="Select a job"
                          style={{ width: "100%" }}
                          size="middle"
                          disabled={!!defaultJobId}
                        />
                      )}
                    />
                    <FormMessage className="text-[10px]" />
                  </div>

                  {/* Name */}
                  <Controller control={form.control} name="name" rules={{ required: "Name is required" }} render={({ field }) => (
                    <FormItem>
                      <ThemedInput label="Full Name" icon={<User size={12} />} placeholder="Enter applicant name" {...field} />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />

                  {/* Email & Contact side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <Controller control={form.control} name="email" rules={{ required: "Email is required" }} render={({ field }) => (
                      <FormItem>
                        <ThemedInput label="Email" icon={<Mail size={12} />} placeholder="email@example.com" {...field} />
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <Controller control={form.control} name="contact" rules={{ required: "Contact is required" }} render={({ field }) => (
                      <FormItem>
                        <ThemedInput label="Contact" icon={<Phone size={12} />} placeholder="Phone number" {...field} />
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Address */}
                  <Controller control={form.control} name="address" rules={{ required: "Address is required" }} render={({ field }) => (
                    <FormItem>
                      <ThemedInput label="Address" icon={<MapPin size={12} />} placeholder="Enter address" {...field} />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />

                  {/* CV upload */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 block">CV / Resume</label>
                    <div
                      onClick={() => cvRef.current?.click()}
                      className="w-full h-14 rounded border-2 border-dashed flex items-center justify-center gap-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
                      style={{ borderColor: cvName ? primaryColor : "#e5e7eb" }}
                    >
                      <FileUp size={16} className={cvName ? "text-blue-400" : "text-gray-300"} />
                      <span className="text-[11px] font-bold text-gray-400 truncate max-w-[300px]">
                        {cvName || "Click to upload CV (PDF, DOC)"}
                      </span>
                    </div>
                    <input
                      type="file"
                      ref={cvRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvChange}
                    />
                    {isUpdate && initialData?.cv && !form.watch("cv") && (
                      <a href={initialData.cv} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 mt-1">
                        View existing CV
                      </a>
                    )}
                  </div>

                  {/* Cover letter */}
                  <div className="w-full space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                      <AlignLeft size={11} /> Cover Letter / Introduction
                    </label>
                    <Controller control={form.control} name="short_description" render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        placeholder="Brief introduction or cover letter..."
                        className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 resize-none"
                      />
                    )} />
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <CancelButton onClick={handleClose} disabled={loading} />
                    <ThemedButton type="submit" size="sm" disabled={loading}>
                      <div className="flex items-center gap-2">
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        <span>{isUpdate ? "Update" : "Submit"}</span>
                      </div>
                    </ThemedButton>
                  </div>

                </form>
              </Form>
            </div>

          </ConfigProvider>
        </div>
      </div>
    </>
  );
}