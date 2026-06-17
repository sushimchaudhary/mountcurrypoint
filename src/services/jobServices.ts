



import axiosInstance from "@/lib/config/axios.config";

let jobsCache: any = null;
let jobsCachePromise: Promise<any> | null = null; // Promise caching को लागि

interface GetDetailsArgs {
  id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const JobServices = {
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
    let url = "/jobs/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/jobs/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/jobs/${id}/`;
      queryParams = rest;
    }

    // ── Only cache the base list call ──
    const isBaseListCall = url === "/jobs/" && Object.keys(queryParams).length === 0;

    if (isBaseListCall) {
      if (jobsCache !== null) return jobsCache;
      if (jobsCachePromise !== null) return jobsCachePromise;

      jobsCachePromise = axiosInstance
        .get(url, { params: queryParams })
        .then((res) => {
          jobsCache = res.data;
          jobsCachePromise = null;
          return jobsCache;
        })
        .catch((err) => {
          jobsCachePromise = null;
          throw err;
        });

      return jobsCachePromise;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  createDetails: async (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    const res = await axiosInstance.post("/jobs/", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    JobServices.clearCache();
    return res.data;
  },

  updateDetails: async (slug: string, data: FormData | any) => {
    const res = await axiosInstance.patch(`/jobs/${slug}/`, data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    JobServices.clearCache();
    return res.data;
  },

  deleteDetails: async (slug: string) => {
    const res = await axiosInstance.delete(`/jobs/${slug}/`);
    JobServices.clearCache();
    return res.data;
  },

  clearCache: () => {
    jobsCache = null;
    jobsCachePromise = null;
  },
};

// Job Applications
export const JobApplicationServices = {
  getDetails: async (args?: GetDetailsArgs | string, oldParams?: any) => {
    let url = "/job-applications/";
    let queryParams = {};

    if (typeof args === "string") {
      url = `/job-applications/${args}/`;
      queryParams = oldParams || {};
    } else if (args && typeof args === "object") {
      const { id, ...rest } = args;
      if (id) url = `/job-applications/${id}/`;
      queryParams = rest;
    }

    const res = await axiosInstance.get(url, { params: queryParams });
    return res.data;
  },

  submitApplication: async (data: FormData) => {
    const res = await axiosInstance.post("/job-applications/", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  deleteDetails: async (id: string) => {
    const res = await axiosInstance.delete(`/job-applications/${id}/`);
    return res.data;
  },
};