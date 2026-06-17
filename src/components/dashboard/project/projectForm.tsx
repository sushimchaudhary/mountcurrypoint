// ─── ProjectForm.tsx ───────────────────────────────────────────────────────
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, FolderKanban, FileText, Save, Loader2, Camera } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { ProjectsServices } from "@/services/projectsServices";

export function ProjectForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm({
    defaultValues: { title: "", description: "", image: null as any },
  });
  const handleClose = () => {
    form.reset();
    setImagePreview(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setImagePreview(initialData.image_url || initialData.image || null);
        form.reset({
          title: initialData.title || "",
          description: initialData.description || "",
          image: null,
        });
      } else {
        setImagePreview(null);
        form.reset({ title: "", description: "", image: null });
      }
    }
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const r = new FileReader();
      r.onloadend = () => setImagePreview(r.result as string);
      r.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", values.title);
      fd.append("description", values.description);
      if (values.image instanceof File) fd.append("image", values.image);
      if (isUpdate) {
        await ProjectsServices.updateDetails(initialData.id, fd);
        toast.success("Project updated!");
      } else {
        await ProjectsServices.createDetails(fd);
        toast.success("Project created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(ProjectsServices.parseError(err));
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
                <FolderKanban size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Project" : "New Project"}
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
                <div className="flex flex-col items-center pb-3 border-b border-dashed border-gray-200">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-36 rounded border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
                    style={{
                      borderColor: imagePreview ? primaryColor : "#e5e7eb",
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-300">
                        <Camera size={32} />
                        <span className="text-[11px] font-bold uppercase">
                          Click to upload image
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <Controller
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Project Title"
                        icon={<FolderKanban size={12} />}
                        placeholder="Enter project title"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <div className="w-full space-y-1">
                  <label className="text-[11px] font-medium text-gray-400 block">
                    Description
                  </label>
                  <Controller
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        placeholder="Project description..."
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
