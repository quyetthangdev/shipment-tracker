import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Button } from "@/components/ui"
import { useShipmentStore } from "@/stores"
import { BillingStatus } from "@/types"
import { PackageCheck, PackagePlus } from "lucide-react"

interface ContinueBillingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    billingId: string
    shipmentId: string
    itemCount: number
}

export function ContinueBillingDialog({
    open,
    onOpenChange,
    billingId,
    shipmentId,
    itemCount
}: ContinueBillingDialogProps) {
    const { setActiveBillingId, updateBillingStatus, shipments } = useShipmentStore()

    // Kiểm tra trạng thái billing
    const shipment = shipments.find(s => s.id === shipmentId)
    const billing = shipment?.billings?.find(b => b.id === billingId)
    const isCompleted = billing?.status === BillingStatus.COMPLETED

    const handleContinue = () => {
        // Set billing này làm active và tiếp tục quét
        setActiveBillingId(billingId)

        // Nếu billing đã completed, chuyển về scanning
        if (isCompleted) {
            updateBillingStatus(shipmentId, billingId, BillingStatus.SCANNING)
        }

        onOpenChange(false)
    }

    const handleComplete = () => {
        // Đánh dấu billing này là completed (chỉ khi chưa completed)
        if (!isCompleted) {
            updateBillingStatus(shipmentId, billingId, BillingStatus.COMPLETED)
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isCompleted ? 'Billing đã hoàn thành' : 'Chuyển sang billing'}
                    </DialogTitle>
                    <DialogDescription>
                        Billing <span className="font-mono font-semibold">{billingId}</span> {isCompleted ? 'đã hoàn thành' : 'đang quét'} với {itemCount} sản phẩm
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-600">
                        {isCompleted
                            ? 'Billing này đã hoàn thành. Bạn có muốn mở lại để quét thêm sản phẩm không?'
                            : 'Bạn muốn chuyển sang billing này để tiếp tục quét thêm sản phẩm?'
                        }
                    </p>
                </div>
                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex gap-2 items-center w-full sm:w-auto"
                    >
                        Hủy
                    </Button>
                    {!isCompleted && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleComplete}
                            className="flex gap-2 items-center w-full sm:w-auto"
                        >
                            <PackageCheck className="w-4 h-4" />
                            Hoàn thành billing
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={handleContinue}
                        className="flex gap-2 items-center w-full sm:w-auto"
                    >
                        <PackagePlus className="w-4 h-4" />
                        {isCompleted ? 'Mở lại & Quét' : 'Tiếp tục quét'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

