"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, LayoutGrid, Save, Loader2 } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { TableServices } from "@/services/tableServices";

type TableFormValues = {
  table_number: string;
};

export function TableForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);

  const form = useForm<TableFormValues>({
    defaultValues: { table_number: "" },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      form.reset({ table_number: initialData?.table_number || "" });
    }
  }, [initialData, isOpen]);

  const onSubmit = async (values: TableFormValues) => {
    setLoading(true);
    try {
      if (isUpdate) {
        await TableServices.updateDetails(initialData.id, values);
        toast.success("Table updated!");
      } else {
        await TableServices.createDetails(values);
        toast.success("Table created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(TableServices.parseError(err));
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
        <div className="w-full max-w-md bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta flex flex-col">
          <ConfigProvider
            theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}
          >
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <LayoutGrid size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Table" : "New Table"}
              </h2>
              <button
                onClick={handleClose}
                className="text-red-500 hover:rotate-90 transition-transform"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="px-6 py-4 space-y-4"
              >
                {/* Table Number */}
                <Controller
                  control={form.control}
                  name="table_number"
                  rules={{
                    required: "Table number is required",
                    maxLength: { value: 10, message: "Max 10 characters" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Table Number"
                        icon={<LayoutGrid size={12} />}
                        placeholder="e.g. T1, A2, 101"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

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
          </ConfigProvider>
        </div>
      </div>
    </>
  );
}