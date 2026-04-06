import axios from "axios"

const baseURL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:3000"

const api = axios.create({
  baseURL,
  withCredentials: true
})

const normalizeError = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "An unexpected error occurred."

  return Promise.reject(new Error(message))
}

export const register = (payload) =>
  api
    .post("/api/auth/register", payload)
    .then((response) => response.data)
    .catch(normalizeError)

export const login = (payload) =>
  api
    .post("/api/auth/login", payload)
    .then((response) => response.data)
    .catch(normalizeError)

export const logout = () =>
  api
    .post("/api/auth/logout")
    .then((response) => response.data)
    .catch(normalizeError)

export const getMe = () =>
  api
    .get("/api/auth/get-me")
    .then((response) => response.data)
    .catch(normalizeError)
