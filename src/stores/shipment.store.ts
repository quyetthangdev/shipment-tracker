import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IShipmentStore, ShipmentStatus, AuditAction } from "@/types";
import { logAudit, getCurrentUser } from "@/lib/audit-logger";

export const useShipmentStore = create<IShipmentStore>()(
  persist(
    (set, get) => ({
      shipments: [],
      activeShipmentId: null,
      setActiveShipmentId: (id) => set({ activeShipmentId: id }),

      setShipments: (shipments) => set({ shipments }),

      addShipment: (newShipment) => {
        const exists = get().shipments.some((s) => s.id === newShipment.id);
        if (exists) return;

        set((state) => ({
          shipments: [...state.shipments, newShipment],
        }));

        // Log audit
        logAudit(AuditAction.CREATE_SHIPMENT, "Tạo lô hàng", {
          user: getCurrentUser(),
          target: newShipment.id,
          details: `Tạo lô hàng mới: ${newShipment.id} với ${
            newShipment.items?.length || 0
          } items`,
        });
      },

      addShipmentItem: (shipmentId, item) =>
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === shipmentId
              ? {
                  ...s,
                  items: s.items?.some((i) => i.id === item.id)
                    ? s.items // đã có rồi thì giữ nguyên
                    : [...(s.items ?? []), item],
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
              s.id === shipmentId ? { ...s, status } : s
            ),
          };
        }),

      removeShipmentItem: (shipmentId, itemId) => {
        console.log("Removing item:", itemId, "from shipment:", shipmentId);
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === shipmentId
              ? {
                  ...s,
                  items: s.items?.filter((i) => i.id !== itemId) ?? [],
                }
              : s
          ),
        }));
      },

      removeShipment: (shipmentId) => {
        const shipment = get().shipments.find((s) => s.id === shipmentId);

        set((state) => ({
          shipments: state.shipments.filter((s) => s.id !== shipmentId),
        }));

        // Log audit
        if (shipment) {
          logAudit(AuditAction.DELETE_SHIPMENT, "Xóa lô hàng", {
            user: getCurrentUser(),
            target: shipmentId,
            details: `Xóa lô hàng: ${shipmentId}`,
          });
        }
      },
    }),
    { name: "shipment-storage" }
  )
);
