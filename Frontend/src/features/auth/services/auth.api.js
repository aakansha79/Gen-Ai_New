/* eslint-disable */
import axios from "axios"

const api = axios.create({
    baseURL: "https://your-backend.onrender.com",
    withCredentials: true
})

// Fixed: 'user' → 'username' (backend username expect karta hai)
export async function register({ username, email, password }) {
    try {
        const response = await api.post("/api/auth/register", {
            username, email, password   // Fixed: 'user' → 'username'
        })
        return response.data
    } catch (err) {
        throw err   // Fixed: throw karo taaki UI mein error show ho
    }
}

export async function login({ email, password }) {
    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        throw err   // Fixed: throw karo
    }
}

// Fixed: GET → POST (humne backend mein logout POST kiya tha)
export async function logout() {
    try {
        const response = await api.post("/api/auth/logout")  // Fixed: GET → POST
        return response.data
    } catch (err) {
        throw err   // Fixed: empty catch tha, throw karo
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        throw err
    }
}
