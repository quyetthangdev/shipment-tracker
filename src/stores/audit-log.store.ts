import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IAuditLogStore } from "@/types/audit-log.store.type";

export const useAuditLogStore = create<IAuditLogStore>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (log) => {
        const newLog = {
          ...log,
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          logs: [newLog, ...state.logs], // Thêm vào đầu để log mới nhất ở trên
        }));
      },

      clearLogs: () => set({ logs: [] }),

      getLogsByUser: (username) => {
        return get().logs.filter((log) => log.user === username);
      },

      getLogsByAction: (action) => {
        return get().logs.filter((log) => log.action === action);
      },
    }),
    { name: "audit-log-storage" }
  )
);
