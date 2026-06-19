// import axiosInstance from "@/lib/config/axios.config";
// import Cookies from "js-cookie";

// let userCache: any = null;

// // Argument type define gareko taaki UserTable ma error na-aaos
// interface GetDetailsArgs {
//   id?: string;
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// export const UserServices = {

//    login: async (credentials: any) => {
//     const response = await axiosInstance.post("/auth/login/", {
//       identifier: credentials.username,
//       password: credentials.password,
//     });
//     return response.data;
//   },

//   parseError: (exception: any): string => {
//     if (exception.response?.data) {
//       const data = exception.response.data;
//       if (data.detail) return data.detail;
//       if (data.message) return data.message;
//       if (typeof data === 'object') {
//         const firstKey = Object.keys(data)[0];
//         const firstError = data[firstKey];
//         return Array.isArray(firstError) 
//           ? `${firstKey}: ${firstError[0]}` 
//           : `${firstKey}: ${firstError}`;
//       }
//     }
//     return exception.message || "Something went wrong";
//   },

//   // FIXED: Object-based parameter support (UserTable ko error solve garna)
//   // FIXED: URL logic (id chha vane single user endpoint, xaina vane list)
//   getDetails: async (args?: GetDetailsArgs | string, oldParams?: any) => {
//     let url = "/auth/users/";
//     let queryParams = {};

//     if (typeof args === "string") {
//       url = `/auth/users/${args}/`;
//       queryParams = oldParams || {};
//     } else if (args && typeof args === "object") {
//       const { id, ...rest } = args;
//       if (id) url = `/auth/users/${id}/`;
//       queryParams = rest;
//     }

//     const res = await axiosInstance.get(url, { params: queryParams });
//     return res.data;
//   },

//   clearCache: () => {
//     userCache = null;
//   },

//   // FIXED: 401 Unauthorized solve garna header bypass thapeko
//   createDetails: async (data: FormData) => {
//     // access_token check garne (login garda save gareko key matching huna parcha)
//     const token = Cookies.get("access_token") || Cookies.get("token"); 

//     const res = await axiosInstance.post("/auth/register/", data, {
//       headers: { 
//         "Content-Type": "multipart/form-data",
//         // Forcefully token pathaune (Interceptors lai overwrite garna)
//         ...(token ? { "Authorization": `Bearer ${token}` } : { "Authorization": "" })
//       },
//     });

//     userCache = null;
//     return res.data;
//   },

//   updateDetails: async (id: string, data: FormData) => {
//     const res = await axiosInstance.put(`/auth/users/${id}/`, data, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     userCache = null;
//     return res.data;
//   },

//   deleteDetails: async (id: string) => {
//     const res = await axiosInstance.delete(`/auth/users/${id}/`);
//     userCache = null;
//     return res.data;
//   },
// };


import axiosInstance from "@/lib/config/axios.config";
import Cookies from "js-cookie";

let userCache: any = null;

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const UserServices = {

  // Accepts either an email or a username in the same field.
  // Backend expects the key "email" regardless of which one was typed —
  // Django's authentication backend can be configured to match against
  // either username or email using that single field.
  login: async (credentials: {
    identifier: string;
    password: string;
    recaptchaToken?: string;
  }) => {
    const response = await axiosInstance.post("/auth/login/", {
      email: credentials.identifier,       // ← backend requires "email" key
      password: credentials.password,
      recaptcha_token: credentials.recaptchaToken,
    });
    return response.data;
  },

  parseError: (exception: any): string => {
    if (exception.response?.data) {
      const data = exception.response.data;
      if (data.detail) return data.detail;
      if (data.message) return data.message;
      if (typeof data === 'object') {
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
    let url = "/auth/users/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/auth/users/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/auth/users/${id}/`;
      queryParams = rest;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  clearCache: () => {
    userCache = null;
  },

  createDetails: async (data: FormData) => {
    const token = Cookies.get("access_token") || Cookies.get("token"); 

    const res = await axiosInstance.post("/auth/register/", data, {
      headers: { 
        "Content-Type": "multipart/form-data",
        ...(token ? { "Authorization": `Bearer ${token}` } : { "Authorization": "" })
      },
    });

    userCache = null;
    return res.data;
  },

  updateDetails: async (id: string, data: FormData) => {
    const res = await axiosInstance.put(`/auth/users/${id}/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    userCache = null;
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/auth/users/${id}/`);
    userCache = null;
    return res.data;
  },
};