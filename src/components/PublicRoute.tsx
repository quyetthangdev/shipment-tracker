import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores"
import { ROUTES } from "@/constants"
import { UserRole } from "@/types/auth.type"

interface PublicRouteProps {
    children: React.ReactNode
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            // Redirect based on user role
            if (user.role === UserRole.ADMIN) {
                console.log('PublicRoute: Redirecting admin to admin page')
                navigate(ROUTES.ADMIN, { replace: true })
            } else {
                console.log('PublicRoute: Redirecting user to dashboard')
                navigate(ROUTES.DASHBOARD, { replace: true })
            }
        }
    }, [user, navigate])

    if (user) {
        return <div>Redirecting...</div>
    }

    return <>{children}</>
}
