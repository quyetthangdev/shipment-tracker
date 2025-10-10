import { useState } from "react"
import { Package, QrCode, LogOut, Settings, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button, Badge, Avatar, AvatarFallback, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ShipmentDetailTab, ShipmentsTabUseGM65 } from "../components"
import { useAuthStore } from "@/stores"
import { ROUTES } from "@/constants"

export default function EmployeePage() {
    const [activeTab, setActiveTab] = useState("shipments") // Luôn bắt đầu với tab "shipments"
    const { logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate(ROUTES.LOGIN)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-40 px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mx-auto max-w-7xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <QrCode className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Shipment Tracker</h1>
                            <p className="text-sm text-gray-500">Barcode Scanning System</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative w-10 h-10 rounded-full">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="text-white bg-blue-600">
                                            <User className="w-4 h-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <div className="flex gap-2 justify-start items-center p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <Badge variant="secondary" className="text-xs w-fit">
                                            {/* {user.role} */}
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
            <main className="pb-6 mx-auto max-w-7xl">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    {/* Sticky Tabs Navigation */}
                    <div className="sticky top-[81px] z-30 pb-4 px-4 pt-0 bg-gray-50">
                        <TabsList className="grid grid-cols-2 mx-auto w-full max-w-md shadow-sm">
                            <TabsTrigger value="shipments" className="flex gap-2 justify-center items-center">
                                <Package className="w-4 h-4" />
                                <span>Tạo Shipment</span>
                            </TabsTrigger>
                            <TabsTrigger value="shipment-detail" className="flex gap-2 justify-center items-center">
                                <QrCode className="w-4 h-4" />
                                <span>Lịch sử</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="shipments" className="space-y-6">
                        <ShipmentsTabUseGM65 />
                    </TabsContent>

                    <TabsContent value="shipment-detail" className="space-y-6">
                        <ShipmentDetailTab />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
