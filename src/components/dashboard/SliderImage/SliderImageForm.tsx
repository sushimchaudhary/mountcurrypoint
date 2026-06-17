"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { X, Image, Save, Loader2, Camera } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { SliderServices } from "@/services/sliderServices";

export function SliderForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm({ defaultValues: { image: null as any } });
  const handleClose = () => {
    form.reset();
    setImagePreview(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setImagePreview(initialData.image || null);
        form.reset({ image: null });
      } else {
        setImagePreview(null);
        form.reset({ image: null });
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
      if (values.image instanceof File) fd.append("image", values.image);
      if (isUpdate) {
        await SliderServices.updateDetails(initialData.id, fd);
        toast.success("Slider updated!");
      } else {
        await SliderServices.createDetails(fd);
        toast.success("Slider added!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
       toast.error(SliderServices.parseError(err));
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
        <div className="w-full max-w-md bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta">
          <ConfigProvider
            theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}
          >
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Image size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Slider" : "New Slider Image"}
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
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 rounded border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
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
                      <Camera size={36} />
                      <span className="text-[11px] font-bold uppercase">
                        Click to upload slider image
                      </span>
                      <span className="text-[10px] text-gray-200">
                        Max 3 sliders allowed
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
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <CancelButton onClick={handleClose} disabled={loading} />
                  <ThemedButton type="submit" size="sm" disabled={loading}>
                    <div className="flex items-center gap-2">
                      {loading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Save size={12} />
                      )}
                      <span>{isUpdate ? "Update" : "Add"}</span>
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
