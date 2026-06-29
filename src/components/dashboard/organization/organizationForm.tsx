"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Building2, Mail, Phone, Globe, MapPin, Save, Loader2, Camera, Link } from "lucide-react";
import { ConfigProvider } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { CancelButton } from "@/components/ui/CancleButton";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { OrganizationServices } from "@/services/organizationServices";
import { FaFacebook } from "react-icons/fa";
import { BsInstagram, BsTwitter } from "react-icons/bs";
import { LiaLinkedin } from "react-icons/lia";

interface IFormValues {
  title: string; address: string; email1: string; email2: string;
  website: string; description: string; contactNo: string;
  telephone_number: string; facebook_url: string; twitter_url: string;
  instagram_url: string; linkdin_url: string; location_url: string;
  logo?: any;
}

export default function OrganizationForm({ initialData, onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const isUpdate = !!initialData;
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<IFormValues>({
    defaultValues: {
      title: "", address: "", email1: "", email2: "", website: "",
      description: "", contactNo: "", telephone_number: "",
      facebook_url: "", twitter_url: "", instagram_url: "",
      linkdin_url: "", location_url: "", logo: null,
    },
  });

  const handleClose = () => { form.reset(); setLogoPreview(null); onClose(); };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setLogoPreview(initialData.logo_url || initialData.logo || null);
        form.reset({ ...initialData, logo: null });
      } else {
        setLogoPreview(null);
        form.reset({
          title: "", address: "", email1: "", email2: "", website: "",
          description: "", contactNo: "", telephone_number: "",
          facebook_url: "", twitter_url: "", instagram_url: "",
          linkdin_url: "", location_url: "", logo: null,
        });
      }
    }
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error("Logo size must be under 5MB"); return; }
      form.setValue("logo", file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: IFormValues) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (k !== "logo" && v !== undefined && v !== null) fd.append(k, v);
      });
      if (values.logo instanceof File) fd.append("logo", values.logo);

      if (isUpdate) {
        await OrganizationServices.updateDetails(initialData.id, fd);
        toast.success("Organization updated!");
      } else {
        await OrganizationServices.createDetails(fd);
        toast.success("Organization created!");
      }
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(OrganizationServices.parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, icon, placeholder, type = "text", rules }: any) => (
    <Controller
      control={form.control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <FormItem className="w-full">
          <ThemedInput label={label} icon={icon} type={type} placeholder={placeholder} {...field} />
          {error && <FormMessage className="text-[10px] text-red-500">{error.message}</FormMessage>}
        </FormItem>
      )}
    />
  );

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
        <div className="w-full max-w-3xl bg-white rounded shadow-md border border-gray-200 overflow-hidden font-mukta max-h-[90vh] flex flex-col">
          <ConfigProvider theme={{ token: { colorPrimary: primaryColor, borderRadius: 4 } }}>

            {/* ── Header (fixed) ── */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Building2 size={15} style={{ color: primaryColor }} />
                {isUpdate ? "Edit Organization" : "New Organization"}
              </h2>
              <button onClick={handleClose} className="text-red-500 hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 ">

                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4 scrollbar-hide">
                  {/* Logo */}
                  <div className="flex flex-col items-center pb-3 border-b border-dashed border-gray-200">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all"
                      style={{ borderColor: logoPreview ? primaryColor : "#e5e7eb" }}
                    >
                      {logoPreview
                        ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        : <Camera size={30} className="text-gray-300" />}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase">Organization Logo (Max 5MB)</p>
                  </div>

                  {/* Title + ContactNo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field name="title" label="Organization Title" placeholder="Enter title" icon={<Building2 size={12} />} />
                    <Field
                      name="contactNo"
                      label="Contact Number"
                      placeholder="98XXXXXXXX"
                      icon={<Phone size={12} />}
                      rules={{
                        pattern: { value: /^[0-9]{7,15}$/, message: "Must be exactly contact number" },
                      }}
                    />
                  </div>

                  {/* Address */}
                  <Field name="address" label="Address" placeholder="Full address" icon={<MapPin size={12} />} />

                  {/* Emails */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field name="email1" label="Primary Email" placeholder="info@org.com" icon={<Mail size={12} />} type="email" />
                    <Field name="email2" label="Secondary Email" placeholder="support@org.com" icon={<Mail size={12} />} type="email" />
                  </div>

                  {/* Website + Telephone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field name="website" label="Website" placeholder="https://example.com" icon={<Globe size={12} />} />
                    <Field
                      name="telephone_number"
                      label="Telephone Number"
                      placeholder="01XXXXXXX"
                      icon={<Phone size={12} />}
                      rules={{
                        pattern: { value: /^[0-9]{7,15}$/, message: "Invalid telephone number" },
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div className="w-full space-y-1">
                    <label className="text-[11px] font-medium text-gray-400 block">Description</label>
                    <Controller
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={3}
                          placeholder="Organization description..."
                          className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 resize-none"
                        />
                      )}
                    />
                  </div>

                  {/* Social Links */}
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-t pt-3">
                    Social Media Links
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field name="facebook_url" label="Facebook URL" placeholder="https://facebook.com/..." icon={<FaFacebook size={12} />} />
                    <Field name="twitter_url" label="Twitter URL" placeholder="https://twitter.com/..." icon={<BsTwitter size={12} />} />
                    <Field name="instagram_url" label="Instagram URL" placeholder="https://instagram.com/..." icon={<BsInstagram size={12} />} />
                    <Field name="linkdin_url" label="LinkedIn URL" placeholder="https://linkedin.com/..." icon={<LiaLinkedin size={12} />} />
                  </div>
                  <Field name="location_url" label="Google Maps Embed URL" placeholder="https://maps.google.com/embed?..." icon={<Link size={12} />} />
                </div>

                {/* ── Footer (fixed at bottom) ── */}
                <div className="flex justify-end gap-3 px-6 py-3 border-t border-gray-100 bg-white shrink-0">
                  <CancelButton onClick={handleClose} disabled={loading} />
                  <ThemedButton type="submit" size="sm" disabled={loading}>
                    <div className="flex items-center gap-2">
                      {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
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