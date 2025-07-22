import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IShipment, IShipmentItem, IShipmentStore } from '@/types'

export const useShipmentStore = create<IShipmentStore>()(
  persist(
    (set) => ({
      shipment: undefined,

      setShipment: (shipment?: IShipment) => set({ shipment }),

      addShipmentItem: (item: IShipmentItem) =>
        set((state) => {
          const existingItems = state.shipment?.items ?? []

          return {
            shipment: {
              ...state.shipment!,
              items: [...existingItems, item],
            },
          }
        }),

      removeShipmentItem: (itemId: string) =>
        set((state) => {
          if (!state.shipment) return state

          return {
            shipment: {
              ...state.shipment,
              items: state.shipment.items?.filter((item) => item.id !== itemId) || [],
            },
          }
        }),

      removeShipment: (shipmentId: string) => set((state) => {
        if (!state.shipment || state.shipment.id !== shipmentId) return state
        return {
          shipment: undefined,
        }
      }),
    }),
    {
      name: 'shipment-storage',
    }
  )
)
