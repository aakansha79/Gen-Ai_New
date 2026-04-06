import { useContext } from "react";
import { AuthContext } from "../auth.context"
import { login, register, logout, getMe } from "../services/auth.api"

const buildResult = (success, error) => ({
  success,
  error: error ?? undefined
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider")
  }

  const { user, setUser, loading, setLoading } = context

  const handleLogin = async (payload) => {
    setLoading(true)
    try {
      const data = await login(payload)
      setUser(data.user)
      return buildResult(true)
    } catch (error) {
      setUser(null)
      return buildResult(false, error?.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (payload) => {
    setLoading(true)
    try {
      const data = await register(payload)
      setUser(data.user)
      return buildResult(true)
    } catch (error) {
      setUser(null)
      return buildResult(false, error?.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      setUser(null)
      return buildResult(true)
    } catch (error) {
      setUser(null)
      return buildResult(false, error?.message)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, handleRegister, handleLogin, handleLogout, getMe }
}
