import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ICreatedShipmentStore, IShipment } from '@/types'

export const useCreatedShipmentStore = create<ICreatedShipmentStore>()(
  persist(
    (set) => ({
      createdShipment: undefined,
      setCreatedShipment: (shipment?: IShipment) => set({ createdShipment: shipment }),
      removeCreatedShipment: (shipmentId: string) => set((state) => {
        if (!state.createdShipment || state.createdShipment.id !== shipmentId) return state
        return {
          createdShipment: undefined,
        }
      }),
    }),
    {
      name: 'created-shipment-storage',
    }
  )
)
