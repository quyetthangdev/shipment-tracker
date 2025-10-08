import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IEmployeeStore } from "@/types/employee.store.type";
import { AuditAction } from "@/types";
import { logAudit, getCurrentUser } from "@/lib/audit-logger";

export const useEmployeeStore = create<IEmployeeStore>()(
  persist(
    (set, get) => ({
      employees: [],

      addEmployee: (employee) => {
        set((state) => ({
          employees: [...state.employees, employee],
        }));

        // Log audit
        logAudit(AuditAction.CREATE_USER, "Tạo người dùng", {
          user: getCurrentUser(),
          target: employee.name,
          details: `Thêm người dùng mới: ${employee.name} (${employee.phone})`,
        });
      },

      removeEmployee: (id) => {
        const employee = get().employees.find((e) => e.id === id);

        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        }));

        // Log audit
        if (employee) {
          logAudit(AuditAction.DELETE_USER, "Xóa người dùng", {
            user: getCurrentUser(),
            target: employee.name,
            details: `Xóa người dùng: ${employee.name}`,
          });
        }
      },

      updateEmployee: (id, updatedData) => {
        const employee = get().employees.find((e) => e.id === id);

        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === id ? { ...e, ...updatedData } : e
          ),
        }));

        // Log audit
        if (employee) {
          logAudit(AuditAction.UPDATE_USER, "Cập nhật người dùng", {
            user: getCurrentUser(),
            target: employee.name,
            details: `Cập nhật thông tin người dùng: ${employee.name}`,
          });
        }
      },
    }),
    { name: "employee-storage" }
  )
);
