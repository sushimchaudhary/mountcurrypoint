

"use client";

import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { type IAuthContext, type IUser, type ICredentials } from "../../types/authType";
import Cookies from "js-cookie";
import axiosInstance from "../config/axios.config";

const AuthContext = createContext<IAuthContext>({
  login: async () => {},
  getLoggedInUser: async () => {},
  loggedInUser: null,
  user: null,
  loading: true,
});

// ─── Helper: fetch role-specific profile and merge into base user ─────────────
//
// Available dashboard endpoints (from your services):
//   /profile/teachers/my_dashboard/  → { teacher: { id, name, email, code, photo }, assignments: [] }
//   /profile/students/my_dashboard/  → { student: { id, name, … }, enrollments: [] }
//   /profile/staffs/my_dashboard/    → { staff:   { id, name, designation, … }, … }
//
// We call the right one based on the role stored in the base user cookie.

const enrichUserWithProfile = async (baseUser: IUser): Promise<IUser> => {
  const role = (baseUser.role || "").toLowerCase();

  try {
    if (role === "teacher") {
      const res = await axiosInstance.get("/profile/teachers/my_dashboard/");
      return { ...baseUser, teacher: res.data?.teacher ?? null };
    }

    if (role === "student") {
      const res = await axiosInstance.get("/profile/students/my_dashboard/");
      return { ...baseUser, student: res.data?.student ?? null };
    }

    if (role === "staff") {
      const res = await axiosInstance.get("/profile/staffs/my_dashboard/");
      return { ...baseUser, staff: res.data?.staff ?? null };
    }
  } catch (err) {
    // Profile fetch failed — still return base user so app doesn't break
    console.warn("Profile dashboard fetch failed:", err);
  }

  // Admin / superadmin / unknown role — no extra profile needed
  return baseUser;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loggedInUser, setLoggedInUser] = useState<IUser | null>(null);
  const [loading, setLoading]           = useState(true);

  // ── getLoggedInUser ──────────────────────────────────────────────────────
  // Strategy:
  //   1. Read base user from cookie (set during login)
  //   2. If we have a valid base user, fetch + merge role-specific profile
  //   3. Update state and cookie with enriched user
  //   4. If cookie is empty/invalid, user is not logged in

  const getLoggedInUser = useCallback(async () => {
    setLoading(true);
    try {
      const raw = Cookies.get("user_info");
      if (!raw) {
        setLoggedInUser(null);
        return;
      }

      const baseUser: IUser = JSON.parse(raw);

      // Only re-fetch profile if we don't have it yet (avoids duplicate calls)
      const alreadyEnriched =
        (baseUser.role === "teacher" && baseUser.teacher?.id != null) ||
        (baseUser.role === "student" && baseUser.student?.id != null) ||
        (baseUser.role === "staff"   && baseUser.staff?.id   != null) ||
        baseUser.role === "admin"    ||
        baseUser.role === "superadmin";

      const enriched = alreadyEnriched
        ? baseUser
        : await enrichUserWithProfile(baseUser);

      setLoggedInUser(enriched);
      Cookies.set("user_info", JSON.stringify(enriched), { expires: 7 });

    } catch (err) {
      console.error("getLoggedInUser failed:", err);
      setLoggedInUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── login ────────────────────────────────────────────────────────────────
  // After login the API returns the base user (role, name, email, id, etc.)
  // We immediately enrich it with the profile and store in cookie.

  const login = async (credentials: ICredentials) => {
    const res = await axiosInstance.post("/auth/login/", {
      identifier: credentials.username,
      password:   credentials.password,
    });

    const data = res.data;

    // Save tokens
    if (data.access)  Cookies.set("access_token",  data.access,  { expires: 7 });
    if (data.refresh) Cookies.set("refresh_token", data.refresh, { expires: 7 });

    // Extract base user — adjust key names to match your login response shape
    // Common shapes: data.user | data.data | data itself
    const baseUser: IUser = data.user ?? data.data ?? data;

    // Save base user immediately so cookie is never empty
    Cookies.set("user_info", JSON.stringify(baseUser), { expires: 7 });

    // Enrich with profile (teacher id, student id, staff id, etc.)
    const enriched = await enrichUserWithProfile(baseUser);
    setLoggedInUser(enriched);
    Cookies.set("user_info", JSON.stringify(enriched), { expires: 7 });

    return enriched;
  };

  useEffect(() => {
    getLoggedInUser();
  }, [getLoggedInUser]);

  return (
    <AuthContext.Provider
      value={{
        login,
        getLoggedInUser,
        loggedInUser,
        user: loggedInUser,
        loading,
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center h-screen">Loading..</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;