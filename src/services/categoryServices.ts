import axiosInstance from "@/lib/config/axios.config";

let categoryCache: any = null;
let categoryCachePromise: Promise<any> | null = null;

export const CategoryServices = {
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
    let url = "/categories/"; // Ensure this matches your router path
    // ... logic for ID vs List ...
    
    // Cache logic
    const isBaseListCall = url === "/categories/" && !args;
    if (isBaseListCall) {
        if (categoryCache !== null) return categoryCache;
        if (categoryCachePromise !== null) return categoryCachePromise;

        categoryCachePromise = axiosInstance.get(url).then((res) => {
            categoryCache = res.data;
            categoryCachePromise = null;
            return categoryCache;
        });
        return categoryCachePromise;
    }
    const res = await axiosInstance.get(url, { params: args });
    return res.data;
  },

  createDetails: async (data: FormData | any) => {
    const res = await axiosInstance.post("/categories/", data);
    CategoryServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData | any) => {
    const res = await axiosInstance.patch(`/categories/${id}/`, data);
    CategoryServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/categories/${id}/`);
    CategoryServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    categoryCache = null;
    categoryCachePromise = null;
  },
};