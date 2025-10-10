import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Button, Input, Label } from "@/components/ui"
import { useShipmentStore, useAuthStore } from "@/stores"
import { BillingStatus } from "@/types"
import { AlertCircle } from "lucide-react"

interface AddBillingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    shipmentId: string
    onSuccess?: (billingId: string) => void
    onBillingExists?: (billingId: string) => void
}

export function AddBillingDialog({ open, onOpenChange, shipmentId, onSuccess, onBillingExists }: AddBillingDialogProps) {
    const { addBilling, setActiveBillingId, shipments } = useShipmentStore()
    const { user } = useAuthStore()
    const [billingNumber, setBillingNumber] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validation: phải đúng 10 ký tự
        if (billingNumber.trim().length !== 10) {
            setError("Số billing phải có đúng 10 ký tự")
            return
        }

        // Kiểm tra billing đã tồn tại trong shipment chưa
        const shipment = shipments.find(s => s.id === shipmentId)
        const existingBilling = shipment?.billings?.find(b => b.id === billingNumber.trim())

        if (existingBilling) {
            // Billing đã tồn tại, gọi callback để hiển thị dialog xác nhận
            onBillingExists?.(existingBilling.id)
            setBillingNumber("")
            setError("")
            onOpenChange(false)
            return
        }

        setIsLoading(true)

        try {
            const currentUser = user?.username || "Unknown"

            // Thêm billing mới
            addBilling(shipmentId, {
                id: billingNumber.trim(),
                items: [],
                status: BillingStatus.SCANNING,
                createdAt: new Date().toISOString(),
                creator: currentUser,
            })

            // Set làm billing đang active
            setActiveBillingId(billingNumber.trim())

            // Reset form
            setBillingNumber("")
            setError("")

            // Callback
            onSuccess?.(billingNumber.trim())
            onOpenChange(false)
        } catch (err) {
            setError("Có lỗi xảy ra khi thêm billing")
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setBillingNumber("")
            setError("")
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Nhập số billing</DialogTitle>
                        <DialogDescription>
                            Nhập số billing (10 ký tự) để bắt đầu quét sản phẩm
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="billing-number">Số billing *</Label>
                            <Input
                                id="billing-number"
                                placeholder="Nhập số billing (10 ký tự)"
                                value={billingNumber}
                                onChange={(e) => {
                                    setBillingNumber(e.target.value)
                                    setError("")
                                }}
                                maxLength={10}
                                className={error ? "border-red-500" : ""}
                                autoFocus
                            />
                            <p className="text-xs text-gray-500">
                                {billingNumber.length}/10 ký tự
                            </p>
                        </div>
                        {error && (
                            <div className="flex gap-2 items-center p-3 text-sm text-red-600 bg-red-50 rounded-md">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || billingNumber.trim().length !== 10}
                        >
                            {isLoading ? "Đang xử lý..." : "Thêm billing"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

