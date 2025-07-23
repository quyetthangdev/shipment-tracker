import { IBase } from "./base.type"

export enum ShipmentStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

export interface IShipment extends IBase {
    id?: string // barcode or unique identifier
    name?: string
    trackingNumber?: string
    items: IShipmentItem[]
    status?: ShipmentStatus
    origin?: string
    destination?: string
    creator?: string
}
    
export interface IShipmentItem {
    id: string // unique identifier for the item - QR code
    createdAt: string // ISO date string
    creator: string // user who created the item
}

export interface IShipmentToExport {
    logoString: string
    id: string
    slug: string
    name?: string
    trackingNumber?: string
    items: IShipmentItem[]
    status?: ShipmentStatus
    origin?: string
    destination?: string
    creator?: string
    createdAt: string // ISO date string
}