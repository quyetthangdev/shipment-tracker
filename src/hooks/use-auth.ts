import { useAuthStore } from '@/stores'
import { UserRole } from '@/types/auth.type'

export const useAuth = () => {
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)

  const isAuthenticated = !!user
  const isAdmin = user?.role === UserRole.ADMIN
  const isUser = user?.role === UserRole.USER

  return {
    user,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    isUser,
  }
}
