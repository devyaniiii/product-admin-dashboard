import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10000, 
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
       if (window.location.pathname !== "/login") {
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- this runs inside an Axios interceptor, outside any React component, so useRouter() isn't available here. A full page navigation is intentional: it also clears any stale in-memory app state after a forced logout.
  window.location.href = "/login";
}
      }
    }
    return Promise.reject(error);
  }
);

export default api;