import { useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Button,
    DialogFooter,
} from '@/components/ui'
import { useShipmentStore } from '@/stores'

export default function DeleteItemDialog({ item, shipmentId, billingId }: { item?: string, shipmentId?: string, billingId?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const { removeItemFromBilling, removeShipmentItem } = useShipmentStore()

    const handleDeleteItem = (shipmentId?: string, item?: string, billingId?: string) => {
        if (!shipmentId || !item) {
            toast.error("Không có Shipment để xóa vật tư")
            return
        }

        // Nếu có billingId thì xóa khỏi billing, không thì dùng legacy method
        if (billingId) {
            removeItemFromBilling(shipmentId, billingId, item)
            toast.success(`Đã xóa vật tư ${item} khỏi billing ${billingId}`)
        } else {
            removeShipmentItem(shipmentId, item)
            toast.success(`Đã xóa vật tư ${item} khỏi đơn hàng ${shipmentId}`)
        }

        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="flex justify-center items-center w-full" asChild>
                <Button
                    variant="ghost"
                    className="text-sm w-fit"
                    onClick={() => setIsOpen(true)}
                >
                    <Trash2 className="icon text-destructive" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[18rem] overflow-hidden rounded-lg transition-all duration-300 hover:overflow-y-auto sm:max-h-[32rem] sm:max-w-[28rem]">
                <DialogHeader>
                    <DialogTitle>Xóa vật tư</DialogTitle>
                    <DialogDescription>Xóa vật tư khỏi Shipment</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row gap-2 justify-between sm:justify-end">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => setIsOpen(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        className="w-full sm:w-auto"
                        onClick={() => handleDeleteItem(shipmentId, item, billingId)}
                    >
                        Xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
