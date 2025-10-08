import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IAuthStore, IAuthUser, UserRole } from "@/types/auth.type";
import { AuditAction } from "@/types";
import { logAudit } from "@/lib/audit-logger";

// Demo dữ liệu người dùng cố định
const demoUsers: Record<string, { password: string; role: UserRole }> = {
  admin: { password: "admin123", role: UserRole.ADMIN },
  user: { password: "user123", role: UserRole.USER },
};

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set, get) => ({
      user: null,

      login: (username, password) => {
        const account = demoUsers[username];
        if (account && account.password === password) {
          const user: IAuthUser = { username, role: account.role };
          set({ user });

          // Log audit
          logAudit(AuditAction.LOGIN, "Đăng nhập", {
            user: username,
            details: `Đăng nhập thành công với role ${account.role}`,
          });

          return true;
        }
        return false;
      },

      logout: () => {
        const currentUser = get().user?.username;

        set({ user: null });

        // Log audit
        if (currentUser) {
          logAudit(AuditAction.LOGOUT, "Đăng xuất", {
            user: currentUser,
            details: "Đăng xuất khỏi hệ thống",
          });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
