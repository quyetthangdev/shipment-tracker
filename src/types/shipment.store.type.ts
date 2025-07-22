import { IShipment, IShipmentItem } from "./shipment.type"

export interface IShipmentStore {
  shipment?: IShipment
  setShipment: (shipment?: IShipment) => void
  addShipmentItem: (item: IShipmentItem) => void
  removeShipmentItem: (itemId: string) => void
  removeShipment: (shipmentId: string) => void
}