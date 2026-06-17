
import axiosInstance from "@/lib/config/axios.config";

let chairmanCache: any = null;
let chairmanCachePromise: Promise<any> | null = null; // Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const ChairmanMessageServices = {
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
    let url = "/chairman-message/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/chairman-message/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/chairman-message/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/chairman-message/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (chairmanCache !== null) return chairmanCache;
      if (chairmanCachePromise !== null) return chairmanCachePromise;

      chairmanCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          chairmanCache = res.data;
          chairmanCachePromise = null;
          return chairmanCache;
        })
        .catch((err) => {
          chairmanCachePromise = null;
          throw err;
        });

      return chairmanCachePromise;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData) => {
    const res = await axiosInstance.post("/chairman-message/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    ChairmanMessageServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.patch(`/chairman-message/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    ChairmanMessageServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/chairman-message/${id}/`);
    ChairmanMessageServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    chairmanCache = null;
    chairmanCachePromise = null;
  },
};