import axiosInstance from "@/lib/config/axios.config";

let noticeCache: any = null;
let noticeCachePromise: Promise<any> | null = null;

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const NoticeServices = {
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
    let url = "/notices/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/notices/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/notices/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/notices/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (noticeCache !== null) return noticeCache;
      if (noticeCachePromise !== null) return noticeCachePromise;

      noticeCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          noticeCache = res.data;
          noticeCachePromise = null;
          return noticeCache;
        })
        .catch((err) => {
          noticeCachePromise = null;
          throw err;
        });

      return noticeCachePromise;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const res = await axiosInstance.post("/notices/", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    NoticeServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData | any) => {
    const res = await axiosInstance.patch(`/notices/${id}/`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    NoticeServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/notices/${id}/`);
    NoticeServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    noticeCache = null;
    noticeCachePromise = null;
  },
};