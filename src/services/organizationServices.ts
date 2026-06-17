// services/organizationServices.ts
import axiosInstance from "@/lib/config/axios.config";

let organizationCache: any = null;
let organizationCachePromise: Promise<any> | null = null; // ← key addition

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const OrganizationServices = {
  parseError: (exception: any): string => {
    if (exception.response?.data) {
      const data = exception.response.data;
      if (data.detail) return data.detail;
      if (data.message) return data.message;
      if (typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const firstError = data[firstKey];
        return Array.isArray(firstError)
          ? `${firstKey}: ${firstError[0]}`
          : `${firstKey}: ${firstError}`;
      }
    }
    return exception.message || "Something went wrong";
  },

  getDetails: async (args?: GetDetailsArgs | string, oldParams?: any) => {
    let url = "/organization/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/organization/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/organization/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call (no id, no filters) ──
    const isBaseListCall = url === "/organization/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      // Return cached data immediately if available
      if (organizationCache !== null) {
        return organizationCache;
      }

      // If a request is already in-flight, reuse the same promise
      // This prevents duplicate calls fired at the exact same moment
      if (organizationCachePromise !== null) {
        return organizationCachePromise;
      }

      // First caller: fire the real request and cache the promise
      organizationCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          organizationCache = res.data;       // store result
          organizationCachePromise = null;    // clear in-flight promise
          return organizationCache;
        })
        .catch((err) => {
          organizationCachePromise = null;    // clear on error so next call retries
          throw err;
        });

      return organizationCachePromise;
    }

    // Non-base calls (by id, search, etc.) always hit the network
    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData) => {
    const res = await axiosInstance.post("/organization/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    organizationCache = null;         // invalidate cache after write
    organizationCachePromise = null;
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.patch(`/organization/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    organizationCache = null;
    organizationCachePromise = null;
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/organization/${id}/`);
    organizationCache = null;
    organizationCachePromise = null;
    return res.data;
  },

  clearCache: () => {
    organizationCache = null;
    organizationCachePromise = null;
  },
};