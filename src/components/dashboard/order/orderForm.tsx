"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { X, ShoppingCart, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { ConfigProvider, Select } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { OrderServices } from "@/services/orderServices";
import { TableServices } from "@/services/tableServices";
import { CategoryServices } from "@/services/categoryServices";

type OrderItemFormValue = {
  menu_item: number | null;
  selected_portion_id: number | null;
  quantity: number;
};

type OrderFormValues = {
  table_id: number | null;
  items: OrderItemFormValue[];
};

export function OrderForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [tables, setTables] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<any[]>([]);

  const form = useForm<OrderFormValues>({
    defaultValues: {
      table_id: null,
      items: [{ menu_item: null, selected_portion_id: null, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Flatten all menu items from categories
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [tableRes, catRes] = await Promise.all([
          TableServices.getDetails(),
          CategoryServices.getDetails(),
        ]);
        setTables(Array.isArray(tableRes) ? tableRes : tableRes?.results || []);
        const cats = Array.isArray(catRes) ? catRes : catRes?.results || [];
        setCategories(cats);
        const items: any[] = [];
        cats.forEach((cat: any) => {
          (cat.menu_items || []).forEach((mi: any) => {
            items.push({ ...mi, categoryName: cat.name });
          });
        });
        setAllMenuItems(items);
      } catch {
        toast.error("Failed to load dropdown data");
      }
    };
    if (isOpen) fetchDropdowns();
  }, [isOpen]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          table_id: initialData.table_id ?? null,
          items: initialData.items?.map((it: any) => ({
            menu_item: it.menu_item ?? null,
            selected_portion_id: it.selected_portion?.id ?? null,
            quantity: it.quantity ?? 1,
          })) || [{ menu_item: null, selected_portion_id: null, quantity: 1 }],
        });
      } else {
        form.reset({
          table_id: null,
          items: [{ menu_item: null, selected_portion_id: null, quantity: 1 }],
        });
      }
    }
  }, [initialData, isOpen]);

  const getPortionsForItem = (menuItemId: number | null) => {
    if (!menuItemId) return [];
    const mi = allMenuItems.find((m) => m.id === menuItemId);
    return mi?.portions || [];
  };

  const onSubmit = async (values: OrderFormValues) => {
    if (!values.table_id) {
      toast.error("Please select a table");
      return;
    }
    const hasEmptyItem = values.items.some(
      (it) => !it.menu_item || !it.selected_portion_id
    );
    if (hasEmptyItem) {
      toast.error("Please complete all order items");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        table_id: values.table_id,
        items: values.items.map((it) => ({
          menu_item: it.menu_item,
          selected_portion_id: it.selected_portion_id,
          quantity: it.quantity,
        })),
      };
      if (isUpdate) {
        await OrderServices.updateDetails(initialData.id, payload);
        toast.success("Order updated!");
      } else {
        await OrderServices.createDetails(payload);
        toast.success("Order created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(OrderServices.parseError(err));
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
        <div className="w-full max-w-lg bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta flex flex-col max-h-[90vh]">
          <ConfigProvider
            theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Order" : "New Order"}
              </h2>
              <button
                onClick={handleClose}
                className="text-red-500 hover:rotate-90 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="px-6 py-4 space-y-4"
                >
                  {/* Table Select */}
                  <Controller
                    control={form.control}
                    name="table_id"
                    rules={{ required: "Table is required" }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <label className="text-[11px] font-bold text-[#526484] uppercase tracking-wide">
                          Table
                        </label>
                        <Select
                          {...field}
                          placeholder="Select table"
                          className="w-full !py-1 "
                          size="small"
                          showSearch
                          optionFilterProp="label"
                          options={tables.map((t) => ({
                            label: `Table ${t.table_number}`,
                            value: t.id,
                          }))}
                        />
                        {fieldState.error && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {fieldState.error.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Order Items */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#526484] uppercase tracking-wide">
                        Items
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          append({ menu_item: null, selected_portion_id: null, quantity: 1 })
                        }
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                      >
                        <Plus size={11} /> Add Item
                      </button>
                    </div>

                    {fields.map((field, index) => {
                      const watchedItemId = form.watch(`items.${index}.menu_item`);
                      const portions = getPortionsForItem(watchedItemId);

                      return (
                        <div
                          key={field.id}
                          className="grid grid-cols-[1fr_1fr_56px_28px] gap-2 items-start bg-gray-50 border border-gray-100 rounded px-3 py-2"
                        >
                          {/* Menu Item */}
                          <Controller
                            control={form.control}
                            name={`items.${index}.menu_item`}
                            rules={{ required: true }}
                            render={({ field: f }) => (
                              <div>
                                <Select
                                  {...f}
                                  placeholder="Menu item"
                                  size="small"
                                  className="w-full !py-1"
                                  showSearch
                                  optionFilterProp="label"
                                  onChange={(val) => {
                                    f.onChange(val);
                                    // reset portion when item changes
                                    form.setValue(`items.${index}.selected_portion_id`, null);
                                  }}
                                  options={allMenuItems.map((mi) => ({
                                    label: `${mi.name} (${mi.categoryName})`,
                                    value: mi.id,
                                  }))}
                                />
                              </div>
                            )}
                          />

                          {/* Portion */}
                          <Controller
                            control={form.control}
                            name={`items.${index}.selected_portion_id`}
                            rules={{ required: true }}
                            render={({ field: f }) => (
                              <div>
                                <Select
                                  {...f}
                                  placeholder="Portion"
                                  size="small"
                                  className="w-full !py-1"
                                  disabled={!watchedItemId}
                                  options={portions.map((p: any) => ({
                                    label: `${p.portion_name} – $${p.price}`,
                                    value: p.id,
                                  }))}
                                />
                              </div>
                            )}
                          />

                          {/* Quantity */}
                          <Controller
                            control={form.control}
                            name={`items.${index}.quantity`}
                            rules={{ required: true, min: 1 }}
                            render={({ field: f }) => (
                              <input
                                {...f}
                                type="number"
                                min={1}
                                className="w-full  !py-1.5 border border-gray-200 rounded px-2 text-[11px] text-[#364a63] focus:outline-none focus:border-blue-400 bg-white"
                              />
                            )}
                          />

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => fields.length > 1 && remove(index)}
                            disabled={fields.length === 1}
                            className="p-1 text-red-400 hover:text-red-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
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
            </div>
          </ConfigProvider>
        </div>
      </div>
    </>
  );
}