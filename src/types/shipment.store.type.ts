import { IShipment, IShipmentItem, ShipmentStatus } from "./shipment.type"

export interface IShipmentStore {
  shipments: IShipment[]
    activeShipmentId: string | null;
  setActiveShipmentId: (id: string) => void;
  setShipments: (shipments: IShipment[]) => void
  addShipment: (shipment: IShipment) => void
  addShipmentItem: (shipmentId: string, item: IShipmentItem) => void
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus) => void
  removeShipmentItem: (shipmentId: string, itemId: string) => void
  removeShipment: (shipmentId: string) => void
}
