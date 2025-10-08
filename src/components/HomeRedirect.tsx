import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores"
import { ROUTES } from "@/constants"
import { UserRole } from "@/types/auth.type"

export const HomeRedirect = () => {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate(ROUTES.LOGIN, { replace: true })
        } else if (user.role === UserRole.ADMIN) {
            navigate(ROUTES.ADMIN, { replace: true })
        } else {
            navigate(ROUTES.DASHBOARD, { replace: true })
        }
    }, [user, navigate])

    return <div>Redirecting...</div>
}

