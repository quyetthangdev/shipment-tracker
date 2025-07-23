import { useState } from 'react'
import toast from 'react-hot-toast'

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

export default function ConfirmClearShipmentDialog({ shipmentId }: { shipmentId?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const { removeShipment } = useShipmentStore()

    const handleDeleteShipment = (shipmentId: string) => {
        removeShipment(shipmentId)
        setIsOpen(false)
        toast.success(`Đã xóa lô hàng ${shipmentId}!`)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="flex items-center justify-center w-full" asChild>
                <Button
                    variant="destructive"
                    className="w-full text-sm"
                    onClick={() => setIsOpen(true)}
                >
                    Xóa lô hàng
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[18rem] overflow-hidden rounded-lg transition-all duration-300 hover:overflow-y-auto sm:max-h-[32rem] sm:max-w-[28rem]">
                <DialogHeader>
                    <DialogTitle>Xóa lô hàng</DialogTitle>
                    <DialogDescription>Xóa lô hàng khỏi hệ thống</DialogDescription>
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
                        onClick={() => handleDeleteShipment(shipmentId || '')}
                    >
                        Xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
