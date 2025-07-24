import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores"
import { ROUTES } from "@/constants"

interface PublicRouteProps {
    children: React.ReactNode
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate(ROUTES.DASHBOARD, { replace: true })
        }
    }, [user, navigate])

    if (user) {
        return <div>Redirecting to dashboard...</div>
    }

    return <>{children}</>
}
