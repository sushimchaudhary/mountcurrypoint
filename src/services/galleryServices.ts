// import axiosInstance from "@/lib/config/axios.config";

// let galleryCache: any = null;

// interface GetDetailsArgs {
//   id?: string;
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// export const GalleryServices = {
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
//     let url = "/gallery/";
//     let queryParams = {};

//     if (typeof args === "string") {
//       url = `/gallery/${args}/`;
//       queryParams = oldParams || {};
//     } else if (args && typeof args === "object") {
//       const { id, ...rest } = args;
//       if (id) url = `/gallery/${id}/`;
//       queryParams = rest;
//     }

//     const res = await axiosInstance.get(url, { params: queryParams });
//     return res.data;
//   },

//   createDetails: async (data: FormData) => {
//     const res = await axiosInstance.post("/gallery/", data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     galleryCache = null;
//     return res.data;
//   },

//   updateDetails: async (id: string, data: FormData) => {
//     const res = await axiosInstance.patch(`/gallery/${id}/`, data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     galleryCache = null;
//     return res.data;
//   },

//   deleteDetails: async (id: string) => {
//     const res = await axiosInstance.delete(`/gallery/${id}/`);
//     galleryCache = null;
//     return res.data;
//   },

//   clearCache: () => {
//     galleryCache = null;
//   },
// };



import axiosInstance from "@/lib/config/axios.config";

let galleryCache: any = null;
let galleryCachePromise: Promise<any> | null = null; // Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const GalleryServices = {
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
    let url = "/gallery/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/gallery/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/gallery/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/gallery/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (galleryCache !== null) return galleryCache;
      if (galleryCachePromise !== null) return galleryCachePromise;

      galleryCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          galleryCache = res.data;
          galleryCachePromise = null;
          return galleryCache;
        })
        .catch((err) => {
          galleryCachePromise = null;
          throw err;
        });

      return galleryCachePromise;
    }

    // Non-base calls hit network directly
    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData) => {
    const res = await axiosInstance.post("/gallery/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    GalleryServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.patch(`/gallery/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    GalleryServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/gallery/${id}/`);
    GalleryServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    galleryCache = null;
    galleryCachePromise = null;
  },
};