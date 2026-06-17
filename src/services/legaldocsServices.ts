// import axiosInstance from "@/lib/config/axios.config";

// let legalDocsCache: any = null;

// interface GetDetailsArgs {
//   id?: string;
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// export const LegalDocsServices = {
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
//     let url = "/legal-docs/";
//     let queryParams = {};

//     if (typeof args === "string") {
//       url = `/legal-docs/${args}/`;
//       queryParams = oldParams || {};
//     } else if (args && typeof args === "object") {
//       const { id, ...rest } = args;
//       if (id) url = `/legal-docs/${id}/`;
//       queryParams = rest;
//     }

//     const res = await axiosInstance.get(url, { params: queryParams });
//     return res.data;
//   },

//   createDetails: async (data: FormData) => {
//     const res = await axiosInstance.post("/legal-docs/", data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     legalDocsCache = null;
//     return res.data;
//   },

//   updateDetails: async (id: string, data: FormData) => {
//     const res = await axiosInstance.put(`/legal-docs/${id}/`, data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     legalDocsCache = null;
//     return res.data;
//   },

//   deleteDetails: async (id: string) => {
//     const res = await axiosInstance.delete(`/legal-docs/${id}/`);
//     legalDocsCache = null;
//     return res.data;
//   },

//   clearCache: () => {
//     legalDocsCache = null;
//   },
// };



import axiosInstance from "@/lib/config/axios.config";

let legalDocsCache: any = null;
let legalDocsCachePromise: Promise<any> | null = null; // Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const LegalDocsServices = {
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
    let url = "/legal-docs/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/legal-docs/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/legal-docs/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/legal-docs/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (legalDocsCache !== null) return legalDocsCache;
      if (legalDocsCachePromise !== null) return legalDocsCachePromise;

      legalDocsCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          legalDocsCache = res.data;
          legalDocsCachePromise = null;
          return legalDocsCache;
        })
        .catch((err) => {
          legalDocsCachePromise = null;
          throw err;
        });

      return legalDocsCachePromise;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData) => {
    const res = await axiosInstance.post("/legal-docs/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    LegalDocsServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.patch(`/legal-docs/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    LegalDocsServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/legal-docs/${id}/`);
    LegalDocsServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    legalDocsCache = null;
    legalDocsCachePromise = null;
  },
};