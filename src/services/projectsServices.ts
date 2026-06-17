// import axiosInstance from "@/lib/config/axios.config";

// let projectsCache: any = null;

// interface GetDetailsArgs {
//   id?: string;
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// export const ProjectsServices = {
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
//     let url = "/projects/";
//     let queryParams = {};

//     if (typeof args === "string") {
//       url = `/projects/${args}/`;
//       queryParams = oldParams || {};
//     } else if (args && typeof args === "object") {
//       const { id, ...rest } = args;
//       if (id) url = `/projects/${id}/`;
//       queryParams = rest;
//     }

//     const res = await axiosInstance.get(url, { params: queryParams });
//     return res.data;
//   },

//   createDetails: async (data: FormData) => {
//     const res = await axiosInstance.post("/projects/", data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     projectsCache = null;
//     return res.data;
//   },

//   updateDetails: async (id: string, data: FormData) => {
//     const res = await axiosInstance.put(`/projects/${id}/`, data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     projectsCache = null;
//     return res.data;
//   },

//   deleteDetails: async (id: string) => {
//     const res = await axiosInstance.delete(`/projects/${id}/`);
//     projectsCache = null;
//     return res.data;
//   },

//   clearCache: () => {
//     projectsCache = null;
//   },
// };



import axiosInstance from "@/lib/config/axios.config";

let projectsCache: any = null;
let projectsCachePromise: Promise<any> | null = null; // ← Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const ProjectsServices = {
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
    let url = "/projects/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/projects/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/projects/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call (no id, no filters) ──
    const isBaseListCall = url === "/projects/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (projectsCache !== null) return projectsCache;
      if (projectsCachePromise !== null) return projectsCachePromise;

      projectsCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          projectsCache = res.data;
          projectsCachePromise = null;
          return projectsCache;
        })
        .catch((err) => {
          projectsCachePromise = null;
          throw err;
        });

      return projectsCachePromise;
    }

    // Non-base calls hit network directly
    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData) => {
    const res = await axiosInstance.post("/projects/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    ProjectsServices.clearCache();
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.patch(`/projects/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    ProjectsServices.clearCache();
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/projects/${id}/`);
    ProjectsServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    projectsCache = null;
    projectsCachePromise = null;
  },
};