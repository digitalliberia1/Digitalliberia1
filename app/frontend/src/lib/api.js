import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export const fetchServices = () => api.get("/services").then((r) => r.data);
export const fetchService = (slug) => api.get(`/services/${slug}`).then((r) => r.data);
export const fetchInitiatives = (params = {}) =>
  api.get("/initiatives", { params }).then((r) => r.data);
export const fetchStats = () => api.get("/stats").then((r) => r.data);
export const submitContact = (payload) => api.post("/contact", payload).then((r) => r.data);
export const subscribeNewsletter = (payload) =>
  api.post("/newsletter", payload).then((r) => r.data);
