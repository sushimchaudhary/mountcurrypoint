"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginDTO } from "../../../types/authType";
import { Lock, User, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfigProvider, Checkbox } from "antd";
import { Form, FormItem, FormMessage } from "@/components/ui/form";
import { ThemedButton } from "@/components/ui/themedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { useTheme } from "@/lib/context/ThemeContext";
import { toast } from "sonner";
import axiosInstance from "../../../lib/config/axios.config";
import useAuth from "@/lib/hooks/useAuth";
import { clearAuthCookies, setAuthCookies } from "@/action/auth";
import Link from "next/link";
import Image from "next/image";
import { UserServices } from "@/services/userServices";

export default function LoginPage() {
  const router = useRouter();
  const { getLoggedInUser } = useAuth();
  const { primaryColor } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(LoginDTO),
    defaultValues: { identifier: "", password: "", remember: false },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await clearAuthCookies();
      
      const apiResponse = await UserServices.login({
        identifier: data.identifier,
        password: data.password
      });

      const token = apiResponse.access || apiResponse.token;
      const userData = apiResponse.user;

      if (!token) {
        throw new Error("Access token missing from backend response");
      }

      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      await setAuthCookies(token, userData, data.remember || false);
      
      if (getLoggedInUser) await getLoggedInUser();

      toast.success(<strong>Welcome back!</strong>);

      // Redirect Logic
      if (userData?.is_admin) {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
      
    } catch (error: any) {
      const errorMsg = UserServices.parseError(error);
      toast.error(<strong>Login failed !!</strong>, { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: primaryColor, borderRadius: 4, controlHeight: 40 } }}>
      <div className="bg-[#f5f6fa] p-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-100 bg-white rounded shadow-lg border border-gray-100 overflow-hidden">
          <div className="pt-5 pb-6 px-8 text-center">
            <div className="inline-flex items-center justify-center">
              <Image src="/image/arya.png" alt="logo" width={80} height={80} />
            </div>
            <h1 className="text-[24px] font-extrabold text-[#1e293b] tracking-tight mt-2">Welcome Back</h1>
            <p className="text-[12px] text-[#64748b] font-medium">Please enter your credentials.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-8 space-y-3">
              <Controller
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <ThemedInput 
                      label="Email or Username" 
                      placeholder="example@gmail.com or username" 
                      required 
                      icon={<User size={14} />} 
                      {...field} 
                    />
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="relative">
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <ThemedInput 
                        label="Password" 
                        placeholder="••••••••" 
                        required 
                        icon={<Lock size={14} />} 
                        type={showPass ? "text" : "password"} 
                        {...field} 
                      />
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-7.5 text-gray-400 hover:text-[#077942] transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between mt-1">
                <Controller
                  control={form.control}
                  name="remember"
                  render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox {...field} checked={!!value} onChange={(e) => onChange(e.target.checked)} className="text-[10px] font-semibold text-[#526484]">
                      Remember Me
                    </Checkbox>
                  )}
                />
                <Link href="/forgot-password" style={{ color: primaryColor }} className="text-[12px] font-semibold hover:underline italic">
                  Forgot Password?
                </Link>
              </div>

              <ThemedButton type="submit" disabled={isLoading} className="w-full mt-4 text-sm font-bold shadow-md">
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Authenticating...</> : <><LogIn size={16} /> Login</>}
              </ThemedButton>

              <p className="text-center text-[12px] text-gray-400 mt-4">© {new Date().getFullYear()} School Management System.</p>
            </form>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}