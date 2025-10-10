import { useNavigate } from "react-router-dom"

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
import { IShipment, ShipmentStatus } from "@/types"
import { useEffect, useState, useRef } from "react"
import toast from 'react-hot-toast'

export default function ShipmentNumberDialog({ shipmentId, onClose }: { shipmentId: string, onClose: () => void }) {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const { addShipment, shipments } = useShipmentStore()
    const toastShownRef = useRef<string | null>(null)

    const existingShipment = shipments.find(s => s.id === shipmentId)
    const shipmentStatus = existingShipment?.status

    const isInProgress = shipmentStatus === ShipmentStatus.IN_PROGRESS
    const isBlocked = existingShipment && !isInProgress
    const canContinue = existingShipment && isInProgress
    const isNew = !existingShipment

    useEffect(() => {
        if (!shipmentId) return

        if (isBlocked) {
            // Only show toast if we haven't shown it for this shipment yet
            if (toastShownRef.current !== shipmentId) {
                toast.error(`Shipment ${shipmentId} đã qua bước tạo, không thể chỉnh sửa!`)
                toastShownRef.current = shipmentId
            }
            setIsOpen(false)
            onClose()
            return
        }

        // Reset toast shown ref when shipment changes and is not blocked
        if (toastShownRef.current !== shipmentId) {
            toastShownRef.current = null
        }

        setIsOpen(true)
    }, [shipmentId, isBlocked, onClose, shipmentStatus])

    if (!shipmentId || isBlocked) return null

    const handleSubmit = () => {
        if (canContinue) {
            toast.success(`Tiếp tục với Shipment ${shipmentId}`)
        } else if (isNew) {
            const shipmentData: IShipment = {
                slug: shipmentId.toLowerCase().replace(/\s+/g, '-'),
                createdAt: new Date().toISOString(),
                id: shipmentId,
                name: `Shipment ${shipmentId}`,
                creator: "Nguyen Van A", // Thay bằng giá trị thực tế
                trackingNumber: shipmentId,
                billings: [],
                status: ShipmentStatus.IN_PROGRESS,
                origin: "",
                destination: ""
            }

            addShipment(shipmentData)
            toast.success(`Tạo Shipment ${shipmentId} thành công!`)
        }

        // Thêm shipment ID vào URL
        navigate(`/dashboard?code=${encodeURIComponent(shipmentId)}`)

        setIsOpen(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <form>
                <DialogContent className="sm:max-w-[425px] max-w-[calc(100vw-32px)] rounded-md">
                    <DialogHeader>
                        <DialogTitle>
                            {canContinue ? 'Shipment đang chờ xử lý' : 'Tạo Shipment mới'}
                        </DialogTitle>
                        <DialogDescription>
                            {canContinue
                                ? `Shipment ${shipmentId} đã có sẵn với ${existingShipment?.billings?.reduce((sum, b) => sum + (b.items?.length || 0), 0) || 0} vật tư. Bạn có muốn tiếp tục không?`
                                : 'Xác nhận để tạo Shipment mới.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">Mã Shipment</Label>
                            <Input id="name-1" value={shipmentId} readOnly />
                        </div>
                        {canContinue && existingShipment && (
                            <div className="grid gap-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                                <div className="text-sm">
                                    <div><strong>Thông tin Shipment:</strong></div>
                                    <div>Tên: {existingShipment.name || 'Chưa có tên'}</div>
                                    <div>Trạng thái: <span className="font-medium text-yellow-600">{existingShipment.status}</span></div>
                                    <div>Số vật tư: <span className="font-semibold">{existingShipment.billings?.reduce((sum, b) => sum + (b.items?.length || 0), 0) || 0}</span></div>
                                    <div>Ngày tạo: {new Date(existingShipment.createdAt).toLocaleDateString('vi-VN')}</div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="grid grid-cols-2 gap-2 justify-between">
                        <DialogClose asChild>
                            <Button variant="outline" onClick={onClose}>Hủy</Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            variant={canContinue ? "default" : "destructive"}
                            onClick={handleSubmit}
                        >
                            {canContinue ? 'Tiếp tục' : 'Tạo Shipment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
