// utils/auth.ts

import { UserRole } from "@/types/auth.type"

export interface DemoUser {
  username: string
  password: string
  role: UserRole
}

const demoUsers: DemoUser[] = [
  { username: 'admin', password: '123456', role: UserRole.ADMIN },
  { username: 'user', password: '123456', role: UserRole.USER },
]

export function checkLogin(username: string, password: string) {
  const user = demoUsers.find(
    (u) => u.username === username && u.password === password
  )
  if (user) {
    return {
      success: true,
      user: { username: user.username, role: user.role },
    }
  } else {
    return { success: false }
  }
}
