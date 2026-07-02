

import axiosInstance from "@/lib/config/axios.config";

let contactCache: any = null;
let contactCachePromise: Promise<any> | null = null; // Promise caching को लागि

export const ContactServices = {
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

  getList: async (params?: any) => {
    // ── Only cache the base list call ──
    const isBaseListCall = !params || Object.keys(params).length === 0;

    if (isBaseListCall) {
      if (contactCache !== null) return contactCache;
      if (contactCachePromise !== null) return contactCachePromise;

      contactCachePromise = axiosInstance
        .get("/contacts/", { params })
        .then((res) => {
          contactCache = res.data;
          contactCachePromise = null;
          return contactCache;
        })
        .catch((err) => {
          contactCachePromise = null;
          throw err;
        });

      return contactCachePromise;
    }

    const res = await axiosInstance.get("/submit-contact/", { params });
    return res.data;
  },

  create: async (data: any) => {
    const res = await axiosInstance.post("/submit-contact/", data);
    ContactServices.clearCache();
    return res.data;
  },

  update: async (id: string, data?: any) => {
    const res = await axiosInstance.patch(`/contacts/${id}/`, data);
    ContactServices.clearCache();
    return res.data;
  },

  delete: async (id: string) => {
    const res = await axiosInstance.delete(`/contacts/${id}/`);
    ContactServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    contactCache = null;
    contactCachePromise = null;
  },
};