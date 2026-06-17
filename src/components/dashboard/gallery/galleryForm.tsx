"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Image as ImageIcon,
  Link,
  Save,
  Loader2,
  Camera,
} from "lucide-react";
import { ConfigProvider } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { GalleryServices } from "@/services/galleryServices";

interface IFormValues {
  title: string;
  video_url: string;
  image?: any;
}

export default function GalleryForm({
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
  const form = useForm<IFormValues>({
    defaultValues: { title: "", video_url: "", image: null },
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
          video_url: initialData.video_url || "",
          image: null,
        });
      } else {
        setImagePreview(null);
        form.reset({ title: "", video_url: "", image: null });
      }
    }
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be under 10MB");
        return;
      }
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: IFormValues) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", values.title);
      if (values.video_url) fd.append("video_url", values.video_url);
      if (values.image instanceof File) {
        fd.append("image", values.image);
      }
      if (isUpdate) {
        await GalleryServices.updateDetails(initialData.id, fd);
        toast.success("Gallery item updated!");
      } else {
        await GalleryServices.createDetails(fd);
        toast.success("Gallery item added!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
       toast.error(GalleryServices.parseError(err));
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
                <ImageIcon size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Gallery Item" : "Add Gallery Item"}
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
                {/* Image Upload */}
                <div className="flex flex-col items-center pb-3 border-b border-dashed border-gray-200">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 rounded border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
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
                          Click to upload image
                        </span>
                        <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase">
                          Gallery image (Max 5MB)
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
                {/* Title */}
                <Controller
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Title"
                        icon={<ImageIcon size={12} />}
                        placeholder="Enter gallery title"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                {/* Video URL */}
                <Controller
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Video URL (Optional)"
                        icon={<Link size={12} />}
                        placeholder="https://youtube.com/..."
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
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
