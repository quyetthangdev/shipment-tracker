import { useState } from "react"
import { Package, QrCode, LogOut, Settings } from "lucide-react"
import { Toaster } from 'react-hot-toast'

import { Button, Badge, Avatar, AvatarFallback, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ShipmentDetailTab, ShipmentsTabUseGM65 } from "./app/components"
// import { ShipmentDetailTab, ShipmentsTabUseGM65 } from "@/app/components"

export default function App() {
  // const [currentUser] = useState<"admin" | "user">("admin")
  const [activeTab, setActiveTab] = useState("shipments")

  // const user = mockUsers[currentUser]
  // const isAdmin = currentUser === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
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
                    <AvatarFallback className="text-white bg-blue-600"></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {/* <p className="font-medium">{user.name}</p> */}
                    {/* <p className="text-xs text-muted-foreground">{user.email}</p> */}
                    <Badge variant="secondary" className="text-xs w-fit">
                      {/* {user.role} */}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 mx-auto max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
            <TabsTrigger value="shipments" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Tạo lô hàng</span>
            </TabsTrigger>
            <TabsTrigger value="shipment-detail" className="flex items-center space-x-2">
              <QrCode className="w-4 h-4" />
              <span>Lịch sử</span>
            </TabsTrigger>
            {/* <TabsTrigger value="audit-logs" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Audit Logs</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            )} */}
          </TabsList>

          <TabsContent value="shipments" className="space-y-6">
            <ShipmentsTabUseGM65 />
          </TabsContent>

          <TabsContent value="shipment-detail" className="space-y-6">
            <ShipmentDetailTab />
          </TabsContent>

          {/* <TabsContent value="audit-logs" className="space-y-6">
            <AuditLogsTab />
          </TabsContent> */}

          {/* {isAdmin && (
            <TabsContent value="users" className="space-y-6">
              <UsersTab />
            </TabsContent>
          )} */}
        </Tabs>
      </main>
    </div>
  )
}
