import { IBase } from "./base.type";

export enum ShipmentStatus {
  IN_PROGRESS = "in_progress", // ĐANG QUÉT
  COMPLETED = "completed", // ĐÃ TẠO Shipment
  CANCELLED = "cancelled", // HỦY
}

export enum BillingStatus {
  SCANNING = "scanning", // ĐANG QUÉT
  COMPLETED = "completed", // ĐÃ HOÀN THÀNH
}

export interface IShipment extends IBase {
  id?: string; // barcode or unique identifier
  name?: string;
  trackingNumber?: string;
  billings: IBilling[]; // Một shipment có nhiều billing
  status?: ShipmentStatus;
  origin?: string;
  destination?: string;
  creator?: string;
}

export interface IBilling {
  id: string; // Billing number - 10 ký tự
  items: IShipmentItem[]; // Các sản phẩm trong billing này
  status: BillingStatus;
  createdAt: string; // ISO date string
  creator: string; // user who created the billing
}

export interface IShipmentItem {
  id: string; // unique identifier for the item - QR code
  createdAt: string; // ISO date string
  creator: string; // user who created the item
}

export interface IShipmentToExport {
  logoString: string;
  id: string;
  slug: string;
  name?: string;
  trackingNumber?: string;
  billings: IBilling[];
  status?: ShipmentStatus;
  origin?: string;
  destination?: string;
  creator?: string;
  createdAt: string; // ISO date string
}
