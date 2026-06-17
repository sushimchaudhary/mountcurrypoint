"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, FileText, Save, Loader2, Camera, FileUp } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { LegalDocsServices } from "@/services/legaldocsServices";

export function LegalDocForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const form = useForm({
    defaultValues: { title: "", image: null as any, pdf: null as any },
  });
  const handleClose = () => {
    form.reset();
    setImagePreview(null);
    setPdfName(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setImagePreview(initialData.image || null);
        setPdfName(initialData.pdf ? "Existing PDF" : null);
        form.reset({ title: initialData.title || "", image: null, pdf: null });
      } else {
        setImagePreview(null);
        setPdfName(null);
        form.reset({ title: "", image: null, pdf: null });
      }
    }
  }, [initialData, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const r = new FileReader();
      r.onloadend = () => setImagePreview(r.result as string);
      r.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("pdf", file);
      setPdfName(file.name);
    }
  };

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", values.title);
      if (values.image instanceof File) fd.append("image", values.image);
      if (values.pdf instanceof File) fd.append("pdf", values.pdf);
      if (isUpdate) {
        await LegalDocsServices.updateDetails(initialData.id, fd);
        toast.success("Document updated!");
      } else {
        await LegalDocsServices.createDetails(fd);
        toast.success("Document created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(LegalDocsServices.parseError(err));
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
                <FileText size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Document" : "New Document"}
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput
                        label="Document Title"
                        icon={<FileText size={12} />}
                        placeholder="Enter document title"
                        {...field}
                      />
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col items-center pb-3 border-b border-dashed border-gray-200">
                  <label className="text-[11px] font-medium text-gray-400 block self-start mb-1">
                    Cover Image
                  </label>
                  <div
                    onClick={() => imageRef.current?.click()}
                    className="w-full h-32 rounded border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
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
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={imageRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-400 block">
                    PDF File
                  </label>
                  <div
                    onClick={() => pdfRef.current?.click()}
                    className="w-full h-16 rounded border-2 border-dashed flex items-center justify-center gap-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
                    style={{ borderColor: pdfName ? primaryColor : "#e5e7eb" }}
                  >
                    <FileUp
                      size={18}
                      className={pdfName ? "text-blue-400" : "text-gray-300"}
                    />
                    <span className="text-[11px] font-bold text-gray-400">
                      {pdfName || "Click to upload PDF"}
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={pdfRef}
                    className="hidden"
                    accept="application/pdf"
                    onChange={handlePdfChange}
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
