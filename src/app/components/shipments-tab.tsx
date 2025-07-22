"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
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
import { Plus, Package, Eye, QrCode } from "lucide-react"
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library"

// Mock shipments data
const mockShipments = {
    admin: [
        {
            id: "SH001",
            shipNo: "SH001",
            status: "In Progress",
            createdBy: "John Admin",
            createdAt: "2024-01-15 09:30",
            totalItems: 150,
            scannedItems: 89,
            assignedTo: "Sarah User",
        },
        {
            id: "SH002",
            shipNo: "SH002",
            status: "Completed",
            createdBy: "John Admin",
            createdAt: "2024-01-14 14:20",
            totalItems: 75,
            scannedItems: 75,
            assignedTo: "Mike Johnson",
        },
        {
            id: "SH003",
            shipNo: "SH003",
            status: "In Progress",
            createdBy: "John Admin",
            createdAt: "2024-01-16 11:15",
            totalItems: 200,
            scannedItems: 45,
            assignedTo: "Sarah User",
        },
    ],
    user: [
        {
            id: "SH001",
            shipNo: "SH001",
            status: "In Progress",
            createdBy: "John Admin",
            createdAt: "2024-01-15 09:30",
            totalItems: 150,
            scannedItems: 89,
            assignedTo: "Sarah User",
        },
        {
            id: "SH003",
            shipNo: "SH003",
            status: "In Progress",
            createdBy: "John Admin",
            createdAt: "2024-01-16 11:15",
            totalItems: 200,
            scannedItems: 45,
            assignedTo: "Sarah User",
        },
    ],
}

interface ShipmentsTabProps {
    currentUser: "admin" | "user"
    onShipmentSelect: (shipmentId: string) => void
}

export default function ShipmentsTab({ currentUser, onShipmentSelect }: ShipmentsTabProps) {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newShipment, setNewShipment] = useState({
        totalItems: "",
        assignedTo: "",
    });

    // Sử dụng useMemo để tránh tạo lại hints mỗi lần render
    const hints = useMemo(() => {
        const hintsMap = new Map();
        hintsMap.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13,
            BarcodeFormat.CODE_128,
            BarcodeFormat.QR_CODE,
            BarcodeFormat.DATA_MATRIX,
        ]);
        return hintsMap;
    }, []);

    const [isScanning, setIsScanning] = useState(false); // Thêm trạng thái quét
    const [scannedData, setScannedData] = useState<string | null>(null); // Thêm trạng thái lưu dữ liệu quét
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown'); // Trạng thái quyền camera
    const [permissionError, setPermissionError] = useState<string | null>(null); // Lỗi quyền camera
    const [showPermissionDialog, setShowPermissionDialog] = useState(false); // Hiển thị dialog yêu cầu quyền

    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

    // Test quyền camera bằng cách thử truy cập
    const testCameraAccess = useCallback(async () => {
        try {
            // Kiểm tra xem navigator.mediaDevices có khả dụng không
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error('MediaDevices API not supported');
                setCameraPermission('denied');
                setPermissionError('Trình duyệt không hỗ trợ truy cập camera. Vui lòng sử dụng trình duyệt hiện đại khác.');
                return false;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setCameraPermission('granted');
            return true;
        } catch {
            setCameraPermission('prompt');
            return false;
        }
    }, []);

    // Kiểm tra quyền camera
    const checkCameraPermission = useCallback(async () => {
        try {
            // Kiểm tra xem navigator.permissions có khả dụng không
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
                setCameraPermission(permission.state);
                return permission.state === 'granted';
            }
            // Nếu không hỗ trợ Permission API, thử test quyền camera trực tiếp
            return await testCameraAccess();
        } catch {
            console.log('Permission API not supported');
            return await testCameraAccess();
        }
    }, [testCameraAccess]);

    // Kiểm tra quyền camera khi component mount
    useEffect(() => {
        const initializeCamera = async () => {
            const hasPermission = await checkCameraPermission();
            // Nếu chưa có quyền hoặc cần prompt, hiển thị dialog
            if (!hasPermission) {
                setShowPermissionDialog(true);
            }
        };
        initializeCamera();
    }, [checkCameraPermission]); // Thêm dependency

    // Yêu cầu quyền camera
    const requestCameraPermission = async () => {
        try {
            setPermissionError(null);

            // Kiểm tra xem navigator.mediaDevices có khả dụng không
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setCameraPermission('denied');
                setPermissionError('Trình duyệt không hỗ trợ truy cập camera. Vui lòng sử dụng trình duyệt hiện đại hơn hoặc kiểm tra xem trang web có được tải qua HTTPS không.');
                return false;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            // Dừng stream ngay sau khi test permission
            stream.getTracks().forEach(track => track.stop());
            setCameraPermission('granted');
            setShowPermissionDialog(false); // Đóng dialog khi thành công
            return true;
        } catch (error: unknown) {
            setCameraPermission('denied');
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorName = error instanceof DOMException ? error.name : '';

            if (errorName === 'NotAllowedError') {
                setPermissionError('Quyền camera đã bị từ chối. Vui lòng cấp quyền camera trong cài đặt trình duyệt.');
            } else if (errorName === 'NotFoundError') {
                setPermissionError('Không tìm thấy camera. Vui lòng kiểm tra kết nối camera.');
            } else if (errorName === 'NotSupportedError') {
                setPermissionError('Trình duyệt không hỗ trợ truy cập camera hoặc trang web không được tải qua HTTPS.');
            } else {
                setPermissionError('Lỗi truy cập camera: ' + errorMessage);
            }
            return false;
        }
    };

    useEffect(() => {
        const currentVideoRef = videoRef.current; // Lưu reference ngay từ đầu

        const startScanning = async () => {
            if (isScanning && currentVideoRef) {
                try {
                    // Kiểm tra xem navigator.mediaDevices có khả dụng không
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        console.error('MediaDevices API not supported');
                        alert("Trình duyệt không hỗ trợ truy cập camera. Vui lòng sử dụng trình duyệt hiện đại hơn.");
                        setIsScanning(false);
                        return;
                    }

                    // Yêu cầu quyền camera một cách rõ ràng
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: { ideal: "environment" }, // Camera sau cho mobile
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        }
                    });

                    if (currentVideoRef) {
                        currentVideoRef.srcObject = stream;
                        currentVideoRef.play();
                    }

                    // Khởi tạo code reader
                    const codeReader = new BrowserMultiFormatReader(hints);
                    codeReaderRef.current = codeReader;

                    // Bắt đầu decode
                    codeReader.decodeFromVideoDevice(undefined, currentVideoRef, (result, err) => {
                        if (result) {
                            console.log("✅ Barcode result:", result.getText());
                            setScannedData(result.getText());
                            setIsScanning(false); // Tự dừng sau khi quét
                        }
                        if (err && !(err instanceof NotFoundException)) {
                            console.error("❌ Decode error:", err);
                        }
                    });

                } catch (error) {
                    console.error("❌ Camera access error:", error);
                    alert("Không thể truy cập camera. Vui lòng kiểm tra quyền camera trong trình duyệt.");
                    setIsScanning(false);
                }
            }
        };

        if (isScanning) {
            startScanning();
        }

        return () => {
            // Dọn dẹp khi component unmount hoặc stop scanning
            if (currentVideoRef && currentVideoRef.srcObject) {
                const stream = currentVideoRef.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                currentVideoRef.srcObject = null;
            }
        };
    }, [isScanning, hints]);


    const handleToggleScanning = async () => {
        if (isScanning) {
            // Dừng quét
            const currentVideoRef = videoRef.current;
            if (currentVideoRef && currentVideoRef.srcObject) {
                const stream = currentVideoRef.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                currentVideoRef.srcObject = null;
            }
            setScannedData(null); // Xóa dữ liệu khi tắt quét
            setIsScanning(false);
        } else {
            // Bắt đầu quét - kiểm tra quyền trước
            const hasPermission = await requestCameraPermission();
            if (hasPermission) {
                setIsScanning(true);
            }
        }
    };

    const shipments = mockShipments[currentUser]
    const isAdmin = currentUser === "admin"

    const handleCreateShipment = () => {
        // In a real app, this would create a new shipment
        console.log("Creating shipment:", newShipment)
        setIsCreateDialogOpen(false)
        setNewShipment({ totalItems: "", assignedTo: "" })
    }


    return (
        <div className="space-y-6">
            {/* Dialog yêu cầu quyền camera */}
            <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-blue-600" />
                            Yêu cầu quyền camera
                        </DialogTitle>
                        <DialogDescription>
                            Ứng dụng cần quyền truy cập camera để quét mã vạch và QR code.
                            Vui lòng cấp quyền để sử dụng tính năng này.
                            <br /><br />
                            <strong>Lưu ý:</strong> Tính năng camera chỉ hoạt động trên HTTPS hoặc localhost.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full">
                                    <span className="text-sm font-medium text-blue-600">1</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Nhấn nút "Cấp quyền camera" bên dưới
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full">
                                    <span className="text-sm font-medium text-blue-600">2</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Chọn "Cho phép" khi trình duyệt yêu cầu quyền camera
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full">
                                    <span className="text-sm font-medium text-blue-600">3</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Sau đó bạn có thể sử dụng tính năng quét mã vạch
                                </p>
                            </div>
                        </div>

                        {permissionError && (
                            <div className="p-3 mt-4 border border-red-200 rounded-lg bg-red-50">
                                <p className="text-sm text-red-700">{permissionError}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowPermissionDialog(false)}
                        >
                            Bỏ qua
                        </Button>
                        <Button
                            onClick={requestCameraPermission}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <QrCode className="w-4 h-4 mr-2" />
                            Cấp quyền camera
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Nút bật/tắt quét và trạng thái quyền camera */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button onClick={handleToggleScanning} className="bg-blue-600 hover:bg-blue-700">
                        {isScanning ? "Dừng quét" : "Bắt đầu quét"}
                    </Button>

                    {/* Hiển thị trạng thái quyền camera */}
                    {cameraPermission === 'denied' && (
                        <Badge variant="destructive" className="text-xs">
                            Camera bị từ chối
                        </Badge>
                    )}
                    {cameraPermission === 'granted' && (
                        <Badge variant="default" className="text-xs bg-green-600">
                            Camera được cấp quyền
                        </Badge>
                    )}
                </div>

                {/* Hiển thị lỗi quyền camera */}
                {permissionError && (
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <QrCode className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Lỗi quyền camera
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{permissionError}</p>
                                    <div className="mt-2">
                                        <p className="font-medium">Hướng dẫn cấp quyền:</p>
                                        <ul className="mt-1 ml-4 list-disc">
                                            <li>Nhấn vào biểu tượng khóa hoặc camera trong thanh địa chỉ</li>
                                            <li>Chọn "Cho phép" cho quyền camera</li>
                                            <li>Làm mới trang và thử lại</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <Button
                                        onClick={requestCameraPermission}
                                        size="sm"
                                        variant="outline"
                                        className="text-red-700 border-red-300 hover:bg-red-50"
                                    >
                                        Thử cấp quyền lại
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Hiển thị thông tin quét được */}
            {scannedData && (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h3 className="text-lg font-bold text-green-800">Thông tin quét được:</h3>
                    <p className="font-mono text-green-700">{scannedData}</p>
                </div>
            )}

            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shipments</h2>
                    <p className="text-gray-600">Manage and track your shipments</p>
                </div>

                {/* Video hiển thị khi đang quét */}
                {isScanning && (
                    <div className="w-full max-w-md mx-auto">
                        <video
                            ref={videoRef}
                            style={{
                                width: "100%",
                                maxWidth: "400px",
                                height: "300px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "2px solid #3b82f6"
                            }}
                            playsInline
                            muted
                        />
                    </div>
                )}

                {isAdmin && (
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Shipment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Shipment</DialogTitle>
                                <DialogDescription>Create a new shipment for tracking and scanning.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid items-center grid-cols-4 gap-4">
                                    <Label htmlFor="totalItems" className="text-right">
                                        Total Items
                                    </Label>
                                    <Input
                                        id="totalItems"
                                        type="number"
                                        value={newShipment.totalItems}
                                        onChange={(e) => setNewShipment((prev) => ({ ...prev, totalItems: e.target.value }))}
                                        className="col-span-3"
                                        placeholder="150"
                                    />
                                </div>
                                <div className="grid items-center grid-cols-4 gap-4">
                                    <Label htmlFor="assignedTo" className="text-right">
                                        Assign To
                                    </Label>
                                    <Input
                                        id="assignedTo"
                                        value={newShipment.assignedTo}
                                        onChange={(e) => setNewShipment((prev) => ({ ...prev, assignedTo: e.target.value }))}
                                        className="col-span-3"
                                        placeholder="User name"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" onClick={handleCreateShipment}>
                                    Create Shipment
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
                        <Package className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{shipments.length}</div>
                        <p className="text-xs text-muted-foreground">{isAdmin ? "All shipments" : "Your shipments"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{shipments.filter((s) => s.status === "In Progress").length}</div>
                        <p className="text-xs text-muted-foreground">Active shipments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Package className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{shipments.filter((s) => s.status === "Completed").length}</div>
                        <p className="text-xs text-muted-foreground">Finished shipments</p>
                    </CardContent>
                </Card>
            </div>

            {/* Shipments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Shipment List</CardTitle>
                    <CardDescription>{isAdmin ? "All shipments in the system" : "Your assigned shipments"}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ship No</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden sm:table-cell">Created By</TableHead>
                                    <TableHead className="hidden md:table-cell">Created At</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shipments.map((shipment) => (
                                    <TableRow key={shipment.id}>
                                        <TableCell className="font-medium">{shipment.shipNo}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={shipment.status === "Completed" ? "default" : "secondary"}
                                                className={shipment.status === "Completed" ? "bg-green-600" : "bg-yellow-600"}
                                            >
                                                {shipment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{shipment.createdBy}</TableCell>
                                        <TableCell className="hidden md:table-cell">{shipment.createdAt}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                <div className="text-sm font-medium">
                                                    {shipment.scannedItems}/{shipment.totalItems}
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                                    <div
                                                        className="h-2 bg-blue-600 rounded-full"
                                                        style={{ width: `${(shipment.scannedItems / shipment.totalItems) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">{shipment.assignedTo}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onShipmentSelect(shipment.id)}
                                                className="flex items-center space-x-1"
                                            >
                                                <Eye className="w-3 h-3" />
                                                <span className="hidden sm:inline">View</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
