"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Receipt, Save, Loader2, Percent, CreditCard } from "lucide-react";
import { ConfigProvider, Select } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { BillServices } from "@/services/billServices";
import { OrderServices } from "@/services/orderServices";

type BillFormValues = {
  order_id: number | null;
  discount_percentage: number;
  vat_percentage: number;
  payment_method: string;
};

const PAYMENT_OPTIONS = [
  { value: "cash",           label: "Cash" },
  { value: "card",           label: "Card" },
  { value: "digital_wallet", label: "Digital Wallet / QR Pay" },
];

export function BillForm({ initialData, onSuccess, onClose, isOpen, prefillOrder }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading]   = useState(false);
  const [orders, setOrders]     = useState<any[]>([]);
  // Live preview of calculated totals
  const [preview, setPreview]   = useState<{
    subTotal: number; discountAmt: number; vatAmt: number; grandTotal: number;
  } | null>(null);

  const form = useForm<BillFormValues>({
    defaultValues: {
      order_id:            null,
      discount_percentage: 0,
      vat_percentage:      13,
      payment_method:      "cash",
    },
  });

  const watchOrderId     = form.watch("order_id");
  const watchDiscount    = form.watch("discount_percentage");
  const watchVat         = form.watch("vat_percentage");

  // Load unbilled orders for the dropdown
  useEffect(() => {
    if (!isOpen) return;
    const loadOrders = async () => {
      try {
        const res = await OrderServices.getDetails();
        const list: any[] = Array.isArray(res) ? res : res?.results || [];
        // Only show orders that are not cancelled
        setOrders(list.filter((o) => o.status !== "cancelled"));
      } catch {
        toast.error("Failed to load orders");
      }
    };
    loadOrders();
  }, [isOpen]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      if (isUpdate) {
        form.reset({
          order_id:            initialData.order_id,
          discount_percentage: Number(initialData.discount_percentage),
          vat_percentage:      Number(initialData.vat_percentage),
          payment_method:      initialData.payment_method,
        });
      } else {
        form.reset({
          order_id:            prefillOrder?.id ?? null,
          discount_percentage: 0,
          vat_percentage:      13,
          payment_method:      "cash",
        });
      }
    }
  }, [initialData, isOpen, prefillOrder]);

  // Live preview calculation (mirrors backend logic)
  useEffect(() => {
    const selectedOrder = orders.find((o) => o.id === watchOrderId)
      || (isUpdate ? { total_amount: initialData?.sub_total } : null);

    if (!selectedOrder) { setPreview(null); return; }

    const subTotal      = Number(selectedOrder.total_amount ?? 0);
    const discPct       = Number(watchDiscount ?? 0);
    const vatPct        = Number(watchVat ?? 0);
    const discountAmt   = +(subTotal * (discPct / 100)).toFixed(2);
    const afterDiscount = subTotal - discountAmt;
    const vatAmt        = +(afterDiscount * (vatPct / 100)).toFixed(2);
    const grandTotal    = +(afterDiscount + vatAmt).toFixed(2);

    setPreview({ subTotal, discountAmt, vatAmt, grandTotal });
  }, [watchOrderId, watchDiscount, watchVat, orders]);

  const handleClose = () => { form.reset(); onClose(); };

  const onSubmit = async (values: BillFormValues) => {
    if (!values.order_id) { toast.error("Please select an order"); return; }
    setLoading(true);
    try {
      if (isUpdate) {
        await BillServices.updateDetails(initialData.id, {
          discount_percentage: values.discount_percentage,
          vat_percentage:      values.vat_percentage,
          payment_method:      values.payment_method,
        });
        toast.success("Bill updated!");
      } else {
        await BillServices.createDetails({
          order_id:            values.order_id,
          discount_percentage: values.discount_percentage,
          vat_percentage:      values.vat_percentage,
          payment_method:      values.payment_method,
        });
        toast.success("Bill generated!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(BillServices.parseError(err));
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
        <div className="w-full max-w-md bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta flex flex-col max-h-[90vh]">
          <ConfigProvider theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}>

            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Receipt size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Bill" : "Generate Bill"}
              </h2>
              <button onClick={handleClose} className="text-red-500 hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-hide">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-3 space-y-2">

                  {/* Order select */}
                  {!isUpdate && (
                    <Controller
                      control={form.control}
                      name="order_id"
                      rules={{ required: "Order is required" }}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <label className="text-[11px] font-bold text-[#526484] uppercase tracking-wide">
                            Order
                          </label>
                          <Select
                            {...field}
                            placeholder="Select order"
                            className="w-full !py-1"
                            size="small"
                            showSearch
                            optionFilterProp="label"
                            options={orders.map((o) => ({
                              label: `#${o.id} — Table ${o.table_number ?? "?"} — $${Number(o.total_amount).toFixed(2)}`,
                              value: o.id,
                            }))}
                          />
                          {fieldState.error && (
                            <p className="text-[10px] text-red-500 mt-0.5">{fieldState.error.message}</p>
                          )}
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Discount % */}
                  <Controller
                    control={form.control}
                    name="discount_percentage"
                    rules={{ min: { value: 0, message: "Min 0" }, max: { value: 100, message: "Max 100" } }}
                    render={({ field }) => (
                      <FormItem>
                        <ThemedInput
                          label="Discount (%)"
                          icon={<Percent size={12} />}
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          placeholder="0"
                          {...field}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {/* VAT % */}
                  <Controller
                    control={form.control}
                    name="vat_percentage"
                    rules={{ min: { value: 0, message: "Min 0" }, max: { value: 100, message: "Max 100" } }}
                    render={({ field }) => (
                      <FormItem>
                        <ThemedInput
                          label="VAT / Tax (%)"
                          icon={<Percent size={12} />}
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          placeholder="0"
                          {...field}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {/* Payment Method */}
                  <Controller
                    control={form.control}
                    name="payment_method"
                    rules={{ required: "Payment method is required" }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <label className="text-[11px] font-bold text-[#526484] uppercase tracking-wide">
                          Payment Method
                        </label>
                        <Select
                          {...field}
                          size="small"
                          className="w-full !py-1"
                          options={PAYMENT_OPTIONS}
                        />
                        {fieldState.error && (
                          <p className="text-[10px] text-red-500 mt-0.5">{fieldState.error.message}</p>
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Live Preview Panel */}
                  {preview && (
                    <div className="rounded border border-gray-100 bg-[#f8f9fc] overflow-hidden">
                      <div className="px-3 py-1.5 bg-[#f0f2f8] border-b border-gray-100">
                        <span className="text-[10px] font-bold text-[#526484] uppercase tracking-wide">
                          Bill Preview
                        </span>
                      </div>
                      <div className="px-3 py-2 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-[11px] text-[#8094ae]">Sub Total</span>
                          <span className="text-[11px] font-semibold text-[#364a63]">
                            ${preview.subTotal.toFixed(2)}
                          </span>
                        </div>
                        {preview.discountAmt > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[11px] text-green-600">
                              Discount ({watchDiscount}%)
                            </span>
                            <span className="text-[11px] font-semibold text-green-600">
                              − ${preview.discountAmt.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {preview.vatAmt > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[11px] text-[#8094ae]">
                              VAT ({watchVat}%)
                            </span>
                            <span className="text-[11px] font-semibold text-[#364a63]">
                              + ${preview.vatAmt.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1">
                          <span className="text-[12px] font-bold text-[#364a63]">Grand Total</span>
                          <span className="text-[13px] font-bold text-[#364a63]">
                            ${preview.grandTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <CancelButton onClick={handleClose} disabled={loading} />
                    <ThemedButton type="submit" size="sm" disabled={loading}>
                      <div className="flex items-center gap-2">
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        <span>{isUpdate ? "Update" : "Generate Bill"}</span>
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