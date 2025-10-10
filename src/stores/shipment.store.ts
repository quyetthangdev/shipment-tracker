import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  IShipmentStore,
  ShipmentStatus,
  BillingStatus,
  AuditAction,
} from "@/types";
import { logAudit, getCurrentUser } from "@/lib/audit-logger";

export const useShipmentStore = create<IShipmentStore>()(
  persist(
    (set, get) => ({
      shipments: [],
      activeShipmentId: null,
      activeBillingId: null,

      setActiveShipmentId: (id) => set({ activeShipmentId: id }),
      setActiveBillingId: (id) => set({ activeBillingId: id }),

      setShipments: (shipments) => set({ shipments }),

      addShipment: (newShipment) => {
        const exists = get().shipments.some((s) => s.id === newShipment.id);
        if (exists) return;

        set((state) => ({
          shipments: [...state.shipments, newShipment],
        }));

        // Log audit
        logAudit(AuditAction.CREATE_SHIPMENT, "Tạo Shipment", {
          user: getCurrentUser(),
          target: newShipment.id,
          details: `Tạo Shipment mới: ${newShipment.id}`,
        });
      },

      addBilling: (shipmentId, billing) => {
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === shipmentId
              ? {
                  ...s,
                  billings: s.billings?.some((b) => b.id === billing.id)
                    ? s.billings
                    : [...(s.billings ?? []), billing],
                }
              : s
          ),
        }));

        // Log audit
        logAudit(AuditAction.CREATE_SHIPMENT, "Thêm billing", {
          user: getCurrentUser(),
          target: billing.id,
          details: `Thêm billing ${billing.id} vào Shipment ${shipmentId}`,
        });
      },

      addItemToBilling: (shipmentId, billingId, item) =>
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === shipmentId
              ? {
                  ...s,
                  billings:
                    s.billings?.map((b) =>
                      b.id === billingId
                        ? {
                            ...b,
                            items: b.items?.some((i) => i.id === item.id)
                              ? b.items
                              : [...(b.items ?? []), item],
                          }
                        : b
                    ) ?? [],
                }
              : s
          ),
        })),

      updateShipmentStatus: (shipmentId, status: ShipmentStatus) =>
        set((state) => {
          const shipmentExists = state.shipments.some(
            (s) => s.id === shipmentId
          );
          if (!shipmentExists) return state;

          return {
            shipments: state.shipments.map((s) =>
              s.id === shipmentId
                ? {
                    ...s,
                    status,
                    // Nếu shipment completed, set tất cả billings thành completed
                    billings:
                      status === ShipmentStatus.COMPLETED
                        ? s.billings?.map((b) => ({
                            ...b,
                            status: BillingStatus.COMPLETED,
                          }))
                        : s.billings,
                  }
                : s
            ),
          };
        }),

      updateBillingStatus: (shipmentId, billingId, status: BillingStatus) =>
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === shipmentId
              ? {
                  ...s,
                  billings:
                    s.billings?.map((b) =>
                      b.id === billingId ? { ...b, status } : b
                    ) ?? [],
                }
              : s
          ),
        })),

      removeItemFromBilling: (shipmentId, billingId, itemId) => {
        console.log("Removing item:", itemId, "from billing:", billingId);
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === shipmentId
              ? {
                  ...s,
                  billings:
                    s.billings?.map((b) =>
                      b.id === billingId
                        ? {
                            ...b,
                            items:
                              b.items?.filter((i) => i.id !== itemId) ?? [],
                          }
                        : b
                    ) ?? [],
                }
              : s
          ),
        }));
      },

      removeBilling: (shipmentId, billingId) => {
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === shipmentId
              ? {
                  ...s,
                  billings: s.billings?.filter((b) => b.id !== billingId) ?? [],
                }
              : s
          ),
        }));

        // Log audit
        logAudit(AuditAction.DELETE_SHIPMENT, "Xóa billing", {
          user: getCurrentUser(),
          target: billingId,
          details: `Xóa billing ${billingId} khỏi Shipment ${shipmentId}`,
        });
      },

      removeShipment: (shipmentId) => {
        const shipment = get().shipments.find((s) => s.id === shipmentId);

        set((state) => ({
          shipments: state.shipments.filter((s) => s.id !== shipmentId),
        }));

        // Log audit
        if (shipment) {
          logAudit(AuditAction.DELETE_SHIPMENT, "Xóa Shipment", {
            user: getCurrentUser(),
            target: shipmentId,
            details: `Xóa Shipment: ${shipmentId}`,
          });
        }
      },

      // Legacy methods for backward compatibility (deprecated)
      addShipmentItem: (shipmentId, item) => {
        // Thêm vào billing đang active nếu có
        const state = get();
        if (state.activeBillingId) {
          get().addItemToBilling(shipmentId, state.activeBillingId, item);
        }
      },

      removeShipmentItem: (shipmentId, itemId) => {
        // Xóa khỏi billing đang active nếu có
        const state = get();
        if (state.activeBillingId) {
          get().removeItemFromBilling(
            shipmentId,
            state.activeBillingId,
            itemId
          );
        }
      },
    }),
    { name: "shipment-storage" }
  )
);
