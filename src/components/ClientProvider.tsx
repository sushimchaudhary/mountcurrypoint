"use client";
import { ConfigProvider } from "antd"; 

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider>
       {children}
    </ConfigProvider>
  );
}