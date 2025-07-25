import { useState } from "react"
import moment from "moment"
import { useSearchParams } from "react-router-dom"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
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
        <div className="space-y-6">
            {/* Nút bật/tắt quét GM65 Scanner */}
            {!existingShipment && (
                <div className="space-y-4">
                    <ShipmentTypeScanSelect value={shipmentScanType} onChange={setShipmentScanType} />
                    {shipmentScanType === "scan" ? (
                        <ShipmentScannerButton disabled={isScanning} onSuccess={handleScanSuccess} />
                    ) : (
                        <ManualShipmentInput disabled={isScanning} onSuccess={handleScanSuccess} />
                    )}
                </div>
            )}

            {/* Hiển thị thông tin quét được */}
            {scannedData && (
                <ShipmentsNumberDialog key={dialogKey} shipmentId={scannedData} onClose={handleSetShipmentSuccess} />
            )}

            {/* Shipments Table */}
            {!existingShipment ? (
                <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">Không có lô hàng nào.</p>
                </div>
            ) : (
                <div key={`shipment-${existingShipment.id}-${existingShipment.createdAt}`}>
                    <div className="p-4 mb-4 space-y-4 bg-white border rounded-lg">
                        <div className="grid grid-cols-1 gap-1 sm:gap-4 sm:grid-cols-2">
                            <span
                                className="flex justify-start w-full text-sm font-bold"
                            >
                                Mã lô hàng: {existingShipment.id}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Thời gian tạo: {moment(existingShipment.createdAt).format("HH:mm:ss DD/MM/YYYY")}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Người tạo: {existingShipment.creator}
                            </span>
                        </div>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Danh sách vật tư</CardTitle>
                                <CardDescription>
                                    {"Tất cả vật tư trong lô hàng"}
                                </CardDescription>
                                <ShipmentItemScannerButton onIsScanning={setIsScanning} />
                            </CardHeader>

                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table className="min-w-full table-auto">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-3/4">Mã vật tư</TableHead>
                                                <TableHead className="w-1/4 text-center">Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {existingShipment.items?.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium break-all">
                                                        {item.id}
                                                    </TableCell>
                                                    <TableCell className="flex justify-center w-full text-center">
                                                        <DeleteItemDialog item={item.id} shipmentId={existingShipment.id} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="fixed bottom-0 left-0 z-50 flex items-center justify-between w-full gap-4 px-4 py-3 bg-white border-t shadow-md">
                            <ConfirmClearShipmentDialog shipmentId={existingShipment.id} disabled={isScanning} />
                            <ConfirmCreateShipmentDialog shipment={existingShipment} disabled={isScanning} onSuccess={() => setIsScanning(false)} />
                        </div>
                    </div>
                </div>

            )}


        </div>
    )
}
