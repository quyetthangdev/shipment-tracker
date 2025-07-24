import { useState } from "react"

import { } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui"
import { ConfirmClearShipmentDialog, ConfirmCreateShipmentDialog, DeleteItemDialog, ShipmentsNumberDialog } from "@/components/app/dialog"
import { useShipmentStore } from "@/stores"
import { ShipmentScannerButton } from "@/components/app/button"
import ShipmentItemScannerButton from "@/components/app/button/shipment-item-scanner-button"
import moment from "moment"
import { ShipmentStatus } from "@/types"

export default function ShipmentsTab() {
    const [scannedData, setScannedData] = useState<string | null>(null); // Dữ liệu quét từ GM65
    const { shipments } = useShipmentStore();

    const handleSetShipmentSuccess = () => {
        setScannedData(null); // Reset sau khi đã xử lý dữ liệu
    }

    // const isAdmin = currentUser === "admin"
    return (
        <div className="space-y-6">
            {/* Nút bật/tắt quét GM65 Scanner */}
            <div className="space-y-4">
                <div>
                    {/* {!shipments.length && ( */}
                    <ShipmentScannerButton onSuccess={(data) => setScannedData(data)} />
                    {/* )} */}
                </div>
            </div>

            {/* Hiển thị thông tin quét được */}
            {scannedData && (
                <ShipmentsNumberDialog shipmentId={scannedData} onClose={handleSetShipmentSuccess} />
            )}

            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Lô hàng</h2>
                    <p className="text-gray-600">Quản lý và theo dõi lô hàng của bạn</p>
                </div>
            </div>

            {/* Shipments Table */}
            {!shipments.length ? (
                <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">Không có lô hàng nào.</p>
                </div>
            ) : (
                <div>
                    {shipments.length > 0 &&
                        shipments
                            .filter(shipment => shipment.status === ShipmentStatus.PENDING)
                            .map(shipment => (
                                <div key={shipment.id} className="space-y-4">
                                    <Badge
                                        variant="outline"
                                        className="flex justify-center w-full py-2 text-sm text-green-600 border-green-500"
                                    >
                                        Mã lô hàng: {shipment.id}
                                    </Badge>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <span className="text-sm text-muted-foreground">
                                            Thời gian tạo: {moment(shipment.createdAt).format("HH:mm:ss DD/MM/YYYY")}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            Người tạo: {shipment.creator}
                                        </span>
                                    </div>
                                </div>
                            ))}
                </div>

            )}
            {shipments
                .filter(shipment => shipment.status === ShipmentStatus.PENDING)
                .map((shipment) => (
                    <div key={shipment.id}>
                        {shipment?.id && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Danh sách vật tư</CardTitle>
                                    <CardDescription>
                                        {"Tất cả vật tư trong lô hàng"}
                                    </CardDescription>
                                    <ShipmentItemScannerButton />
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
                                                {shipment.items?.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium break-all">
                                                            {item.id}
                                                        </TableCell>
                                                        <TableCell className="flex justify-center w-full text-center">
                                                            <DeleteItemDialog item={item.id} shipmentId={shipment.id} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        <div className="fixed bottom-0 left-0 z-50 flex items-center justify-between w-full gap-4 px-4 py-3 bg-white border-t shadow-md">
                            <ConfirmClearShipmentDialog shipmentId={shipment.id} />
                            <ConfirmCreateShipmentDialog shipment={shipment} />
                        </div>
                    </div>
                ))}

        </div>
    )
}
