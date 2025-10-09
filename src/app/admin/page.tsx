import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, Button, Tabs, TabsContent, TabsList, TabsTrigger, Input } from "@/components/ui"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Edit, Trash2, UsersIcon, User, LogOut, Settings, Shield, Activity, Package, Search, Filter } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore, useEmployeeStore } from "@/stores"
import { ROUTES } from "@/constants"
import { AddEmployeeDialog, DeleteEmployeeDialog, UpdateEmployeeDialog } from "@/components/app/dialog"
import { AuditLogsCard } from "@/components/app/audit-logs-card"
import { ShipmentsAdminCard } from "@/components/app/shipments-admin-card"
import moment from "moment"

// Mock users data
const mockUsers = [
    {
        id: "user-1",
        name: "Nguyễn Văn Admin",
        email: "admin@company.com",
        phone: "0901234567",
        password: "admin123",
        role: "Admin",
        status: "Active",
        lastLogin: "2024-01-16 09:00:00",
        createdAt: "2024-01-01 10:00:00",
        initials: "NA",
    },
    {
        id: "user-2",
        name: "Trần Thị User",
        email: "user@company.com",
        phone: "0912345678",
        password: "user123",
        role: "User",
        status: "Active",
        lastLogin: "2024-01-16 11:45:12",
        createdAt: "2024-01-05 14:30:00",
        initials: "TU",
    },
    {
        id: "user-3",
        name: "Lê Văn Minh",
        email: "minh.le@company.com",
        phone: "0923456789",
        password: "minh123",
        role: "User",
        status: "Active",
        lastLogin: "2024-01-15 16:20:00",
        createdAt: "2024-01-10 09:15:00",
        initials: "LM",
    },
    {
        id: "user-4",
        name: "Phạm Thị Lan",
        email: "lan.pham@company.com",
        phone: "0934567890",
        password: "lan123",
        role: "User",
        status: "Inactive",
        lastLogin: "2024-01-10 13:45:00",
        createdAt: "2024-01-08 11:00:00",
        initials: "PL",
    },
    {
        id: "user-5",
        name: "Hoàng Văn Hùng",
        email: "hung.hoang@company.com",
        phone: "0945678901",
        password: "hung123",
        role: "Admin",
        status: "Active",
        lastLogin: "2024-01-16 08:30:00",
        createdAt: "2024-01-03 15:00:00",
        initials: "HH",
    },
]

export default function AdminPage() {
    const { logout, user } = useAuthStore()
    const { employees } = useEmployeeStore()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("users")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string; phone: string; password?: string } | null>(null)

    // User filters
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const handleLogout = () => {
        logout()
        navigate(ROUTES.LOGIN)
    }

    const handleDeleteUser = (userId: string, userName: string) => {
        setSelectedEmployee({ id: userId, name: userName, phone: "" })
        setIsDeleteDialogOpen(true)
    }

    const handleUpdateUser = (userId: string, userName: string, userPhone: string, userPassword?: string) => {
        setSelectedEmployee({ id: userId, name: userName, phone: userPhone, password: userPassword })
        setIsUpdateDialogOpen(true)
    }

    // Combine mock users with real employees from store
    const allUsers = [
        ...mockUsers,
        ...employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            email: emp.phone, // Sử dụng phone như email để hiển thị
            phone: emp.phone,
            password: emp.password,
            role: "User",
            status: "Active",
            lastLogin: moment(emp.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            createdAt: moment(emp.createdAt).format("YYYY-MM-DD HH:mm:ss"),
            initials: emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        }))
    ]

    // Filter users
    const filteredUsers = allUsers.filter((user) => {
        // Search filter (name or email)
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())

        // Role filter
        const matchesRole = roleFilter === "all" || user.role === roleFilter

        // Status filter
        const matchesStatus = statusFilter === "all" || user.status === statusFilter

        return matchesSearch && matchesRole && matchesStatus
    })

    const getRoleBadge = (role: string) => {
        return role === "Admin" ? (
            <Badge className="bg-purple-600">Admin</Badge>
        ) : (
            <Badge variant="secondary">User</Badge>
        )
    }

    const getStatusBadge = (status: string) => {
        return status === "Active" ? (
            <Badge className="bg-green-600">Active</Badge>
        ) : (
            <Badge variant="destructive">Inactive</Badge>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mx-auto max-w-7xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-600 rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
                            <p className="text-sm text-gray-500">Quản lý hệ thống</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative w-10 h-10 rounded-full">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="text-white bg-purple-600">
                                            <User className="w-4 h-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <div className="flex gap-2 justify-start items-center p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <p className="text-sm font-medium">{user?.username}</p>
                                        <Badge variant="secondary" className="text-xs w-fit">
                                            {user?.role}
                                        </Badge>
                                    </div>
                                </div>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 w-4 h-4" />
                                    Cài đặt
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 w-4 h-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 pb-6 mx-auto max-w-7xl">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    {/* Sticky Tabs Navigation */}
                    <div className="sticky top-[65px] z-30 pt-4 pb-4 -mx-4 px-4 bg-gray-50">
                        <TabsList className="grid grid-cols-3 w-full max-w-2xl shadow-sm">
                            <TabsTrigger value="users" className="flex gap-2 items-center">
                                <UsersIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Người Dùng</span>
                                <span className="sm:hidden">Người dùng</span>
                            </TabsTrigger>
                            <TabsTrigger value="shipments" className="flex gap-2 items-center">
                                <Package className="w-4 h-4" />
                                <span className="hidden sm:inline">Lô Hàng</span>
                                <span className="sm:hidden">Lô hàng</span>
                            </TabsTrigger>
                            <TabsTrigger value="audit-logs" className="flex gap-2 items-center">
                                <Activity className="w-4 h-4" />
                                <span className="hidden sm:inline">Nhật Ký</span>
                                <span className="sm:hidden">Nhật ký</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="users" className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
                                <p className="text-gray-600">Quản lý tài khoản người dùng và phân quyền</p>
                            </div>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setIsAddDialogOpen(true)}
                            >
                                <UserPlus className="mr-2 w-4 h-4" />
                                Thêm người dùng
                            </Button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                            <Card className="rounded-lg shadow-sm">
                                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                                    <UsersIcon className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{filteredUsers.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {filteredUsers.length !== allUsers.length
                                            ? `Từ ${allUsers.length} người dùng`
                                            : "Tất cả người dùng"}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-lg shadow-sm">
                                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                                    <UsersIcon className="w-4 h-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">
                                        {filteredUsers.filter((u) => u.status === "Active").length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Người dùng đang hoạt động</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-lg shadow-sm">
                                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium">Quản lý của hệ thống</CardTitle>
                                    <UsersIcon className="w-4 h-4 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-600">
                                        {filteredUsers.filter((u) => u.role === "Admin").length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Quản lý</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-lg shadow-sm">
                                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
                                    <UsersIcon className="w-4 h-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {filteredUsers.filter((u) => u.role === "User").length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Nhân viên</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card className="rounded-lg shadow-none">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="relative">
                                        <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Tìm tên hoặc số điện thoại..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Vai trò" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả vai trò</SelectItem>
                                            <SelectItem value="Admin">Quản lý</SelectItem>
                                            <SelectItem value="User">Nhân viên</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                            <SelectItem value="Active">Hoạt động</SelectItem>
                                            <SelectItem value="Inactive">Không hoạt động</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Filter summary */}
                                {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
                                    <div className="flex gap-2 items-center pt-4 text-sm text-gray-600">
                                        <Filter className="w-4 h-4" />
                                        <span>
                                            Hiển thị {filteredUsers.length} / {allUsers.length} người dùng
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Users Table */}
                        <Card className="rounded-lg shadow-sm">
                            <CardHeader>
                                <CardTitle>Danh sách người dùng</CardTitle>
                                <CardDescription>Quản lý tài khoản, vai trò và quyền hạn người dùng</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Người dùng</TableHead>
                                                <TableHead>Vai trò</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead className="hidden md:table-cell">Đăng nhập cuối</TableHead>
                                                <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                                                <TableHead>Thao tác</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                                        {allUsers.length === 0
                                                            ? "Chưa có người dùng nào"
                                                            : "Không tìm thấy người dùng phù hợp"}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar className="w-8 h-8">
                                                                    <AvatarFallback className="text-xs text-white bg-blue-600">
                                                                        {user.initials}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium">{user.name}</div>
                                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                                                        <TableCell className="hidden text-sm md:table-cell">{user.lastLogin}</TableCell>
                                                        <TableCell className="hidden text-sm lg:table-cell">{user.createdAt}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleUpdateUser(user.id, user.name, user.phone || "", user.password)}
                                                                    className="text-muted-foreground"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                    <span className="hidden ml-1 sm:inline">Cập nhật</span>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteUser(user.id, user.name)}
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
                    </TabsContent>

                    <TabsContent value="shipments" className="space-y-6">
                        <ShipmentsAdminCard />
                    </TabsContent>

                    <TabsContent value="audit-logs" className="space-y-6">
                        <AuditLogsCard />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Add Employee Dialog */}
            <AddEmployeeDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />

            {/* Delete Employee Dialog */}
            <DeleteEmployeeDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                employeeId={selectedEmployee?.id ?? null}
                employeeName={selectedEmployee?.name ?? null}
            />

            {/* Update Employee Dialog */}
            <UpdateEmployeeDialog
                open={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
                employee={selectedEmployee}
            />
        </div>
    )
}
