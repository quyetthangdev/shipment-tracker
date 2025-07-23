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

export default function DeleteItemDialog({ item, shipmentId }: { item?: string, shipmentId?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const { removeShipmentItem } = useShipmentStore()

    const handleDeleteItem = (shipmentId?: string, item?: string) => {
        if (!shipmentId || !item) {
            toast.error("Không có lô hàng để xóa vật tư")
            return
        }
        removeShipmentItem(shipmentId, item)
        setIsOpen(false)
        toast.success(`Đã xóa vật tư ${item} khỏi đơn hàng ${shipmentId}`)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="flex items-center justify-center w-full" asChild>
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
                    <DialogDescription>Xóa vật tư khỏi lô hàng</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-end">
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
                        onClick={() => handleDeleteItem(shipmentId, item)}
                    >
                        Xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
