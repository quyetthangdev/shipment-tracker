import { useState } from "react"
import moment from "moment"
import { useSearchParams } from "react-router-dom"
import { Package, Calendar, User, ListChecks, Scan, Plus, Receipt } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from "@/components/ui"
import { ConfirmClearShipmentDialog, ConfirmCreateShipmentDialog, DeleteItemDialog, ShipmentsNumberDialog, AddBillingDialog, ContinueBillingDialog, DeleteBillingDialog } from "@/components/app/dialog"
import { useShipmentStore } from "@/stores"
import { ShipmentScannerButton } from "@/components/app/button"
import ShipmentItemScannerButton from "@/components/app/button/shipment-item-scanner-button"
import { ShipmentTypeScanSelect } from "@/components/app/select"
import { ManualShipmentInput, ManualItemInput } from "@/components/app/input"
import { BillingStatus } from "@/types"

export default function ShipmentsTab() {
    const [scannedData, setScannedData] = useState<string | null>(null)
    const [dialogKey, setDialogKey] = useState<number>(0)
    const [isScanning, setIsScanning] = useState(false)
    const { shipments, activeBillingId } = useShipmentStore()
    const [searchParams] = useSearchParams()
    const code = searchParams.get('code')
    const [shipmentScanType, setShipmentScanType] = useState<string>("scan")

    // Billing dialogs
    const [isAddBillingDialogOpen, setIsAddBillingDialogOpen] = useState(false)
    const [isContinueBillingDialogOpen, setIsContinueBillingDialogOpen] = useState(false)
    const [pendingBillingId, setPendingBillingId] = useState<string | null>(null)

    const existingShipment = code ? shipments.find(shipment => shipment.id === code) : null
    const activeBilling = existingShipment && activeBillingId
        ? existingShipment.billings?.find(b => b.id === activeBillingId)
        : null

    // Tính tổng số items trong tất cả billings
    const totalItems = existingShipment?.billings?.reduce((sum, billing) => sum + (billing.items?.length || 0), 0) || 0

    // Kiểm tra xem có thể tạo Shipment không
    const canCreateShipment = existingShipment ? (
        existingShipment.billings &&
        existingShipment.billings.length > 0 &&
        existingShipment.billings.every(billing => billing.items && billing.items.length > 0)
    ) : false

    // Lý do không thể tạo
    const getDisabledReason = () => {
        if (!existingShipment?.billings || existingShipment.billings.length === 0) {
            return "Chưa có billing nào. Vui lòng thêm billing trước."
        }
        const emptyBillings = existingShipment.billings.filter(b => !b.items || b.items.length === 0)
        if (emptyBillings.length > 0) {
            return `Billing ${emptyBillings.map(b => b.id).join(', ')} chưa có vật tư. Vui lòng quét vật tư trước khi tạo Shipment.`
        }
        return ""
    }

    const handleScanSuccess = (data: string) => {
        setScannedData(data)
        setDialogKey(prev => prev + 1)
    }

    const handleSetShipmentSuccess = () => {
        setScannedData(null)
    }

    const handleAddBilling = () => {
        if (!existingShipment) return

        // Luôn mở dialog thêm billing mới
        setIsAddBillingDialogOpen(true)
    }

    const handleAddBillingSuccess = (billingId: string) => {
        console.log("Billing added successfully:", billingId)
    }

    const handleBillingExists = (billingId: string) => {
        // Billing đã tồn tại, hiển thị dialog xác nhận
        setPendingBillingId(billingId)
        setIsContinueBillingDialogOpen(true)
    }

    const handleBillingClick = (billingId: string) => {
        // Chỉ cho phép chọn khi không đang quét
        if (isScanning) {
            return
        }

        // Nếu billing đã là active, không cần hiện dialog
        if (activeBillingId === billingId) {
            return
        }

        // Hiển thị dialog xác nhận
        setPendingBillingId(billingId)
        setIsContinueBillingDialogOpen(true)
    }

    return (
        <div className="px-3 pb-28 space-y-4 max-w-7xl sm:pb-24 sm:space-y-6">
            {/* Scan Controls Section */}
            {!existingShipment && (
                <Card className="rounded-lg shadow-none">
                    <CardHeader className="pb-3 sm:pb-6">
                        <div className="flex gap-2 items-center sm:gap-3">
                            <div className="flex justify-center items-center w-9 h-9 rounded-full sm:w-10 sm:h-10 bg-muted-foreground/10">
                                <Scan className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-base sm:text-lg">Quét Shipment</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Chọn phương thức và quét mã Shipment để bắt đầu
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3 sm:space-y-0">
                        <div className="space-y-3">
                            <ShipmentTypeScanSelect value={shipmentScanType} onChange={setShipmentScanType} />
                            {shipmentScanType === "scan" && (
                                <ShipmentScannerButton disabled={isScanning} onSuccess={handleScanSuccess} />
                            )}
                            {shipmentScanType === "manual" && (
                                <ManualShipmentInput disabled={isScanning} onSuccess={handleScanSuccess} />
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {scannedData && (
                <ShipmentsNumberDialog key={dialogKey} shipmentId={scannedData} onClose={handleSetShipmentSuccess} />
            )}

            {/* Shipment Details */}
            {!existingShipment ? (
                <Card className="rounded-lg shadow-none">
                    <CardContent className="flex flex-col justify-center items-center py-16 sm:py-20">
                        <Package className="mb-3 w-12 h-12 sm:mb-4 sm:w-16 sm:h-16 text-muted-foreground/60" />
                        <h3 className="mb-1 text-base font-semibold text-gray-700 sm:mb-2 sm:text-lg">
                            Chưa có Shipment nào
                        </h3>
                        <p className="text-xs text-center text-gray-500 sm:text-sm">
                            Vui lòng quét mã Shipment để bắt đầu
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div key={`shipment-${existingShipment.id}-${existingShipment.createdAt}`} className="space-y-3 sm:space-y-4">
                    {/* Shipment Info Card */}
                    <Card className="rounded-lg shadow-none">
                        <CardHeader className="p-4 bg-gradient-to-r border-b from-muted-foreground/10 to-muted-foreground/10 sm:p-6">
                            <div className="flex flex-col gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap gap-2 items-center sm:gap-3">
                                        <Package className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                                        <CardTitle className="font-mono text-base break-all sm:text-lg text-muted-foreground">
                                            {existingShipment.id}
                                        </CardTitle>
                                        <Badge className="flex-shrink-0 text-xs bg-muted-foreground sm:text-sm">
                                            Đang quét
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 mt-3 text-xs text-gray-700 sm:gap-3 sm:mt-4 sm:text-sm md:grid-cols-2 lg:grid-cols-4">
                                        <div className="flex gap-1.5 items-center sm:gap-2">
                                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                            <span className="truncate">
                                                <strong className="font-semibold">Người tạo:</strong>{" "}
                                                <span className="font-normal">{existingShipment.creator}</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5 items-center sm:gap-2">
                                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                            <span className="truncate">
                                                <strong className="font-semibold">Thời gian:</strong>{" "}
                                                <span className="font-normal">
                                                    {moment(existingShipment.createdAt).format("HH:mm DD/MM/YYYY")}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5 items-center sm:gap-2">
                                            <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                            <span className="truncate">
                                                <strong className="font-semibold">Billings:</strong>{" "}
                                                <span className="font-normal">{existingShipment.billings?.length || 0}</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5 items-center sm:gap-2">
                                            <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                            <span className="truncate">
                                                <strong className="font-semibold">Tổng:</strong>{" "}
                                                <span className="font-normal">{totalItems} sản phẩm</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Billings Section */}
                    <Card className="rounded-lg shadow-none">
                        <CardHeader className="p-4 bg-gray-50 border-b sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="flex gap-1.5 items-center text-base sm:gap-2 sm:text-lg">
                                        <Receipt className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                                        <span>Billings</span>
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs sm:text-sm">
                                        {existingShipment.billings?.length || 0} billing(s)
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={handleAddBilling}
                                    className="flex gap-2 items-center"
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Thêm billing</span>
                                    <span className="sm:hidden">Thêm</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 sm:p-6">
                            {!existingShipment.billings || existingShipment.billings.length === 0 ? (
                                <div className="flex flex-col justify-center items-center py-8">
                                    <Receipt className="mb-2 w-10 h-10 text-gray-300 sm:mb-3" />
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Chưa có billing nào</p>
                                    <p className="text-xs text-center text-gray-500">
                                        Nhấn "Thêm billing" để bắt đầu quét sản phẩm
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {existingShipment.billings.map((billing) => (
                                        <div
                                            key={billing.id}
                                            onClick={() => handleBillingClick(billing.id)}
                                            className={`p-3 rounded-lg border transition-all ${activeBillingId === billing.id
                                                ? 'border-muted-foreground/60 bg-muted-foreground/5 text-muted-foreground'
                                                : 'border-gray-200 bg-white hover:border-muted-foreground/20 hover:bg-muted-foreground/5'
                                                } ${isScanning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex flex-wrap gap-2 justify-between items-center">
                                                <div className="flex flex-1 gap-2 items-center">
                                                    <span className="font-mono text-sm font-semibold">{billing.id}</span>
                                                    {billing.status === BillingStatus.SCANNING ? (
                                                        <Badge variant="outline" className={activeBillingId === billing.id ? 'border-yellow-500 bg-yellow-500 text-white' : ''}>
                                                            Đang quét
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className={activeBillingId === billing.id ? 'border-white text-white' : 'border-green-600 text-green-600'}>
                                                            Hoàn thành
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <span className={`text-xs ${activeBillingId === billing.id ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {billing.items?.length || 0} sản phẩm
                                                    </span>
                                                    <DeleteBillingDialog
                                                        billingId={billing.id}
                                                        shipmentId={existingShipment.id!}
                                                        itemCount={billing.items?.length || 0}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items Table Card - Chỉ hiển thị khi có billing active */}
                    {activeBilling && (
                        <Card className="rounded-lg shadow-none">
                            <CardHeader className="p-4 bg-gray-50 border-b sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="flex gap-1.5 items-center text-base sm:gap-2 sm:text-lg">
                                            <ListChecks className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>Vật tư - Billing {activeBilling.id}</span>
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-xs sm:text-sm">
                                            {activeBilling.items?.length || 0} vật tư trong billing này
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-shrink-0 gap-2 sm:self-start">
                                        <ManualItemInput onIsScanning={setIsScanning} disabled={isScanning} />
                                        <ShipmentItemScannerButton onIsScanning={setIsScanning} />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {!activeBilling.items || activeBilling.items.length === 0 ? (
                                    <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                                        <Package className="mb-2 w-10 h-10 text-gray-300 sm:mb-3 sm:w-12 sm:h-12" />
                                        <p className="text-xs font-medium text-gray-600 sm:text-sm">Chưa có vật tư nào</p>
                                        <p className="text-xs text-center text-gray-500 sm:text-xs">
                                            Quét hoặc nhập mã để thêm vật tư
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto max-h-[calc(100vh-36rem)] sm:max-h-[calc(100vh-32rem)]">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10 bg-gray-50">
                                                <TableRow className="bg-gray-50 border-b">
                                                    <TableHead className="w-12 text-xs text-center sm:w-16 sm:text-sm">STT</TableHead>
                                                    <TableHead className="text-xs sm:text-sm">Mã Vật Tư</TableHead>
                                                    <TableHead className="w-20 text-xs text-center sm:w-28 sm:text-sm">Thao Tác</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {activeBilling.items.map((item, index) => (
                                                    <TableRow key={item.id} className="hover:bg-gray-50/80">
                                                        <TableCell className="py-3 text-xs font-medium text-center text-gray-600 sm:py-4 sm:text-sm">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell className="py-3 font-mono text-xs break-all sm:py-4 sm:text-sm">
                                                            {item.id}
                                                        </TableCell>
                                                        <TableCell className="py-3 text-center sm:py-4">
                                                            <div className="flex justify-center">
                                                                <DeleteItemDialog item={item.id} shipmentId={existingShipment.id} billingId={activeBilling.id} />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Fixed Bottom Actions */}
                    <div className="flex flex-col sm:flex-row fixed bottom-0 left-0 right-0 z-50 gap-3 justify-between items-stretch sm:items-center px-3 py-2.5 w-full bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:py-3 md:px-6 md:py-3.5 backdrop-blur-sm bg-white/95">
                        <div className="flex-1 min-w-0">
                            {!canCreateShipment && (
                                <div className="text-xs text-destructive sm:text-sm">
                                    ⚠️ {getDisabledReason()}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-shrink-0 gap-2 w-full sm:w-auto sm:gap-3">
                            <ConfirmClearShipmentDialog shipmentId={existingShipment.id} disabled={isScanning} />
                            <ConfirmCreateShipmentDialog shipment={existingShipment} disabled={isScanning || !canCreateShipment} onSuccess={() => setIsScanning(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            {existingShipment && (
                <>
                    <AddBillingDialog
                        open={isAddBillingDialogOpen}
                        onOpenChange={setIsAddBillingDialogOpen}
                        shipmentId={existingShipment.id!}
                        onSuccess={handleAddBillingSuccess}
                        onBillingExists={handleBillingExists}
                    />
                    <ContinueBillingDialog
                        open={isContinueBillingDialogOpen}
                        onOpenChange={setIsContinueBillingDialogOpen}
                        billingId={pendingBillingId || ""}
                        shipmentId={existingShipment.id!}
                        itemCount={existingShipment.billings?.find(b => b.id === pendingBillingId)?.items?.length || 0}
                    />
                </>
            )}
        </div>
    )
}
