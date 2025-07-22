"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, FileText, Filter, Search } from "lucide-react"
import moment from "moment"
// import { format } from "date-fns"

// Mock audit log data
const mockAuditLogs = {
    admin: [
        {
            id: "log-1",
            timestamp: "2024-01-16 11:45:12",
            action: "QR Scanned",
            details: "QR001234569 scanned for SH001",
            user: "Sarah User",
            deviceId: "DEVICE-001",
            shipmentId: "SH001",
            status: "Success",
        },
        {
            id: "log-2",
            timestamp: "2024-01-16 11:15:33",
            action: "QR Scanned",
            details: "QR001234567 scanned for SH001 (Duplicate)",
            user: "Sarah User",
            deviceId: "DEVICE-001",
            shipmentId: "SH001",
            status: "Duplicate",
        },
        {
            id: "log-3",
            timestamp: "2024-01-16 11:15:00",
            action: "Shipment Created",
            details: "Created shipment SH003 with 200 items",
            user: "John Admin",
            deviceId: "WEB-001",
            shipmentId: "SH003",
            status: "Success",
        },
        {
            id: "log-4",
            timestamp: "2024-01-15 10:32:22",
            action: "QR Scanned",
            details: "QR001234568 scanned for SH001",
            user: "Sarah User",
            deviceId: "DEVICE-001",
            shipmentId: "SH001",
            status: "Success",
        },
        {
            id: "log-5",
            timestamp: "2024-01-15 10:30:15",
            action: "QR Scanned",
            details: "QR001234567 scanned for SH001",
            user: "Sarah User",
            deviceId: "DEVICE-001",
            shipmentId: "SH001",
            status: "Success",
        },
        {
            id: "log-6",
            timestamp: "2024-01-15 09:30:00",
            action: "Shipment Created",
            details: "Created shipment SH001 with 150 items",
            user: "John Admin",
            deviceId: "WEB-001",
            shipmentId: "SH001",
            status: "Success",
        },
        {
            id: "log-7",
            timestamp: "2024-01-15 09:00:00",
            action: "User Login",
            details: "User logged in successfully",
            user: "John Admin",
            deviceId: "WEB-001",
            shipmentId: null,
            status: "Success",
        },
    ],
    user: [
        {
            id: "log-1",
            timestamp: "2024-01-16 11:45:12",
            action: "QR Scanned",
            details: "QR001234569 scanned for SH001",
            user: "Sarah User",
            deviceId: "DEVICE-001",
            shipmentId: "SH001",
            status: "Success",
        },
        {
            id: "log-2",
            timestamp: "2024-01-16 11:15:33",
            action: "QR Scanned",
            details: "QR001234567 scanned for SH001 (Duplicate)",
            user: "Sarah User",
            deviceId: "DEVICE-001",
            shipmentId: "SH001",
            status: "Duplicate",
        },
        {
            id: "log-4",
            timestamp: "2024-01-15 10:32:22",
            action: "QR Scanned",
            details: "QR001234568 scanned for SH001",
            user: "Sarah User",
            deviceId: "DEVICE-001",
            shipmentId: "SH001",
            status: "Success",
        },
        {
            id: "log-5",
            timestamp: "2024-01-15 10:30:15",
            action: "QR Scanned",
            details: "QR001234567 scanned for SH001",
            user: "Sarah User",
            deviceId: "DEVICE-001",
            shipmentId: "SH001",
            status: "Success",
        },
    ],
}

interface AuditLogsTabProps {
    currentUser: "admin" | "user"
}

export default function AuditLogsTab({ currentUser }: AuditLogsTabProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [actionFilter, setActionFilter] = useState("all")
    const [dateFrom, setDateFrom] = useState<Date>()
    const [dateTo, setDateTo] = useState<Date>()

    const logs = mockAuditLogs[currentUser]
    const isAdmin = currentUser === "admin"

    // Filter logs based on search and filters
    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesAction = actionFilter === "all" || log.action === actionFilter

        // Simple date filtering (in a real app, you'd parse the dates properly)
        const matchesDate = true // Simplified for demo

        return matchesSearch && matchesAction && matchesDate
    })

    const handleExportCSV = () => {
        console.log("Exporting to CSV...")
        // In a real app, this would generate and download a CSV file
    }

    const handleExportPDF = () => {
        console.log("Exporting to PDF...")
        // In a real app, this would generate and download a PDF file
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Success":
                return <Badge className="bg-green-600">Success</Badge>
            case "Duplicate":
                return <Badge variant="destructive">Duplicate</Badge>
            case "Error":
                return <Badge variant="destructive">Error</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case "QR Scanned":
                return "📱"
            case "Shipment Created":
                return "📦"
            case "User Login":
                return "🔐"
            default:
                return "📝"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
                    <p className="text-gray-600">
                        {isAdmin ? "All system activities and user actions" : "Your activity history"}
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="mr-2 w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF}>
                        <FileText className="mr-2 w-4 h-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="w-5 h-5" />
                        <span>Filters</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Action</label>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="QR Scanned">QR Scanned</SelectItem>
                                    <SelectItem value="Shipment Created">Shipment Created</SelectItem>
                                    <SelectItem value="User Login">User Login</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date From</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start w-full font-normal text-left bg-transparent">
                                        <CalendarIcon className="mr-2 w-4 h-4" />
                                        {dateFrom ? moment(dateFrom).format("DD/MM/YYYY") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto">
                                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date To</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start w-full font-normal text-left bg-transparent">
                                        <CalendarIcon className="mr-2 w-4 h-4" />
                                        {dateTo ? moment(dateTo).format("DD/MM/YYYY") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto">
                                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                        Showing {filteredLogs.length} of {logs.length} log entries
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead className="hidden md:table-cell">Details</TableHead>
                                    <TableHead className="hidden sm:table-cell">User</TableHead>
                                    <TableHead className="hidden lg:table-cell">Device</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                                            No logs found matching your criteria
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg">{getActionIcon(log.action)}</span>
                                                    <span className="font-medium">{log.action}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden max-w-xs truncate md:table-cell">{log.details}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{log.user}</TableCell>
                                            <TableCell className="hidden font-mono text-sm lg:table-cell">{log.deviceId}</TableCell>
                                            <TableCell>{getStatusBadge(log.status)}</TableCell>
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
