import { AlertTriangle } from "lucide-react"

import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui"
import { useCreatedShipmentStore } from "@/stores/created-shipment.store"
import moment from "moment"

export default function ShipmentDetailTab() {
    const { createdShipment } = useCreatedShipmentStore()

    // if (!createdShipment) {
    //     return (
    //         <Card>
    //             <CardContent className="flex flex-col items-center justify-center py-12">
    //                 <QrCode className="w-12 h-12 mb-4 text-gray-400" />
    //                 <h3 className="mb-2 text-lg font-medium text-gray-900">Không có lô hàng nào!</h3>
    //             </CardContent>
    //         </Card>
    //     )
    // }

    if (!createdShipment) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="w-12 h-12 mb-4 text-red-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Không tìm thấy lô hàng</h3>
                    <p className="text-center text-gray-600">
                        Lô hàng đã chọn không thể tìm thấy hoặc bạn không có quyền truy cập.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin chi tiết lô hàng</h2>
                    <p className="text-gray-600">Lịch sử quét QR cho lô hàng {createdShipment.id}</p>
                </div>
            </div>

            {/* Shipment Info Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
                        <Badge
                            variant={createdShipment.status === "Completed" ? "default" : "secondary"}
                            className={createdShipment.status === "Completed" ? "bg-green-600" : "bg-yellow-500 text-white"}
                        >
                            {createdShipment.status === "Completed" ? "Hoàn thành" : "Đang xử lý"}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{createdShipment.id}</div>
                        <p className="text-xs text-muted-foreground">Thời gian tạo: {moment(createdShipment.createdAt).format("HH:mm:ss DD/MM/YYYY")}</p>
                        <p className="text-xs text-muted-foreground">Người tạo: {createdShipment.creator}</p>
                    </CardContent>
                </Card>
            </div>

            {/* QR Scans Table */}
            <Card>
                <CardHeader>
                    <CardTitle>QR Scan History</CardTitle>
                    <CardDescription>All QR codes scanned for this shipment, including duplicates</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>QR Code</TableHead>
                                    <TableHead>Scan Time</TableHead>
                                    <TableHead>Scanned By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {createdShipment && createdShipment?.items && createdShipment.items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                                            No QR codes scanned yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    createdShipment?.items && createdShipment.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-sm">{item.id}</TableCell>
                                            <TableCell>{moment(item.createdAt).format("HH:mm:ss DD/MM/YYYY")}</TableCell>
                                            <TableCell className="text-sm">{item.creator}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
