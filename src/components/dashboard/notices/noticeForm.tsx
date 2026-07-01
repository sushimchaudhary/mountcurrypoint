"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Bell, Save, Loader2, ImagePlus } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { NoticeServices } from "@/services/noticeServices";

type NoticeFormValues = {
  title: string;
  is_active: boolean;
  image: File | null;
};

export function NoticeForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<NoticeFormValues>({
    defaultValues: {
      title: "",
      is_active: true,
      image: null,
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
        form.reset({
          title: initialData.title || "",
          is_active: initialData.is_active ?? true,
          image: null,
        });
        setImagePreview(initialData.image || null);
      } else {
        form.reset({
          title: "",
          is_active: true,
          image: null,
        });
        setImagePreview(null);
      }
    }
  }, [initialData, isOpen]);

  const onSubmit = async (values: NoticeFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("is_active", String(values.is_active));
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      if (isUpdate) {
        await NoticeServices.updateDetails(initialData.id, formData);
        toast.success("Notice updated!");
      } else {
        await NoticeServices.createDetails(formData);
        toast.success("Notice created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(NoticeServices.parseError(err));
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
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="w-full max-w-lg bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta max-h-[92vh] flex flex-col">
          <ConfigProvider
            theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Bell size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Notice" : "New Notice"}
              </h2>
              <button
                onClick={handleClose}
                className="text-red-500 hover:rotate-90 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 scrollbar-hide">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="px-6 py-4 space-y-4"
                >
                  {/* Title */}
                  <Controller
                    control={form.control}
                    name="title"
                    rules={{ required: "Title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <ThemedInput
                          label="Notice Title"
                          icon={<Bell size={12} />}
                          placeholder="Enter notice title"
                          {...field}
                        />
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {/* Image Upload */}
                  <Controller
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-gray-400 block">
                          Notice Image
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImagePlus size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                field.onChange(file);
                                if (file) setImagePreview(URL.createObjectURL(file));
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1 text-[11px] font-medium border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                              {imagePreview ? "Change Image" : "Upload Image"}
                            </button>
                            {imagePreview && (
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(null);
                                  setImagePreview(null);
                                  if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="text-[10px] text-red-400 hover:text-red-600 text-left transition-colors"
                              >
                                Remove
                              </button>
                            )}
                            <span className="text-[10px] text-gray-300">JPG, PNG, WEBP · max 2MB</span>
                          </div>
                        </div>
                      </div>
                    )}
                  />

                  {/* Status — on/off toggle button */}
                  <Controller
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <div className="flex items-center justify-between rounded border border-gray-200 px-3 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-gray-500">
                            Status
                          </span>
                          <span
                            className="text-[12px] font-bold"
                            style={{ color: field.value ? primaryColor : "#9ca3af" }}
                          >
                            {field.value ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={field.value}
                          onClick={() => field.onChange(!field.value)}
                          className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none"
                          style={{
                            backgroundColor: field.value ? primaryColor : "#d1d5db",
                          }}
                        >
                          <span
                            className="inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md transition-transform duration-300"
                            style={{
                              height: "18px",
                              width: "18px",
                              transform: field.value
                                ? "translateX(22px)"
                                : "translateX(3px)",
                            }}
                          />
                        </button>
                      </div>
                    )}
                  />

                  {/* Footer */}
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