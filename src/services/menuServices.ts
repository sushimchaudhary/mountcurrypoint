



import axiosInstance from "@/lib/config/axios.config";

let menuCache: any = null;
let menuCachePromise: Promise<any> | null = null; // Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const MenuServices = {
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
    let url = "/menu/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/menu/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/menu/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/menu/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (menuCache !== null) return menuCache;
      if (menuCachePromise !== null) return menuCachePromise;

      menuCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          menuCache = res.data;
          menuCachePromise = null;
          return menuCache;
        })
        .catch((err) => {
          menuCachePromise = null;
          throw err;
        });

      return menuCachePromise;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const res = await axiosInstance.post("/menu/", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    MenuServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData | any) => {
    const res = await axiosInstance.patch(`/menu/${id}/`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    MenuServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/menu/${id}/`);
    MenuServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    menuCache = null;
    menuCachePromise = null;
  },
};

