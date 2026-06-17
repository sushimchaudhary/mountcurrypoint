

import axiosInstance from "@/lib/config/axios.config";

let strategyCache: any = null;
let strategyCachePromise: Promise<any> | null = null; // Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const StrategyServices = {
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
    let url = "/strategy/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/strategy/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/strategy/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/strategy/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (strategyCache !== null) return strategyCache;
      if (strategyCachePromise !== null) return strategyCachePromise;

      strategyCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          strategyCache = res.data;
          strategyCachePromise = null;
          return strategyCache;
        })
        .catch((err) => {
          strategyCachePromise = null;
          throw err;
        });

      return strategyCachePromise;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData) => {
    const res = await axiosInstance.post("/strategy/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    StrategyServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.patch(`/strategy/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    StrategyServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/strategy/${id}/`);
    StrategyServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    strategyCache = null;
    strategyCachePromise = null;
  },
};