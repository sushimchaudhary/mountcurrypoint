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

  getDetailsFresh: async (args: any = {}) => {
  // Always hits the network — never touches the base-list cache.
  const res = await axiosInstance.get("/orders/", { params: args });
  return res.data;
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

  updateDetails: async (id: string | number, data: any) => {
    OrderServices.clearCache();
    const res = await axiosInstance.patch(`/orders/${id}/`, data);
    return res.data;
  },

  deleteDetails: async (id: string | number) => {
    const res = await axiosInstance.delete(`/orders/${id}/`);
    OrderServices.clearCache();
    return res.data;
  },

  // ── New: Admin accepts a pending order ──────────────────────────────
  acceptOrder: async (id: string | number) => {
    OrderServices.clearCache();
    const res = await axiosInstance.post(`/orders/${id}/accept/`);
    return res.data; // { message, status }
  },

  // ── New: Customer/admin picks pay_now or pay_later ──────────────────
  selectPaymentChoice: async (
    id: string | number,
    payment_choice: "pay_now" | "pay_later"
  ) => {
    OrderServices.clearCache();
    const res = await axiosInstance.post(`/orders/${id}/payment-choice/`, {
      payment_choice,
    });
    return res.data; // { message, order_status, bill? }
  },

  // ── New: Customer appends more items to their still-open order ──────
  // items: [{ menu_item, selected_portion_id, quantity }]
  // Backend blocks this once the order is served / completed_settled / cancelled.
  appendItems: async (
    id: string | number,
    items: { menu_item: number; selected_portion_id: number; quantity: number }[]
  ) => {
    OrderServices.clearCache();
    const res = await axiosInstance.post(`/orders/${id}/append-items/`, { items });
    return res.data; // { message, order }
  },

  clearCache: () => {
    orderCache = null;
    orderCachePromise = null;
  },

  // ── New: Admin force-sets status directly ───────────────────────────
  setStatus: async (id: string | number, status: string) => {
    OrderServices.clearCache();
    const res = await axiosInstance.post(`/orders/${id}/set-status/`, { status });
    return res.data; // { message, status }
  },
};