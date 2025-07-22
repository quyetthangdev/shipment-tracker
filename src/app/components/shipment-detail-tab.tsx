"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Scan, AlertTriangle, CheckCircle, Clock } from "lucide-react"

// Mock QR scan data
const mockQRScans = {
    SH001: [
        {
            id: "qr-1",
            qrCode: "QR001234567",
            scanTime: "2024-01-15 10:30:15",
            deviceId: "DEVICE-001",
            isDuplicate: false,
            scannedBy: "Sarah User",
        },
        {
            id: "qr-2",
            qrCode: "QR001234568",
            scanTime: "2024-01-15 10:32:22",
            deviceId: "DEVICE-001",
            isDuplicate: false,
            scannedBy: "Sarah User",
        },
        {
            id: "qr-3",
            qrCode: "QR001234567",
            scanTime: "2024-01-15 11:15:33",
            deviceId: "DEVICE-001",
            isDuplicate: true,
            scannedBy: "Sarah User",
        },
        {
            id: "qr-4",
            qrCode: "QR001234569",
            scanTime: "2024-01-15 11:45:12",
            deviceId: "DEVICE-001",
            isDuplicate: false,
            scannedBy: "Sarah User",
        },
    ],
    SH002: [
        {
            id: "qr-5",
            qrCode: "QR002234567",
            scanTime: "2024-01-14 15:30:15",
            deviceId: "DEVICE-002",
            isDuplicate: false,
            scannedBy: "Mike Johnson",
        },
    ],
    SH003: [
        {
            id: "qr-6",
            qrCode: "QR003234567",
            scanTime: "2024-01-16 12:30:15",
            deviceId: "DEVICE-001",
            isDuplicate: false,
            scannedBy: "Sarah User",
        },
    ],
}

const mockShipmentDetails = {
    SH001: {
        shipNo: "SH001",
        status: "In Progress",
        totalItems: 150,
        scannedItems: 89,
        uniqueScans: 3,
        duplicateScans: 1,
        assignedTo: "Sarah User",
        createdAt: "2024-01-15 09:30",
    },
    SH002: {
        shipNo: "SH002",
        status: "Completed",
        totalItems: 75,
        scannedItems: 75,
        uniqueScans: 1,
        duplicateScans: 0,
        assignedTo: "Mike Johnson",
        createdAt: "2024-01-14 14:20",
    },
    SH003: {
        shipNo: "SH003",
        status: "In Progress",
        totalItems: 200,
        scannedItems: 45,
        uniqueScans: 1,
        duplicateScans: 0,
        assignedTo: "Sarah User",
        createdAt: "2024-01-16 11:15",
    },
}

interface ShipmentDetailTabProps {
    selectedShipment: string | null
    currentUser: "admin" | "user"
}

export default function ShipmentDetailTab({ selectedShipment, currentUser }: ShipmentDetailTabProps) {
    const [isScanDialogOpen, setIsScanDialogOpen] = useState(false)
    const [qrCodeInput, setQrCodeInput] = useState("")

    if (!selectedShipment) {
        return (
            <Card>
                <CardContent className="flex flex-col justify-center items-center py-12">
                    <QrCode className="mb-4 w-12 h-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No Shipment Selected</h3>
                    <p className="text-center text-gray-600">
                        Select a shipment from the Shipments tab to view its details and QR scan history.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const shipmentDetail = mockShipmentDetails[selectedShipment as keyof typeof mockShipmentDetails]
    const qrScans = mockQRScans[selectedShipment as keyof typeof mockQRScans] || []
    const isAdmin = currentUser === "admin"
    const canScan = !isAdmin && shipmentDetail?.assignedTo === "Sarah User"

    const handleScanQR = () => {
        // In a real app, this would process the QR scan
        console.log("Scanning QR:", qrCodeInput)
        setIsScanDialogOpen(false)
        setQrCodeInput("")
    }

    if (!shipmentDetail) {
        return (
            <Card>
                <CardContent className="flex flex-col justify-center items-center py-12">
                    <AlertTriangle className="mb-4 w-12 h-12 text-red-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Shipment Not Found</h3>
                    <p className="text-center text-gray-600">
                        The selected shipment could not be found or you don't have access to it.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shipment Detail</h2>
                    <p className="text-gray-600">QR scan history for {shipmentDetail.shipNo}</p>
                </div>

                {canScan && (
                    <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Scan className="mr-2 w-4 h-4" />
                                Scan QR Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Scan QR Code</DialogTitle>
                                <DialogDescription>Enter or scan a QR code for shipment {shipmentDetail.shipNo}.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 gap-4 items-center">
                                    <Label htmlFor="qrCode" className="text-right">
                                        QR Code
                                    </Label>
                                    <Input
                                        id="qrCode"
                                        value={qrCodeInput}
                                        onChange={(e) => setQrCodeInput(e.target.value)}
                                        className="col-span-3"
                                        placeholder="QR001234567"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleScanQR}>
                                    Process Scan
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Shipment Info Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <Badge
                            variant={shipmentDetail.status === "Completed" ? "default" : "secondary"}
                            className={shipmentDetail.status === "Completed" ? "bg-green-600" : "bg-yellow-600"}
                        >
                            {shipmentDetail.status}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{shipmentDetail.shipNo}</div>
                        <p className="text-xs text-muted-foreground">Created: {shipmentDetail.createdAt}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {shipmentDetail.scannedItems}/{shipmentDetail.totalItems}
                        </div>
                        <div className="mt-2 w-full h-2 bg-gray-200 rounded-full">
                            <div
                                className="h-2 bg-blue-600 rounded-full"
                                style={{ width: `${(shipmentDetail.scannedItems / shipmentDetail.totalItems) * 100}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Unique Scans</CardTitle>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{shipmentDetail.uniqueScans}</div>
                        <p className="text-xs text-muted-foreground">Valid QR codes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{shipmentDetail.duplicateScans}</div>
                        <p className="text-xs text-muted-foreground">Duplicate scans</p>
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
                                    <TableHead className="hidden sm:table-cell">Device ID</TableHead>
                                    <TableHead className="hidden md:table-cell">Scanned By</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {qrScans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                                            No QR codes scanned yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    qrScans.map((scan) => (
                                        <TableRow key={scan.id}>
                                            <TableCell className="font-mono text-sm">{scan.qrCode}</TableCell>
                                            <TableCell>{scan.scanTime}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{scan.deviceId}</TableCell>
                                            <TableCell className="hidden md:table-cell">{scan.scannedBy}</TableCell>
                                            <TableCell>
                                                {scan.isDuplicate ? (
                                                    <Badge variant="destructive" className="flex items-center space-x-1 w-fit">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span>Duplicate</span>
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="default" className="flex items-center space-x-1 bg-green-600 w-fit">
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span>Valid</span>
                                                    </Badge>
                                                )}
                                            </TableCell>
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
