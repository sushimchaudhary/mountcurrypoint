// import axiosInstance from "@/lib/config/axios.config";

// export const TeamServices = {
//   parseError: (exception: any): string => {
//     if (exception.response?.data) {
//       const data = exception.response.data;
//       if (data.detail) return data.detail;
//       if (typeof data === "object") {
//         const firstKey = Object.keys(data)[0];
//         const firstError = data[firstKey];
//         return Array.isArray(firstError) ? `${firstKey}: ${firstError[0]}` : `${firstKey}: ${firstError}`;
//       }
//     }
//     return exception.message || "Something went wrong";
//   },

//   getDetails: async (args?: { id?: string } | string) => {
//     let url = "/team/";
//     if (typeof args === "string") url = `/team/${args}/`;
//     else if (args?.id) url = `/team/${args.id}/`;

//     const res = await axiosInstance.get(url);
//     return res.data;
//   },

//   createDetails: async (data: FormData) => {
//     const res = await axiosInstance.post("/team/", data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   },

//   updateDetails: async (id: string, data: FormData) => {
//     const res = await axiosInstance.put(`/team/${id}/`, data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   },

//   deleteDetails: async (id: string) => {
//     const res = await axiosInstance.delete(`/team/${id}/`);
//     return res.data;
//   },
// };


import axiosInstance from "@/lib/config/axios.config";

let teamCache: any = null;
let teamCachePromise: Promise<any> | null = null; // Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const TeamServices = {
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
    let url = "/team/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/team/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/team/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/team/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (teamCache !== null) return teamCache;
      if (teamCachePromise !== null) return teamCachePromise;

      teamCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          teamCache = res.data;
          teamCachePromise = null;
          return teamCache;
        })
        .catch((err) => {
          teamCachePromise = null;
          throw err;
        });

      return teamCachePromise;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData) => {
    const res = await axiosInstance.post("/team/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    TeamServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.patch(`/team/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    TeamServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/team/${id}/`);
    TeamServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    teamCache = null;
    teamCachePromise = null;
  },
};