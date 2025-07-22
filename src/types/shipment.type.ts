import { IBase } from "./base.type"

export interface IShipment extends IBase {
    id?: string // barcode or unique identifier
    name?: string
    trackingNumber?: string
    items?: IShipmentItem[]
    status?: string
    origin?: string
    destination?: string
    creator?: string
}
    
export interface IShipmentItem {
    id: string // unique identifier for the item - QR code
    createdAt: string // ISO date string
    creator: string // user who created the item
}