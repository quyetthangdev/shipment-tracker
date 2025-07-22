import {
    Button,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label
} from "@/components/ui"
import { useShipmentStore } from "@/stores"
import { IShipment } from "@/types"
import { useEffect, useState } from "react"
import toast from 'react-hot-toast';

export default function ShipmentNumberDialog({ shipmentId, onClose }: { shipmentId: string, onClose: () => void }) {
    // console.log("ShipmentNumberDialog rendered with shipmentId:", shipmentId);
    const [isOpen, setIsOpen] = useState(false)
    const { setShipment } = useShipmentStore()
    // check to open dialog when shipmentId is true
    useEffect(() => {
        if (shipmentId) {
            setIsOpen(true)
            console.log("Opening ShipmentNumberDialog for shipmentId:", shipmentId, isOpen);
        } else {
            setIsOpen(false)
        }
    }, [shipmentId, isOpen])

    if (!shipmentId) return null

    const handleSubmit = (shipmentId: string) => {
        const shipmentData: IShipment = {
            slug: '',
            createdAt: new Date().toISOString(),
            id: shipmentId,
            name: "",
            creator: "Nguyen Van A", // Example creator, replace with actual logic
            trackingNumber: "",
            items: [],
            status: "",
            origin: "",
            destination: ""
        }
        // Here you can handle the shipment creation logic
        toast.success(`Shipment ${shipmentId} created successfully!`)
        setShipment(shipmentData)
        onClose(); // Call the onClose function passed from parent
        setIsOpen(false)
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <form>
                <DialogContent className="sm:max-w-[425px] max-w-[calc(100vw-32px)] rounded-md">
                    <DialogHeader>
                        <DialogTitle>Xác nhận thông tin shipment</DialogTitle>
                        <DialogDescription>
                            Xác nhận thông tin shipment để tiếp tục.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Mã shipment</Label>
                            <Input id="name-1" value={shipmentId} />
                        </div>
                    </div>
                    <DialogFooter className="grid justify-between grid-cols-2 gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Hủy</Button>
                        </DialogClose>
                        <Button type="submit" variant="destructive" onClick={() => handleSubmit(shipmentId)}>Tạo shipment</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
