import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ICreatedShipmentStore } from '@/types'

export const useCreatedShipmentStore = create<ICreatedShipmentStore>()(
  persist(
    (set) => ({
      createdShipments: [],
      addCreatedShipment: (shipment) =>
        set((state) => {
          const exists = state.createdShipments.some(s => s.id === shipment.id)
          if (exists) return state
          return { createdShipments: [...state.createdShipments, shipment] }
        }),
      removeCreatedShipment: (shipmentId) =>
        set((state) => ({
          createdShipments: state.createdShipments.filter(s => s.id !== shipmentId)
        })),
      clearCreatedShipments: () => set({ createdShipments: [] })
    }),
    {
      name: 'created-shipments-storage',
    }
  )
)
