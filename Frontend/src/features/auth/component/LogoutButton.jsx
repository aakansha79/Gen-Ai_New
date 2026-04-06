import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const LogoutButton = () => {
  const navigate = useNavigate()
  const { handleLogout } = useAuth()
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleClick = async () => {
    setError("")
    setSubmitting(true)
    const result = await handleLogout()
    setSubmitting(false)

    if (result.success) {
      navigate("/login")
      return
    }

    setError(result.error || "Failed to log out. Please try again.")
  }

  return (
    <div className="logout-control">
      <button
        type="button"
        className="button logout-button"
        onClick={handleClick}
        disabled={submitting}
      >
        {submitting ? "Logging out…" : "Logout"}
      </button>
      {error && <p className="logout-error">{error}</p>}
    </div>
  )
}

export default LogoutButton
