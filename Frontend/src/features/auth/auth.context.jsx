/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react"
import { getMe } from "./services/authApi"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)  // true rakho jab tak getMe complete ho

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                if (data?.user) {
                    setUser(data.user)  // sirf tab set karo jab user mile
                }
            } catch {
                setUser(null)  // Fixed: error aaye toh crash mat karo
            } finally {
                setLoading(false)  // hamesha loading false karo
            }
        }
        getAndSetUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}
