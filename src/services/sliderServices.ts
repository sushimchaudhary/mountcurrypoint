// import axiosInstance from "@/lib/config/axios.config";

// let sliderCache: any = null;

// interface GetDetailsArgs {
//   id?: string;
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// export const SliderServices = {
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
//     let url = "/sliders/";
//     let queryParams = {};

//     if (typeof args === "string") {
//       url = `/sliders/${args}/`;
//       queryParams = oldParams || {};
//     } else if (args && typeof args === "object") {
//       const { id, ...rest } = args;
//       if (id) url = `/sliders/${id}/`;
//       queryParams = rest;
//     }

//     const res = await axiosInstance.get(url, { params: queryParams });
//     return res.data;
//   },

//   createDetails: async (data: FormData) => {
//     const res = await axiosInstance.post("/sliders/", data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     sliderCache = null;
//     return res.data;
//   },

//   updateDetails: async (id: string, data: FormData) => {
//     const res = await axiosInstance.put(`/sliders/${id}/`, data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     sliderCache = null;
//     return res.data;
//   },

//   deleteDetails: async (id: string) => {
//     const res = await axiosInstance.delete(`/sliders/${id}/`);
//     sliderCache = null;
//     return res.data;
//   },

//   clearCache: () => {
//     sliderCache = null;
//   },
// };


import axiosInstance from "@/lib/config/axios.config";

let sliderCache: any = null;
let sliderCachePromise: Promise<any> | null = null; // Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const SliderServices = {
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
    let url = "/sliders/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/sliders/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/sliders/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/sliders/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (sliderCache !== null) return sliderCache;
      if (sliderCachePromise !== null) return sliderCachePromise;

      sliderCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          sliderCache = res.data;
          sliderCachePromise = null;
          return sliderCache;
        })
        .catch((err) => {
          sliderCachePromise = null;
          throw err;
        });

      return sliderCachePromise;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData) => {
    const res = await axiosInstance.post("/sliders/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    SliderServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.patch(`/sliders/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    SliderServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/sliders/${id}/`);
    SliderServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    sliderCache = null;
    sliderCachePromise = null;
  },
};