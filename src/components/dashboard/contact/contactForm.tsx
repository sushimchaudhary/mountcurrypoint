"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  X,
  Mail,
  Save,
  Loader2,
  Phone,
  User,
  MessageSquare,
} from "lucide-react";
import { ConfigProvider } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { ContactServices } from "@/services/contactServices";

export function ContactForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      phone_number: "",
    },
  });
  const handleClose = () => {
    form.reset();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          name: initialData.name || "",
          email: initialData.email || "",
          subject: initialData.subject || "",
          message: initialData.message || "",
          phone_number: initialData.phone_number || "",
        });
      } else {
        form.reset({
          name: "",
          email: "",
          subject: "",
          message: "",
          phone_number: "",
        });
      }
    }
  }, [initialData, isOpen]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isUpdate) {
        await ContactServices.delete(initialData.id);
        toast.success("Contact updated!");
      } else {
        await ContactServices.create(values);
        toast.success("Contact created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
       toast.error(ContactServices.parseError(err));
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
                <Mail size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Contact" : "New Contact"}
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
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Name"
                        icon={<User size={12} />}
                        placeholder="Enter name"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Email"
                        icon={<Mail size={12} />}
                        placeholder="Enter email"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Phone Number"
                        icon={<Phone size={12} />}
                        placeholder="Enter phone number"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Subject"
                        icon={<MessageSquare size={12} />}
                        placeholder="Enter subject"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <div className="w-full space-y-1">
                  <label className="text-[11px] font-medium text-gray-400 block">
                    Message
                  </label>
                  <Controller
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        placeholder="Message..."
                        className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 resize-none"
                      />
                    )}
                  />
                </div>
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
