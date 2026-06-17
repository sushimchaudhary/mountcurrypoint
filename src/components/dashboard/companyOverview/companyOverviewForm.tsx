"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Building2, Save, Loader2, Camera } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { CompanyOverviewServices } from "@/services/companyoverviewServices";
import CKEditorField from "@/components/CkEditorfield";

export function CompanyOverviewForm({
  initialData,
  onSuccess,
  onClose,
  isOpen,
}: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      description: "",
      company_img: null as any,
    },
  });

  const handleClose = () => {
    form.reset();
    setImagePreview(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setImagePreview(initialData.company_img || null);
        form.reset({
          description: initialData.description || "",
          company_img: null,
        });
      } else {
        setImagePreview(null);
        form.reset({ description: "", company_img: null });
      }
    }
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("company_img", file);
      const r = new FileReader();
      r.onloadend = () => setImagePreview(r.result as string);
      r.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("description", values.description);
      if (values.company_img instanceof File)
        fd.append("company_img", values.company_img);

      if (isUpdate) {
        await CompanyOverviewServices.updateDetails(initialData.id, fd);
        toast.success("Overview updated!");
      } else {
        await CompanyOverviewServices.createDetails(fd);
        toast.success("Overview created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(CompanyOverviewServices.parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-[101] flex items-center justify-center p-4 transition-all duration-300 ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="w-full max-w-2xl bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta max-h-[92vh] flex flex-col">
          <ConfigProvider
            theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Building2 size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Overview" : "New Overview"}
              </h2>
              <button
                onClick={handleClose}
                className="text-red-500 hover:rotate-90 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="px-6 py-4 space-y-4"
                >
                  {/* ── Image upload ── */}
                  <div className="flex flex-col pb-3 border-b border-dashed border-gray-200">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Company Image
                    </label>
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
                          <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase">
                            Overview image (Max 5MB)
                          </p>
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

                  {/* ── CKEditor for description ── */}
                  <Controller
                    control={form.control}
                    name="description"
                    render={({ field, fieldState }) => (
                      <CKEditorField
                        label="Description"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Company overview..."
                        height={320}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  {/* ── Footer ── */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
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
            </div>
          </ConfigProvider>
        </div>
      </div>
    </>
  );
}