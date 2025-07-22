import { useState } from "react"
import toast from 'react-hot-toast';

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
import { IShipment } from "@/types"
import { useCreatedShipmentStore } from "@/stores/created-shipment.store";
import { useShipmentStore } from "@/stores";

export default function ConfirmCreateShipmentDialog({ shipment, disabled }: { shipment?: IShipment, disabled?: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const { removeShipment } = useShipmentStore();
    const { setCreatedShipment } = useCreatedShipmentStore()

    const handleSubmit = (shipment?: IShipment) => {
        const shipmentData: IShipment = {
            slug: shipment?.slug || '',
            createdAt: shipment?.createdAt || new Date().toISOString(),
            id: shipment?.id,
            name: shipment?.name,
            creator: shipment?.creator || "Nguyen Van A", // Example creator, replace with actual logic
            trackingNumber: shipment?.trackingNumber || "",
            items: shipment?.items || [],
            status: shipment?.status || "",
            origin: shipment?.origin || "",
            destination: shipment?.destination || ""
        }
        // Here you can handle the shipment creation logic
        toast.success(`Shipment ${shipment?.id} created successfully!`)
        setCreatedShipment(shipmentData)
        removeShipment(shipment?.id || '');
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
