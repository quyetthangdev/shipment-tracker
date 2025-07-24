import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IAuthStore, IAuthUser, UserRole } from '@/types/auth.type'

// Demo dữ liệu người dùng cố định
const demoUsers: Record<string, { password: string; role: UserRole }> = {
  admin: { password: 'admin123', role: UserRole.ADMIN },
  user: { password: 'user123', role: UserRole.USER },
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set) => ({
      user: null,

      login: (username, password) => {
        const account = demoUsers[username]
        if (account && account.password === password) {
          const user: IAuthUser = { username, role: account.role }
          set({ user })
          return true
        }
        return false
      },

      logout: () => {
        set({ user: null })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
