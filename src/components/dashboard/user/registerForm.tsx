"use client";

import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { User, Mail, Phone, MapPin, Camera, Loader2, Save, X } from "lucide-react";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import { UserServices } from "@/services/userServices";

interface IRegisterForm {
  email: string;
  fullname: string;
  phone_no: string;
  address: string;
  image?: any;
  password?: string; // registration को लागि
}

export default function UserRegistrationForm({ onSuccess, onClose, isOpen }: any) {
  const { primaryColor } = useTheme();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<IRegisterForm>({
    defaultValues: { email: "", fullname: "", phone_no: "", address: "", image: null, password: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: IRegisterForm) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => { if (k !== "image" && v) fd.append(k, v); });
      if (values.image instanceof File) fd.append("image", values.image);
      
      await UserServices.createDetails(fd);
      toast.success("User registered successfully!");
      onSuccess?.();
      form.reset();
    } catch (err: any) {
      toast.error(UserServices.parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, icon, placeholder, type = "text" }: any) => (
    <Controller control={form.control} name={name} render={({ field }) => (
      <FormItem className="w-full">
        <ThemedInput label={label} icon={icon} type={type} placeholder={placeholder} {...field} />
        <FormMessage className="text-[10px]" />
      </FormItem>
    )} />
  );

  return (
    <div className={`fixed inset-0 z-[101] flex items-center justify-center p-4 ${isOpen ? "" : "hidden"}`}>
      <div className="w-full max-w-lg bg-white rounded shadow-lg p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold">Register User</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="flex justify-center mb-4">
              <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden">
                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Camera size={24} />}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>

            <Field name="fullname" label="Full Name" icon={<User size={14}/>} placeholder="John Doe" />
            <Field name="email" label="Email Address" icon={<Mail size={14}/>} placeholder="example@mail.com" type="email" />
            <Field name="password" label="Password" icon={<User size={14}/>} placeholder="******" type="password" />
            <Field name="phone_no" label="Phone Number" icon={<Phone size={14}/>} placeholder="98xxxxxxxx" />
            <Field name="address" label="Address" icon={<MapPin size={14}/>} placeholder="Kathmandu, Nepal" />

            <ThemedButton type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Register"}
            </ThemedButton>
          </form>
        </Form>
      </div>
    </div>
  );
}