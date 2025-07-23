import { IShipment } from "./shipment.type"

export interface ICreatedShipmentStore {
  createdShipments: IShipment[]
  addCreatedShipment: (shipment: IShipment) => void
  removeCreatedShipment: (shipmentId: string) => void
  clearCreatedShipments: () => void
}