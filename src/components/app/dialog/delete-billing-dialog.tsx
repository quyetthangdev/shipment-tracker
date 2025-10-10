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

interface DeleteBillingDialogProps {
    billingId: string
    shipmentId: string
    itemCount: number
}

export function DeleteBillingDialog({ billingId, shipmentId, itemCount }: DeleteBillingDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { removeBilling, activeBillingId, setActiveBillingId } = useShipmentStore()

    const handleDeleteBilling = () => {
        if (!shipmentId || !billingId) {
            toast.error("Không thể xóa billing")
            return
        }

        // Nếu billing đang active, reset activeBillingId
        if (activeBillingId === billingId) {
            setActiveBillingId(null)
        }

        removeBilling(shipmentId, billingId)
        setIsOpen(false)
        toast.success(`Đã xóa billing ${billingId}`)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(true)
                    }}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-w-[calc(100vw-32px)] rounded-md">
                <DialogHeader>
                    <DialogTitle>Xóa billing</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa billing <span className="font-mono font-semibold">{billingId}</span>?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <p className="text-sm text-gray-600">
                        Billing này có <strong>{itemCount}</strong> sản phẩm. Tất cả sản phẩm sẽ bị xóa cùng billing.
                    </p>
                    {itemCount > 0 && (
                        <p className="mt-2 text-sm text-red-600">
                            ⚠️ Hành động này không thể hoàn tác!
                        </p>
                    )}
                </div>
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
                        onClick={handleDeleteBilling}
                    >
                        Xóa billing
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

