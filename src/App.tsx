"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ShipmentsTab, ShipmentDetailTab, AuditLogsTab, UsersTab } from "@/app/components"
import { Package, QrCode, FileText, Users, LogOut, Settings } from "lucide-react"

// Mock user data
const mockUsers = {
  admin: {
    id: "admin-1",
    name: "John Admin",
    email: "admin@company.com",
    role: "Admin",
    initials: "JA",
  },
  user: {
    id: "user-1",
    name: "Sarah User",
    email: "user@company.com",
    role: "User",
    initials: "SU",
  },
}

export default function Component() {
  const [currentUser, setCurrentUser] = useState<"admin" | "user">("admin")
  const [activeTab, setActiveTab] = useState("shipments")
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null)

  const user = mockUsers[currentUser]
  const isAdmin = currentUser === "admin"

  const handleShipmentSelect = (shipmentId: string) => {
    setSelectedShipment(shipmentId)
    setActiveTab("shipment-detail")
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            {/* Role Switcher for Demo */}
            <div className="items-center hidden p-1 space-x-2 bg-gray-100 rounded-lg sm:flex">
              <Button
                variant={currentUser === "admin" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentUser("admin")}
                className="text-xs"
              >
                Admin View
              </Button>
              <Button
                variant={currentUser === "user" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentUser("user")}
                className="text-xs"
              >
                User View
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative w-10 h-10 rounded-full">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-white bg-blue-600">{user.initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="text-xs w-fit">
                      {user.role}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shipments" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Shipments</span>
            </TabsTrigger>
            <TabsTrigger value="shipment-detail" className="flex items-center space-x-2">
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Detail</span>
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Audit Logs</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="shipments" className="space-y-6">
            <ShipmentsTab currentUser={currentUser} onShipmentSelect={handleShipmentSelect} />
          </TabsContent>

          <TabsContent value="shipment-detail" className="space-y-6">
            <ShipmentDetailTab selectedShipment={selectedShipment} currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="audit-logs" className="space-y-6">
            <AuditLogsTab currentUser={currentUser} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users" className="space-y-6">
              <UsersTab />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
