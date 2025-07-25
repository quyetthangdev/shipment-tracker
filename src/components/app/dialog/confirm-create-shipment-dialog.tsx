import { useState } from "react"
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom"

import {
    Button,
    Dialog,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label
} from "@/components/ui"
import { IShipment, ShipmentStatus } from "@/types"
import { useShipmentStore } from "@/stores";

export default function ConfirmCreateShipmentDialog({ shipment, disabled, onSuccess }: { shipment?: IShipment, disabled?: boolean, onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const { updateShipmentStatus } = useShipmentStore()
    const navigate = useNavigate()

    const handleSubmit = (shipment?: IShipment) => {
        // Here you can handle the shipment creation logic
        toast.success(`Lô hàng ${shipment?.id} đã được tạo thành công!`)
        updateShipmentStatus(shipment?.id || '', ShipmentStatus.IN_PROGRESS);

        // Clear code parameter from URL
        navigate('/dashboard', { replace: true })
        onSuccess?.();

        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger className="flex items-center justify-center w-full" asChild>
                <Button
                    disabled={disabled}
                    className="w-full text-sm bg-green-600 sm:w-fit hover:bg-green-700"
                    onClick={() => setIsOpen(true)}
                >
                    Tạo lô hàng
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-w-[calc(100vw-32px)] rounded-md">
                <DialogHeader>
                    <DialogTitle>Xác nhận thông tin lô hàng</DialogTitle>
                    <DialogDescription>
                        Xác nhận thông tin lô hàng để tiếp tục.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="name-1">Mã lô hàng</Label>
                        <Input id="name-1" value={shipment?.id} />
                    </div>
                </div>
                <DialogFooter className="grid justify-between grid-cols-2 gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Hủy</Button>
                    </DialogClose>
                    <Button type="submit" variant="destructive" onClick={() => handleSubmit(shipment)}>Tạo lô hàng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
