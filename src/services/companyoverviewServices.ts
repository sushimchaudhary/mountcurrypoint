// import axiosInstance from "@/lib/config/axios.config";

// let overviewCache: any = null;

// interface GetDetailsArgs {
//   id?: string;
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// export const CompanyOverviewServices = {
//   parseError: (exception: any): string => {
//     if (exception.response?.data) {
//       const data = exception.response.data;
//       if (data.detail) return data.detail;
//       if (data.message) return data.message;
//       if (typeof data === "object") {
//         const firstKey = Object.keys(data)[0];
//         const firstError = data[firstKey];
//         return Array.isArray(firstError)
//           ? `${firstKey}: ${firstError[0]}`
//           : `${firstKey}: ${firstError}`;
//       }
//     }
//     return exception.message || "Something went wrong";
//   },

//   getDetails: async (args?: GetDetailsArgs | string, oldParams?: any) => {
//     let url = "/overview/";
//     let queryParams = {};

//     if (typeof args === "string") {
//       url = `/overview/${args}/`;
//       queryParams = oldParams || {};
//     } else if (args && typeof args === "object") {
//       const { id, ...rest } = args;
//       if (id) url = `/overview/${id}/`;
//       queryParams = rest;
//     }

//     const res = await axiosInstance.get(url, { params: queryParams });
//     return res.data;
//   },

//   createDetails: async (data: FormData) => {
//     const res = await axiosInstance.post("/overview/", data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     overviewCache = null;
//     return res.data;
//   },

//   updateDetails: async (id: string, data: FormData) => {
//     const res = await axiosInstance.put(`/overview/${id}/`, data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     overviewCache = null;
//     return res.data;
//   },

//   deleteDetails: async (id: string) => {
//     const res = await axiosInstance.delete(`/overview/${id}/`);
//     overviewCache = null;
//     return res.data;
//   },

//   clearCache: () => {
//     overviewCache = null;
//   },
// };



import axiosInstance from "@/lib/config/axios.config";

let overviewCache: any = null;
let overviewCachePromise: Promise<any> | null = null; // Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const CompanyOverviewServices = {
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
    let url = "/overview/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/overview/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/overview/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/overview/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (overviewCache !== null) return overviewCache;
      if (overviewCachePromise !== null) return overviewCachePromise;

      overviewCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          overviewCache = res.data;
          overviewCachePromise = null;
          return overviewCache;
        })
        .catch((err) => {
          overviewCachePromise = null;
          throw err;
        });

      return overviewCachePromise;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData) => {
    const res = await axiosInstance.post("/overview/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    CompanyOverviewServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.patch(`/overview/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    CompanyOverviewServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/overview/${id}/`);
    CompanyOverviewServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    overviewCache = null;
    overviewCachePromise = null;
  },
};