import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IShipment, ShipmentStatus } from "@/types"
import { Package, Calendar, ListChecks } from "lucide-react"
import moment from "moment"

interface ShipmentDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    shipment: IShipment | null
}

const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
        case ShipmentStatus.PENDING:
            return <Badge className="bg-yellow-600">Đang chờ xử lý</Badge>
        case ShipmentStatus.IN_PROGRESS:
            return <Badge className="bg-yellow-600">Đang xử lý</Badge>
        case ShipmentStatus.COMPLETED:
            return <Badge className="bg-green-600">Hoàn thành</Badge>
        case ShipmentStatus.CANCELLED:
            return <Badge className="bg-red-600">Đã hủy</Badge>
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
}

export const ShipmentDetailDialog = ({ open, onOpenChange, shipment }: ShipmentDetailDialogProps) => {
    if (!shipment) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="flex gap-2 items-center text-xl">
                                <Package className="w-5 h-5 text-blue-600" />
                                Chi Tiết Lô Hàng
                            </DialogTitle>
                            <DialogDescription>Thông tin chi tiết về lô hàng {shipment.id}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="pt-4 space-y-6">
                    {/* General Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Mã lô hàng</p>
                            <p className="font-semibold">{shipment.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Trạng thái</p>
                            <div>{getStatusBadge(shipment.status || ShipmentStatus.PENDING)}</div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                                <Calendar className="inline mr-1 w-4 h-4" />
                                Ngày tạo
                            </p>
                            <p className="font-medium">
                                {shipment.createdAt
                                    ? moment(shipment.createdAt).format("DD/MM/YYYY HH:mm:ss")
                                    : "—"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                                <ListChecks className="inline mr-1 w-4 h-4" />
                                Số lượng sản phẩm
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                                {shipment.items?.length || 0} sản phẩm
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    {shipment.items && shipment.items.length > 0 ? (
                        <div className="rounded-lg border">
                            <div className="p-4 bg-gray-50 border-b">
                                <h3 className="font-semibold text-gray-900">Danh sách sản phẩm</h3>
                                <p className="text-sm text-gray-600">
                                    Tổng cộng {shipment.items.length} sản phẩm trong lô hàng
                                </p>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">STT</TableHead>
                                            <TableHead>Mã sản phẩm</TableHead>
                                            <TableHead className="hidden md:table-cell">Ngày thêm</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shipment.items.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-mono text-sm">{item.id}</TableCell>
                                                <TableCell className="hidden text-sm text-gray-600 md:table-cell">
                                                    {item.createdAt
                                                        ? moment(item.createdAt).format("DD/MM/YYYY HH:mm")
                                                        : "—"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-gray-50 rounded-lg border">
                            <Package className="mx-auto w-12 h-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Lô hàng chưa có sản phẩm nào</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

