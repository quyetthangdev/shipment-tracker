import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Input } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Download, Eye, Trash2, PackageCheck, Search, Filter } from "lucide-react"
import { useShipmentStore } from "@/stores"
import { ShipmentDetailDialog } from "@/components/app/dialog"
import toast from "react-hot-toast"
import moment from "moment"
import { ShipmentStatus, IShipment } from "@/types"

const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
        case ShipmentStatus.IN_PROGRESS:
            return <Badge className="bg-yellow-600">Đang quét</Badge>
        case ShipmentStatus.COMPLETED:
            return <Badge className="bg-green-600">Đã tạo lô hàng</Badge>
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
}

export const ShipmentsAdminCard = () => {
    const { shipments, removeShipment } = useShipmentStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [dateFilter, setDateFilter] = useState<string>("all")
    const [selectedShipment, setSelectedShipment] = useState<IShipment | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

    const handleDelete = (shipmentId: string | undefined) => {
        if (!shipmentId) return

        if (window.confirm(`Bạn có chắc chắn muốn xóa lô hàng ${shipmentId}?`)) {
            removeShipment(shipmentId)
            toast.success(`Đã xóa lô hàng ${shipmentId}`)
        }
    }

    const getStatusText = (status?: ShipmentStatus) => {
        if (!status) return "Không xác định";
        switch (status) {
            case ShipmentStatus.IN_PROGRESS:
                return "Đang quét"
            case ShipmentStatus.COMPLETED:
                return "Đã tạo lô hàng"
            default:
                return "Không xác định"
        }
    }

    const handleExport = () => {
        if (shipments.length === 0) {
            toast.error("Không có dữ liệu để xuất")
            return
        }

        try {
            // Export to Excel using xlsx
            import("xlsx").then((XLSX) => {
                const data = shipments.map((shipment, index) => ({
                    STT: index + 1,
                    "Mã lô hàng": shipment.id,
                    "Trạng thái": getStatusText(shipment.status),
                    "Số lượng sản phẩm": shipment.items?.length || 0,
                    "Ngày tạo": shipment.createdAt
                        ? moment(shipment.createdAt).format("DD/MM/YYYY HH:mm:ss")
                        : "—",
                }))

                const worksheet = XLSX.utils.json_to_sheet(data)
                const columnWidths = [
                    { wch: 5 },  // STT
                    { wch: 25 }, // Mã lô hàng
                    { wch: 20 }, // Trạng thái
                    { wch: 18 }, // Số lượng sản phẩm
                    { wch: 20 }, // Ngày tạo
                ]
                worksheet["!cols"] = columnWidths

                const workbook = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(workbook, worksheet, "Shipments")

                const fileName = `shipments-${moment().format("YYYYMMDD-HHmmss")}.xlsx`
                XLSX.writeFile(workbook, fileName)

                toast.success("Đã xuất file Excel thành công!")
            })
        } catch (error) {
            toast.error("Lỗi khi xuất file Excel")
            console.error(error)
        }
    }

    // Filter shipments
    const filteredShipments = shipments.filter((shipment) => {
        // Search filter
        const matchesSearch = shipment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true

        // Status filter
        const matchesStatus = statusFilter === "all" || shipment.status === statusFilter

        // Date filter
        let matchesDate = true
        if (dateFilter !== "all" && shipment.createdAt) {
            const shipmentDate = moment(shipment.createdAt)
            const now = moment()

            switch (dateFilter) {
                case "today":
                    matchesDate = shipmentDate.isSame(now, "day")
                    break
                case "week":
                    matchesDate = shipmentDate.isAfter(now.subtract(7, "days"))
                    break
                case "month":
                    matchesDate = shipmentDate.isAfter(now.subtract(30, "days"))
                    break
            }
        }

        return matchesSearch && matchesStatus && matchesDate
    })

    const totalItems = shipments.reduce((sum, s) => sum + (s.items?.length || 0), 0)
    const completedShipments = shipments.filter(s => s.status === ShipmentStatus.COMPLETED).length
    const inProgressShipments = shipments.filter(s => s.status === ShipmentStatus.IN_PROGRESS).length

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                <Card className="rounded-lg shadow-sm">
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tổng lô hàng</CardTitle>
                        <Package className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{shipments.length}</div>
                        <p className="text-xs text-muted-foreground">Tất cả lô hàng</p>
                    </CardContent>
                </Card>

                <Card className="rounded-lg shadow-sm">
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Đang quét</CardTitle>
                        <Package className="w-4 h-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{inProgressShipments}</div>
                        <p className="text-xs text-muted-foreground">Lô hàng đang quét</p>
                    </CardContent>
                </Card>

                <Card className="rounded-lg shadow-sm">
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Đã tạo lô hàng</CardTitle>
                        <PackageCheck className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completedShipments}</div>
                        <p className="text-xs text-muted-foreground">Lô hàng đã tạo</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
                        <Package className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                        <p className="text-xs text-muted-foreground">Tất cả sản phẩm</p>
                    </CardContent>
                </Card>
            </div>

            {/* Shipments Table */}
            <Card className="rounded-lg shadow-sm">
                <CardHeader>
                    <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
                        <div>
                            <CardTitle className="flex gap-2 items-center">
                                <Package className="w-5 h-5" />
                                Danh sách lô hàng
                            </CardTitle>
                            <CardDescription>Quản lý và theo dõi các lô hàng trong hệ thống</CardDescription>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={shipments.length === 0}
                        >
                            <Download className="w-4 h-4" />
                            Xuất Excel
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
                        <div className="relative">
                            <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Tìm mã lô hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value={ShipmentStatus.IN_PROGRESS}>Đang quét</SelectItem>
                                <SelectItem value={ShipmentStatus.COMPLETED}>Đã tạo lô hàng</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả thời gian</SelectItem>
                                <SelectItem value="today">Hôm nay</SelectItem>
                                <SelectItem value="week">7 ngày qua</SelectItem>
                                <SelectItem value="month">30 ngày qua</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Filter summary */}
                    {(searchTerm || statusFilter !== "all" || dateFilter !== "all") && (
                        <div className="flex gap-2 items-center pt-2 text-sm text-gray-600">
                            <Filter className="w-4 h-4" />
                            <span>
                                Hiển thị {filteredShipments.length} / {shipments.length} lô hàng
                            </span>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã lô hàng</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="hidden md:table-cell">Số sản phẩm</TableHead>
                                    <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                                    <TableHead>Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredShipments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                            {shipments.length === 0
                                                ? "Chưa có lô hàng nào"
                                                : "Không tìm thấy lô hàng phù hợp"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredShipments
                                        .sort((a, b) => {
                                            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                                            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
                                            return dateB - dateA
                                        })
                                        .map((shipment) => (
                                            <TableRow key={shipment.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Package className="w-4 h-4 text-blue-600" />
                                                        <span className="font-medium">{shipment.id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(shipment.status || ShipmentStatus.IN_PROGRESS)}</TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant="outline">
                                                        {shipment.items?.length || 0} sản phẩm
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden text-sm lg:table-cell">
                                                    {shipment.createdAt
                                                        ? moment(shipment.createdAt).format("DD/MM/YYYY HH:mm")
                                                        : "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedShipment(shipment)
                                                                setIsDetailDialogOpen(true)
                                                            }}
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            <span className="hidden ml-1 sm:inline">Chi tiết</span>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(shipment.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            <span className="hidden ml-1 sm:inline">Xóa</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Shipment Detail Dialog */}
            <ShipmentDetailDialog
                open={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}
                shipment={selectedShipment}
            />
        </div>
    )
}

