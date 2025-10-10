import { AuditAction } from "@/types";

// Helper để log audit, tránh circular dependency
export const logAudit = (
  action: AuditAction,
  actionLabel: string,
  options: {
    user?: string;
    target?: string;
    ipAddress?: string;
    details?: string;
  }
) => {
  // Dynamic import để tránh circular dependency
  import("@/stores/audit-log.store").then(({ useAuditLogStore }) => {
    useAuditLogStore.getState().addLog({
      action,
      actionLabel,
      user: options.user || "Unknown",
      target: options.target,
      ipAddress: options.ipAddress || "Local",
      details: options.details,
    });
  });
};

export const getCurrentUser = (): string => {
  // Lấy từ localStorage thay vì dynamic import
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.user?.username || "Unknown";
    }
    return "Unknown";
  } catch {
    return "Unknown";
  }
};
