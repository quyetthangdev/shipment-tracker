import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores"
import { ROUTES } from "@/constants"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate(ROUTES.LOGIN, { replace: true })
        }
    }, [user, navigate])

    if (!user) {
        return <div>Redirecting to login...</div>
    }

    return <>{children}</>
}
