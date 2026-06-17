"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Target, Save, Loader2, Camera } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { StrategyServices } from "@/services/strategyServices";
import CKEditorField from "@/components/CkEditorfield";

const EDITOR_FIELDS = [
  { name: "mission_statement", label: "Mission Statement" },
  { name: "goals", label: "Goals" },

  { name: "management", label: "Management" },
  { name: "objective", label: "Objective" },
] as const;

export function CompanyStrategyForm({
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
      objective: "",
      mission_statement: "",
      management: "",
      goals: "",
      image: null as any,
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
        setImagePreview(initialData.image || null);
        form.reset({
          objective: initialData.objective || "",
          mission_statement: initialData.mission_statement || "",
          management: initialData.management || "",
          goals: initialData.goals || "",
          image: null,
        });
      } else {
        setImagePreview(null);
        form.reset({
          objective: "",
          mission_statement: "",
          management: "",
          goals: "",
          image: null,
        });
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
      ["objective", "mission_statement", "management", "goals"].forEach((k) =>
        fd.append(k, values[k]),
      );
      if (values.image instanceof File) fd.append("image", values.image);

      if (isUpdate) {
        await StrategyServices.updateDetails(initialData.id, fd);
        toast.success("Strategy updated!");
      } else {
        await StrategyServices.createDetails(fd);
        toast.success("Strategy created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(StrategyServices.parseError(err));
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
        <div className="w-full max-w-3xl bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta max-h-[92vh] flex flex-col">
          <ConfigProvider
            theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Target size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Strategy" : "New Strategy"}
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
                  className="px-6 py-4 space-y-5"
                >
                  {/* ── Image upload ── */}
                  <div className="flex flex-col items-center pb-4 border-b border-dashed border-gray-200">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest self-start mb-2">
                      Cover Image
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
                          <Camera size={28} />
                          <span className="text-[11px] font-bold uppercase">
                            Click to upload image
                          </span>
                          <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase">
                            Strategy image (Max 5MB)
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

                  {/* ── CKEditor fields ── */}
                  {EDITOR_FIELDS.map(({ name, label }) => (
                    <Controller
                      key={name}
                      control={form.control}
                      name={name}
                      render={({ field, fieldState }) => (
                        <CKEditorField
                          label={label}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={`Enter ${label.toLowerCase()}...`}
                          height={220}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  ))}

                  {/* ── Footer actions ── */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 sticky bottom-0 bg-white pb-1">
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
