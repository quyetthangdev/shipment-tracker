import { IShipment } from "./shipment.type"

export interface ICreatedShipmentStore {
  createdShipment?: IShipment
  setCreatedShipment: (shipment?: IShipment) => void
  removeCreatedShipment: (shipmentId: string) => void
}