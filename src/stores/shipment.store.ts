import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IShipmentStore, ShipmentStatus } from '@/types'

export const useShipmentStore = create<IShipmentStore>()(
  persist(
    (set) => ({
      shipments: [],
      activeShipmentId: null,
      setActiveShipmentId: (id) => set({ activeShipmentId: id }),

      setShipments: (shipments) => set({ shipments }),

      addShipment: (newShipment) =>
        set((state) => {
          if (state.shipments.some(s => s.id === newShipment.id)) return state
          return { shipments: [...state.shipments, newShipment] }
        }),

      addShipmentItem: (shipmentId, item) =>
        set((state) => ({
          shipments: state.shipments.map(s =>
            s.id === shipmentId
              ? {
                  ...s,
                  items: s.items?.some(i => i.id === item.id)
                    ? s.items // đã có rồi thì giữ nguyên
                    : [...(s.items ?? []), item],
                }
              : s
          ),
        })),

      updateShipmentStatus: (shipmentId, status: ShipmentStatus) =>
        set((state) => {
          const shipmentExists = state.shipments.some(s => s.id === shipmentId);
          if (!shipmentExists) return state;

          return {
            shipments: state.shipments.map(s =>
              s.id === shipmentId ? { ...s, status } : s
            ),
          };
        }),

      removeShipmentItem: (shipmentId, itemId) =>
      {
        console.log("Removing item:", itemId, "from shipment:", shipmentId);
        set((state) => ({
          shipments: state.shipments.map(s =>
            s.id === shipmentId
              ? {
                  ...s,
                  items: s.items?.filter(i => i.id !== itemId) ?? [],
                }
              : s
          ),
        })
      )},

      removeShipment: (shipmentId) =>
        set((state) => ({
          shipments: state.shipments.filter(s => s.id !== shipmentId),
        })),
    }),
    { name: 'shipment-storage' }
  )
)
