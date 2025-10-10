import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, Button, Input } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuditAction, IAuditLog } from "@/types"
import { Activity, UserPlus, UserMinus, LogIn, LogOut, Package, Edit, Trash2, Download, Search, Filter } from "lucide-react"
import { useAuditLogStore } from "@/stores"
import { exportAuditLogsToExcel } from "@/lib/export-audit-logs"
import toast from "react-hot-toast"
import moment from "moment"

// Mock audit logs data
const mockAuditLogs: IAuditLog[] = [
    {
        id: "log-1",
        action: AuditAction.LOGIN,
        actionLabel: "Đăng nhập",
        user: "admin",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        ipAddress: "192.168.1.100",
        details: "Đăng nhập thành công từ Chrome",
    },
    {
        id: "log-2",
        action: AuditAction.CREATE_USER,
        actionLabel: "Tạo người dùng",
        user: "admin",
        target: "Nguyễn Văn A",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        ipAddress: "192.168.1.100",
        details: "Thêm người dùng mới vào hệ thống",
    },
    {
        id: "log-3",
        action: AuditAction.DELETE_USER,
        actionLabel: "Xóa người dùng",
        user: "admin",
        target: "Trần Thị B",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        ipAddress: "192.168.1.100",
        details: "Xóa người dùng khỏi hệ thống",
    },
    {
        id: "log-4",
        action: AuditAction.CREATE_SHIPMENT,
        actionLabel: "Tạo Shipment",
        user: "user",
        target: "LH-20240116-001",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        ipAddress: "192.168.1.105",
        details: "Tạo Shipment mới với 15 items",
    },
    {
        id: "log-5",
        action: AuditAction.UPDATE_USER,
        actionLabel: "Cập nhật người dùng",
        user: "admin",
        target: "Lê Văn C",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        ipAddress: "192.168.1.100",
        details: "Cập nhật thông tin số điện thoại",
    },
    {
        id: "log-6",
        action: AuditAction.LOGOUT,
        actionLabel: "Đăng xuất",
        user: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        ipAddress: "192.168.1.105",
        details: "Đăng xuất khỏi hệ thống",
    },
    {
        id: "log-7",
        action: AuditAction.DELETE_SHIPMENT,
        actionLabel: "Xóa Shipment",
        user: "admin",
        target: "LH-20240115-099",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        ipAddress: "192.168.1.100",
        details: "Xóa Shipment đã hoàn thành",
    },
    {
        id: "log-8",
        action: AuditAction.LOGIN,
        actionLabel: "Đăng nhập",
        user: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(), // 2.5 hours ago
        ipAddress: "192.168.1.105",
        details: "Đăng nhập thành công từ Firefox",
    },
]

const getActionIcon = (action: AuditAction) => {
    const iconClass = "w-4 h-4"
    switch (action) {
        case AuditAction.LOGIN:
            return <LogIn className={iconClass} />
        case AuditAction.LOGOUT:
            return <LogOut className={iconClass} />
        case AuditAction.CREATE_USER:
            return <UserPlus className={iconClass} />
        case AuditAction.UPDATE_USER:
            return <Edit className={iconClass} />
        case AuditAction.DELETE_USER:
            return <UserMinus className={iconClass} />
        case AuditAction.CREATE_SHIPMENT:
            return <Package className={iconClass} />
        case AuditAction.UPDATE_SHIPMENT:
            return <Edit className={iconClass} />
        case AuditAction.DELETE_SHIPMENT:
            return <Trash2 className={iconClass} />
        default:
            return <Activity className={iconClass} />
    }
}

const getActionBadge = (action: AuditAction) => {
    switch (action) {
        case AuditAction.LOGIN:
            return <Badge className="bg-green-600">Đăng nhập</Badge>
        case AuditAction.LOGOUT:
            return <Badge className="bg-gray-600">Đăng xuất</Badge>
        case AuditAction.CREATE_USER:
            return <Badge className="bg-blue-600">Tạo User</Badge>
        case AuditAction.UPDATE_USER:
            return <Badge className="bg-yellow-600">Cập nhật</Badge>
        case AuditAction.DELETE_USER:
            return <Badge className="bg-red-600">Xóa User</Badge>
        case AuditAction.CREATE_SHIPMENT:
            return <Badge className="bg-purple-600">Tạo LH</Badge>
        case AuditAction.UPDATE_SHIPMENT:
            return <Badge className="bg-orange-600">Sửa LH</Badge>
        case AuditAction.DELETE_SHIPMENT:
            return <Badge className="bg-red-700">Xóa LH</Badge>
        default:
            return <Badge variant="secondary">{action}</Badge>
    }
}

const getUserDisplayName = (username: string) => {
    const userMap: Record<string, string> = {
        "admin": "Quản lý",
        "user": "Nhân viên",
    }

    return userMap[username.toLowerCase()] || username
}

export const AuditLogsCard = () => {
    const { logs } = useAuditLogStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [actionFilter, setActionFilter] = useState<string>("all")
    const [userFilter, setUserFilter] = useState<string>("all")
    const [dateFilter, setDateFilter] = useState<string>("all")

    // Combine mock data with real logs from store, filter out system logs
    const allLogs = [...logs, ...mockAuditLogs]
        .filter(log => log.user?.toLowerCase() !== 'system')
        .sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )

    // Get unique users for filter (bỏ Unknown)
    const uniqueUsers = Array.from(new Set(allLogs.map(log => log.user)))
        .filter(user => user !== "Unknown")

    // Filter logs
    const filteredLogs = allLogs.filter((log) => {
        // Search filter (search in user, target, details)
        const matchesSearch =
            log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.actionLabel?.toLowerCase().includes(searchTerm.toLowerCase())

        // Action filter
        const matchesAction = actionFilter === "all" || log.action === actionFilter

        // User filter
        const matchesUser = userFilter === "all" || log.user === userFilter

        // Date filter
        let matchesDate = true
        if (dateFilter !== "all") {
            const logDate = moment(log.timestamp)
            const now = moment()

            switch (dateFilter) {
                case "today":
                    matchesDate = logDate.isSame(now, "day")
                    break
                case "week":
                    matchesDate = logDate.isAfter(now.subtract(7, "days"))
                    break
                case "month":
                    matchesDate = logDate.isAfter(now.subtract(30, "days"))
                    break
            }
        }

        return matchesSearch && matchesAction && matchesUser && matchesDate
    })

    const handleExport = () => {
        const logsToExport = filteredLogs.length > 0 ? filteredLogs : allLogs

        if (logsToExport.length === 0) {
            toast.error("Không có dữ liệu để xuất")
            return
        }

        try {
            exportAuditLogsToExcel(logsToExport)
            toast.success(`Đã xuất ${logsToExport.length} log thành công!`)
        } catch (error) {
            toast.error("Lỗi khi xuất file Excel")
            console.error(error)
        }
    }

    return (
        <Card className="rounded-lg shadow-sm">
            <CardHeader>
                <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
                    <div>
                        <CardTitle className="flex gap-2 items-center">
                            <Activity className="w-5 h-5" />
                            Nhật ký hoạt động
                        </CardTitle>
                        <CardDescription>Theo dõi các hoạt động trong hệ thống</CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Download className="w-4 h-4" />
                            Xuất Excel
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 gap-2 pt-4 md:grid-cols-4">
                    <div className="relative">
                        <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm theo hành động..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Hành động" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả hành động</SelectItem>
                            <SelectItem value={AuditAction.LOGIN}>Đăng nhập</SelectItem>
                            <SelectItem value={AuditAction.LOGOUT}>Đăng xuất</SelectItem>
                            <SelectItem value={AuditAction.CREATE_USER}>Tạo người dùng</SelectItem>
                            <SelectItem value={AuditAction.UPDATE_USER}>Cập nhật người dùng</SelectItem>
                            <SelectItem value={AuditAction.DELETE_USER}>Xóa người dùng</SelectItem>
                            <SelectItem value={AuditAction.CREATE_SHIPMENT}>Tạo Shipment</SelectItem>
                            <SelectItem value={AuditAction.DELETE_SHIPMENT}>Xóa Shipment</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Người dùng" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả vai trò</SelectItem>
                            {uniqueUsers.map((user) => (
                                <SelectItem key={user} value={user}>
                                    {getUserDisplayName(user)}
                                </SelectItem>
                            ))}
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
                {(searchTerm || actionFilter !== "all" || userFilter !== "all" || dateFilter !== "all") && (
                    <div className="flex gap-2 items-center pt-2 text-sm text-gray-600">
                        <Filter className="w-4 h-4" />
                        <span>
                            Hiển thị {filteredLogs.length} / {allLogs.length} log
                        </span>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Người dùng</TableHead>
                                <TableHead>Hành động</TableHead>
                                <TableHead className="hidden lg:table-cell">Đối tượng</TableHead>
                                <TableHead className="hidden xl:table-cell">IP Address</TableHead>
                                <TableHead className="hidden 2xl:table-cell">Chi tiết</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                        {allLogs.length === 0
                                            ? "Chưa có hoạt động nào"
                                            : "Không tìm thấy hoạt động phù hợp"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-sm text-gray-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">
                                                    {moment(log.timestamp).format("HH:mm:ss")}
                                                </span>
                                                <span className="text-xs">
                                                    {moment(log.timestamp).format("DD/MM/YYYY")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 items-center">
                                                <Avatar className="w-7 h-7">
                                                    <AvatarFallback className="text-xs text-white bg-blue-600">
                                                        {log.user.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">{getUserDisplayName(log.user)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 items-center">
                                                {getActionIcon(log.action)}
                                                {getActionBadge(log.action)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {log.target ? (
                                                <span className="text-sm font-medium text-gray-900">{log.target}</span>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden text-xs text-gray-500 xl:table-cell">
                                            {log.ipAddress || "—"}
                                        </TableCell>
                                        <TableCell className="hidden max-w-xs text-xs text-gray-600 truncate 2xl:table-cell">
                                            {log.details || "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

