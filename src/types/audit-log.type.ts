export enum AuditAction {
  LOGIN = "login",
  LOGOUT = "logout",
  CREATE_USER = "create_user",
  UPDATE_USER = "update_user",
  DELETE_USER = "delete_user",
  CREATE_SHIPMENT = "create_shipment",
  UPDATE_SHIPMENT = "update_shipment",
  DELETE_SHIPMENT = "delete_shipment",
}

export interface IAuditLog {
  id: string;
  action: AuditAction;
  actionLabel: string;
  user: string;
  target?: string;
  timestamp: string;
  ipAddress?: string;
  details?: string;
}
