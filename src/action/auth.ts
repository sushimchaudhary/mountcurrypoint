"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function setAuthCookies(token: string, userData: object, remember: boolean) {
  const cookieStore = await cookies();
  const maxAge = remember ? 7 * 24 * 60 * 60 : 24 * 60 * 60;

  // नाम 'access_token' प्रयोग गर्नुहोस्
  cookieStore.set("access_token", token, {
    maxAge,
    path: "/",
    httpOnly: true, // सुरक्षाको लागि true राख्नुहोस्
    secure: process.env.NODE_ENV === "production",
  });

  cookieStore.set("user_info", JSON.stringify(userData), {
    maxAge,
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set("access_token", "", { path: "/", maxAge: 0 });
  cookieStore.set("refresh_token", "", { path: "/", maxAge: 0 });
  cookieStore.set("user_info", "", { path: "/", maxAge: 0 });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  // यहाँ पनि 'access_token' नै प्रयोग गर्नुहोस्
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("user_info");
  redirect("/login");
}