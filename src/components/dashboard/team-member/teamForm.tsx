"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Users, Briefcase, Hash, Save, Loader2, Camera } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { TeamServices } from "@/services/teamServices";

interface IFormValues {
  name: string;
  position: string;
  order: number;
  image?: any;
}

export default function TeamForm({
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
    defaultValues: { name: "", position: "", order: 1, image: null },
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
          name: initialData.name || "",
          position: initialData.position || "",
          order: initialData.order || 1,
          image: null,
        });
      } else {
        setImagePreview(null);
        form.reset({ name: "", position: "", order: 1, image: null });
      }
    }
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
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
      fd.append("name", values.name);
      fd.append("position", values.position);
      fd.append("order", String(values.order));
      if (values.image instanceof File) fd.append("image", values.image);
      if (isUpdate) {
        await TeamServices.updateDetails(initialData.id, fd);
        toast.success("Team member updated!");
      } else {
        await TeamServices.createDetails(fd);
        toast.success("Team member added!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
       toast.error(TeamServices.parseError(err));
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
                <Users size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Team Member" : "Add Team Member"}
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
                {/* Photo Upload */}
                <div className="flex flex-col items-center pb-3 border-b border-dashed border-gray-200">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
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
                      <Camera size={30} className="text-gray-300" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase">
                    Member Photo (Max 5MB)
                  </p>
                </div>
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Full Name"
                        icon={<Users size={12} />}
                        placeholder="Enter full name"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Position / Role"
                        icon={<Briefcase size={12} />}
                        placeholder="e.g. CEO, Manager"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Display Order"
                        icon={<Hash size={12} />}
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                      <span>{isUpdate ? "Update" : "Add Member"}</span>
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
