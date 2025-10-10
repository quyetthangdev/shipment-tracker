import {
  IShipment,
  IShipmentItem,
  ShipmentStatus,
  IBilling,
  BillingStatus,
} from "./shipment.type";

export interface IShipmentStore {
  shipments: IShipment[];
  activeShipmentId: string | null;
  activeBillingId: string | null;
  setActiveShipmentId: (id: string) => void;
  setActiveBillingId: (id: string | null) => void;
  setShipments: (shipments: IShipment[]) => void;
  addShipment: (shipment: IShipment) => void;
  addBilling: (shipmentId: string, billing: IBilling) => void;
  addItemToBilling: (
    shipmentId: string,
    billingId: string,
    item: IShipmentItem
  ) => void;
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus) => void;
  updateBillingStatus: (
    shipmentId: string,
    billingId: string,
    status: BillingStatus
  ) => void;
  removeItemFromBilling: (
    shipmentId: string,
    billingId: string,
    itemId: string
  ) => void;
  removeBilling: (shipmentId: string, billingId: string) => void;
  removeShipment: (shipmentId: string) => void;
  // Legacy methods for backward compatibility
  addShipmentItem: (shipmentId: string, item: IShipmentItem) => void;
  removeShipmentItem: (shipmentId: string, itemId: string) => void;
}
