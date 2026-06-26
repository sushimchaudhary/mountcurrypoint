import axiosInstance from "@/lib/config/axios.config";

let orderCache: any = null;
let orderCachePromise: Promise<any> | null = null;

export const OrderServices = {
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

  getDetails: async (args?: any) => {
    const url = "/orders/";
    const isBaseListCall = !args;
    if (isBaseListCall) {
      if (orderCache !== null) return orderCache;
      if (orderCachePromise !== null) return orderCachePromise;
      orderCachePromise = axiosInstance.get(url).then((res) => {
        orderCache = res.data;
        orderCachePromise = null;
        return orderCache;
      });
      return orderCachePromise;
    }
    const res = await axiosInstance.get(url, { params: args });
    return res.data;
  },

  createDetails: async (data: any) => {
    const res = await axiosInstance.post("/orders/", data);
    OrderServices.clearCache();
    return res.data;
  },

  // ✅ FIX: clearCache() BEFORE the request so the next getDetails()
  //    fetches fresh data. Also returns the updated order from the response.
  updateDetails: async (id: string | number, data: any) => {
    OrderServices.clearCache();                          // bust cache first
    const res = await axiosInstance.patch(`/orders/${id}/`, data);
    return res.data;                                     // return fresh server data
  },

  deleteDetails: async (id: string | number) => {
    const res = await axiosInstance.delete(`/orders/${id}/`);
    OrderServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    orderCache = null;
    orderCachePromise = null;
  },
};