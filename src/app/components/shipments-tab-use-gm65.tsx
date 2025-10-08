import { useState } from "react"
import moment from "moment"
import { useSearchParams } from "react-router-dom"
import { Package, Calendar, User, ListChecks, Scan } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui"
import { ConfirmClearShipmentDialog, ConfirmCreateShipmentDialog, DeleteItemDialog, ShipmentsNumberDialog } from "@/components/app/dialog"
import { useShipmentStore } from "@/stores"
import { ShipmentScannerButton } from "@/components/app/button"
import ShipmentItemScannerButton from "@/components/app/button/shipment-item-scanner-button"
import { ShipmentTypeScanSelect } from "@/components/app/select"
import { ManualShipmentInput } from "@/components/app/input"

export default function ShipmentsTab() {
    const [scannedData, setScannedData] = useState<string | null>(null); // Dữ liệu quét từ GM65
    const [dialogKey, setDialogKey] = useState<number>(0); // Key để force re-render dialog
    const [isScanning, setIsScanning] = useState(false);
    const { shipments } = useShipmentStore();
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const [shipmentScanType, setShipmentScanType] = useState<string>("scan");

    // check if there is a shipment in shipments with the same id as code from params
    // console.log("Check: ", code, shipments);
    const existingShipment = code ? shipments.find(shipment => shipment.id === code) : null;

    const handleScanSuccess = (data: string) => {
        setScannedData(data);
        setDialogKey(prev => prev + 1); // Force dialog to re-render
    }

    const handleSetShipmentSuccess = () => {
        setScannedData(null); // Reset sau khi đã xử lý dữ liệu
    }

    // const isAdmin = currentUser === "admin"
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
                                <CardTitle className="text-base sm:text-lg">Quét lô hàng</CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Chọn phương thức và quét mã lô hàng để bắt đầu
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

            {/* Hiển thị thông tin quét được */}
            {scannedData && (
                <ShipmentsNumberDialog key={dialogKey} shipmentId={scannedData} onClose={handleSetShipmentSuccess} />
            )}

            {/* Shipment Details */}
            {!existingShipment ? (
                <Card className="rounded-lg shadow-none">
                    <CardContent className="flex flex-col justify-center items-center py-16 sm:py-20">
                        <Package className="mb-3 w-12 h-12 sm:mb-4 sm:w-16 sm:h-16 text-muted-foreground/60" />
                        <h3 className="mb-1 text-base font-semibold text-gray-700 sm:mb-2 sm:text-lg">
                            Chưa có lô hàng nào
                        </h3>
                        <p className="text-xs text-center text-gray-500 sm:text-sm">
                            Vui lòng quét mã lô hàng để bắt đầu
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
                                            Đang chờ xử lý
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 mt-3 text-xs text-gray-700 sm:gap-3 sm:mt-4 sm:text-sm md:grid-cols-3">
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
                                            <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                            <span className="truncate">
                                                <strong className="font-semibold">Tổng:</strong>{" "}
                                                <span className="font-normal">{existingShipment.items?.length || 0} sản phẩm</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Items Table Card */}
                    <Card className="rounded-lg shadow-none">
                        <CardHeader className="p-4 bg-gray-50 border-b sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="flex gap-1.5 items-center text-base sm:gap-2 sm:text-lg">
                                        <ListChecks className="flex-shrink-0 w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />
                                        <span>Danh Sách Vật Tư</span>
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs sm:text-sm">
                                        Tất cả vật tư trong lô hàng này
                                    </CardDescription>
                                </div>
                                <div className="flex-shrink-0 sm:self-start">
                                    <ShipmentItemScannerButton onIsScanning={setIsScanning} />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {!existingShipment.items || existingShipment.items.length === 0 ? (
                                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                                    <Package className="mb-2 w-10 h-10 text-gray-300 sm:mb-3 sm:w-12 sm:h-12" />
                                    <p className="text-xs font-medium text-gray-600 sm:text-sm">Chưa có vật tư nào</p>
                                    <p className="text-xs text-center text-gray-500 sm:text-xs">
                                        Quét mã để thêm vật tư vào lô hàng
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto max-h-[calc(100vh-32rem)] sm:max-h-[calc(100vh-28rem)]">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-gray-50">
                                            <TableRow className="bg-gray-50 border-b">
                                                <TableHead className="w-12 text-xs text-center sm:w-16 sm:text-sm">STT</TableHead>
                                                <TableHead className="text-xs sm:text-sm">Mã Vật Tư</TableHead>
                                                <TableHead className="w-20 text-xs text-center sm:w-28 sm:text-sm">Thao Tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {existingShipment.items.map((item, index) => (
                                                <TableRow key={item.id} className="hover:bg-gray-50/80">
                                                    <TableCell className="py-3 text-xs font-medium text-center text-gray-600 sm:py-4 sm:text-sm">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="py-3 font-mono text-xs break-all sm:py-4 sm:text-sm">
                                                        {item.id}
                                                    </TableCell>
                                                    <TableCell className="py-3 text-center sm:py-4">
                                                        <div className="flex justify-center">
                                                            <DeleteItemDialog item={item.id} shipmentId={existingShipment.id} />
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

                    {/* Fixed Bottom Actions */}
                    <div className="flex fixed bottom-0 left-0 right-0 z-50 gap-2 justify-between items-stretch px-3 py-2.5 w-full bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:gap-3 sm:py-3 md:justify-end md:px-6 md:py-3.5 backdrop-blur-sm bg-white/95">
                        <div className="flex-1 min-w-0 sm:flex-1 md:flex-initial md:min-w-[140px]">
                            <ConfirmClearShipmentDialog shipmentId={existingShipment.id} disabled={isScanning} />
                        </div>
                        <div className="flex-1 min-w-0 sm:flex-1 md:flex-initial md:min-w-[140px]">
                            <ConfirmCreateShipmentDialog shipment={existingShipment} disabled={isScanning} onSuccess={() => setIsScanning(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
