import { IAuditLog } from "./audit-log.type";

export interface IAuditLogStore {
  logs: IAuditLog[];
  addLog: (log: Omit<IAuditLog, "id" | "timestamp">) => void;
  clearLogs: () => void;
  getLogsByUser: (username: string) => IAuditLog[];
  getLogsByAction: (action: string) => IAuditLog[];
}
