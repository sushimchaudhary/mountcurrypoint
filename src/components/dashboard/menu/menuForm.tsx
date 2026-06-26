"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { X, UtensilsCrossed, Save, Loader2, Plus, Trash2, ImagePlus } from "lucide-react";
import { ConfigProvider, Select } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { MenuServices } from "@/services/menuServices";
import { CategoryServices } from "@/services/categoryServices";

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "not_available", label: "Not Available" },
];

type Portion = {
  portion_name: string;
  price: string;
};

type MenuFormValues = {
  name: string;
  category: number | null;
  status: string;
  portions: Portion[];
  image: File | null;
};

export function MenuForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic categories fetched from API
  const [categoryOptions, setCategoryOptions] = useState<{ value: number; label: string }[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const res = await CategoryServices.getDetails();
      const list = Array.isArray(res) ? res : res?.results || [];
      setCategoryOptions(list.map((c: any) => ({ value: c.id, label: c.name })));
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  const form = useForm<MenuFormValues>({
    defaultValues: {
      name: "",
      category: null,
      status: "available",
      portions: [{ portion_name: "", price: "" }],
      image: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "portions",
  });

  const handleClose = () => {
    form.reset();
    setImagePreview(null);
    onClose();
  };

  // Fetch categories once when modal first opens
  useEffect(() => {
    if (isOpen && categoryOptions.length === 0) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          name: initialData.name || "",
          category: initialData.category ?? null,
          status: initialData.status || "available",
          portions:
            initialData.portions?.length > 0
              ? initialData.portions
              : [{ portion_name: "", price: "" }],
          image: null,
        });
        setImagePreview(initialData.image || null);
      } else {
        form.reset({
          name: "",
          category: null,
          status: "available",
          portions: [{ portion_name: "", price: "" }],
          image: null,
        });
        setImagePreview(null);
      }
    }
  }, [initialData, isOpen]);

  const onSubmit = async (values: MenuFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("status", values.status);
      if (values.category !== null && values.category !== undefined) {
        formData.append("category", String(values.category));
      }
      formData.append("portions", JSON.stringify(values.portions));
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      if (isUpdate) {
        await MenuServices.updateDetails(initialData.id, formData);
        toast.success("Menu item updated!");
      } else {
        await MenuServices.createDetails(formData);
        toast.success("Menu item created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(MenuServices.parseError(err));
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
        <div className="w-full max-w-2xl bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta max-h-[92vh] flex flex-col">
          <ConfigProvider
            theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <UtensilsCrossed size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Menu Item" : "New Menu Item"}
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
                  {/* Item Name */}
                  <Controller
                    control={form.control}
                    name="name"
                    rules={{ required: "Item name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <ThemedInput
                          label="Item Name"
                          icon={<UtensilsCrossed size={12} />}
                          placeholder="Enter menu item name"
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
                          Item Image
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

                  {/* Category & Status — side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Category — dynamic from API */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-gray-400 block">
                        Category
                      </label>
                      <Controller
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={categoryOptions}
                            loading={categoryLoading}
                            placeholder="Select category"
                            allowClear
                            style={{ width: "100%" }}
                            size="middle"
                            notFoundContent={
                              categoryLoading
                                ? <span className="text-[11px] text-gray-400">Loading...</span>
                                : <span className="text-[11px] text-gray-400">No categories found</span>
                            }
                          />
                        )}
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
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
                  </div>

                  {/* Portions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-gray-400 block">
                        Portions & Prices
                      </label>
                      <button
                        type="button"
                        onClick={() => append({ portion_name: "", price: "" })}
                        className="flex items-center gap-1 text-[11px] font-medium hover:opacity-80 transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        <Plus size={12} />
                        Add Portion
                      </button>
                    </div>

                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-center">
                          <Controller
                            control={form.control}
                            name={`portions.${index}.portion_name`}
                            render={({ field }) => (
                              <ThemedInput
                                placeholder="e.g. Full, Half, 6 Pieces"
                                className="flex-1"
                                {...field}
                              />
                            )}
                          />
                          <Controller
                            control={form.control}
                            name={`portions.${index}.price`}
                            render={({ field }) => (
                              <ThemedInput
                                placeholder="Price"
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-28"
                                {...field}
                              />
                            )}
                          />
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

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