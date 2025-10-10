import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Input, Button } from "@/components/ui"
import { useShipmentStore, useAuthStore } from "@/stores"
import { Keyboard, AlertCircle } from "lucide-react"

interface ManualItemInputProps {
    onIsScanning?: (isScanning: boolean) => void
    disabled?: boolean
}

export function ManualItemInput({ onIsScanning, disabled }: ManualItemInputProps) {
    const [searchParams] = useSearchParams()
    const code = searchParams.get('code')
    const { addItemToBilling, activeBillingId, shipments } = useShipmentStore()
    const { user } = useAuthStore()

    const [itemCode, setItemCode] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState("")
    const [showInput, setShowInput] = useState(false)

    const handleAddItem = async () => {
        if (!itemCode.trim()) {
            setError("Vui lòng nhập mã vật tư")
            return
        }

        if (!code) {
            setError("Không tìm thấy Shipment")
            return
        }

        if (!activeBillingId) {
            setError("Vui lòng chọn billing trước")
            return
        }

        // Kiểm tra xem item đã tồn tại trong billing chưa
        const shipment = shipments.find(s => s.id === code)
        const billing = shipment?.billings?.find(b => b.id === activeBillingId)
        if (billing && billing.items?.some(item => item.id === itemCode.trim())) {
            setError("Mã vật tư này đã tồn tại trong billing")
            return
        }

        setIsProcessing(true)
        onIsScanning?.(true)
        setError("")

        try {
            const currentUser = user?.username || "Unknown"

            addItemToBilling(code, activeBillingId, {
                id: itemCode.trim(),
                createdAt: new Date().toISOString(),
                creator: currentUser,
            })

            // Reset form
            setItemCode("")
            setShowInput(false)
        } catch (err) {
            setError("Có lỗi xảy ra khi thêm vật tư")
            console.error(err)
        } finally {
            setIsProcessing(false)
            onIsScanning?.(false)
        }
    }

    if (!showInput) {
        return (
            <Button
                onClick={() => setShowInput(true)}
                variant="outline"
                className="flex gap-2 items-center"
                disabled={disabled}
            >
                <Keyboard className="w-4 h-4" />
                <span className="hidden sm:inline">Nhập tay</span>
            </Button>
        )
    }

    return (
        <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/50">
            <div className="mx-4 w-full max-w-md bg-white rounded-lg shadow-xl">
                <div className="p-6 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">Nhập mã vật tư</h3>
                        <p className="text-sm text-gray-500">Nhập mã QR của vật tư thủ công</p>
                    </div>

                    <div className="space-y-2">
                        <Input
                            placeholder="Nhập mã vật tư..."
                            value={itemCode}
                            onChange={(e) => {
                                setItemCode(e.target.value)
                                setError("")
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isProcessing) {
                                    handleAddItem()
                                }
                            }}
                            autoFocus
                            className={error ? "border-red-500" : ""}
                        />
                        {error && (
                            <div className="flex gap-2 items-center p-2 text-sm text-red-600 bg-red-50 rounded">
                                <AlertCircle className="flex-shrink-0 w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowInput(false)
                                setItemCode("")
                                setError("")
                            }}
                            disabled={isProcessing}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleAddItem}
                            disabled={isProcessing || !itemCode.trim()}
                        >
                            {isProcessing ? "Đang thêm..." : "Thêm"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

