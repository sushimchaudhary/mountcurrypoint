import axiosInstance from "@/lib/config/axios.config";

let billCache: any = null;
let billCachePromise: Promise<any> | null = null;

export const BillServices = {
  parseError: (exception: any): string => {
    if (exception.response?.data) {
      const data = exception.response.data;
      if (data.detail) return data.detail;
      if (data.message) return data.message;
      if (data.error) return data.error;
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
    const url = "/bills/";
    const isBaseListCall = !args;
    if (isBaseListCall) {
      if (billCache !== null) return billCache;
      if (billCachePromise !== null) return billCachePromise;
      billCachePromise = axiosInstance.get(url).then((res) => {
        billCache = res.data;
        billCachePromise = null;
        return billCache;
      });
      return billCachePromise;
    }
    const res = await axiosInstance.get(url, { params: args });
    return res.data;
  },

  // POST — create/generate a bill for an order
  // Payload: { order_id, discount_percentage, vat_percentage, payment_method }
  createDetails: async (data: {
    order_id: number;
    discount_percentage?: number;
    vat_percentage?: number;
    payment_method?: string;
  }) => {
    BillServices.clearCache();
    const res = await axiosInstance.post("/bills/", data);
    return res.data;
  },

  // PATCH — mark as paid / change payment method
  updateDetails: async (id: string | number, data: any) => {
    BillServices.clearCache();
    const res = await axiosInstance.patch(`/bills/${id}/`, data);
    return res.data;
  },

  deleteDetails: async (id: string | number) => {
    const res = await axiosInstance.delete(`/bills/${id}/`);
    BillServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    billCache = null;
    billCachePromise = null;
  },
};