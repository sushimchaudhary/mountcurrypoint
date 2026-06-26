import axiosInstance from "@/lib/config/axios.config";

let tableCache: any = null;
let tableCachePromise: Promise<any> | null = null;

export const TableServices = {
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
    const url = "/tables/";

    const isBaseListCall = !args;
    if (isBaseListCall) {
      if (tableCache !== null) return tableCache;
      if (tableCachePromise !== null) return tableCachePromise;

      tableCachePromise = axiosInstance.get(url).then((res) => {
        tableCache = res.data;
        tableCachePromise = null;
        return tableCache;
      });
      return tableCachePromise;
    }

    const res = await axiosInstance.get(url, { params: args });
    return res.data;
  },

  createDetails: async (data: { table_number: string }) => {
    const res = await axiosInstance.post("/tables/", data);
    TableServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string | number, data: { table_number: string }) => {
    const res = await axiosInstance.patch(`/tables/${id}/`, data);
    TableServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string | number) => {
    const res = await axiosInstance.delete(`/tables/${id}/`);
    TableServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    tableCache = null;
    tableCachePromise = null;
  },
};