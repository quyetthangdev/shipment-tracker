import { useEffect, useRef, useState } from "react"

import { } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui"
import { ConfirmClearShipmentDialog, ConfirmCreateShipmentDialog, DeleteItemDialog, ShipmentsNumberDialog } from "@/components/app/dialog"
import { useShipmentStore } from "@/stores"
import { ShipmentScannerButton } from "@/components/app/button"
import ShipmentItemScannerButton from "@/components/app/button/shipment-item-scanner-button"
import moment from "moment"

interface ShipmentsTabProps {
    currentUser: "admin" | "user"
    onShipmentSelect: (shipmentId: string) => void
}

export default function ShipmentsTab({ currentUser }: ShipmentsTabProps) {
    const [scannedData, setScannedData] = useState<string | null>(null); // Dữ liệu quét từ GM65
    const [isListeningForScanner, setIsListeningForScanner] = useState(false); // Lắng nghe input từ scanner
    const { shipment } = useShipmentStore();

    const scannerInputRef = useRef<string>(''); // Lưu input từ scanner
    const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout để phát hiện kết thúc scan

    const handleSetShipmentSuccess = () => {
        setScannedData(null); // Reset sau khi đã xử lý dữ liệu
        setIsListeningForScanner(false); // Dừng lắng nghe scanner
    }

    // Xử lý input từ mắt đọc GM65
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Chỉ xử lý khi đang lắng nghe scanner
            if (isListeningForScanner) {
                // GM65 thường kết thúc bằng Enter hoặc Tab
                if (event.key === 'Enter' || event.key === 'Tab') {
                    if (scannerInputRef.current.trim()) {
                        console.log("✅ Scanner result:", scannerInputRef.current);
                        setScannedData(scannerInputRef.current.trim());
                        setIsListeningForScanner(false);
                        scannerInputRef.current = '';

                        // Clear timeout
                        if (scannerTimeoutRef.current) {
                            clearTimeout(scannerTimeoutRef.current);
                            scannerTimeoutRef.current = null;
                        }
                    }
                    event.preventDefault();
                } else if (event.key.length === 1 || event.key === 'Shift' || event.key === 'Control') {
                    // Chỉ nhận các ký tự có thể in được và một số phím đặc biệt
                    if (event.key.length === 1) {
                        scannerInputRef.current += event.key;

                        // Clear timeout cũ và tạo timeout mới
                        if (scannerTimeoutRef.current) {
                            clearTimeout(scannerTimeoutRef.current);
                        }

                        // Nếu không có input trong 1000ms, reset (GM65 quét khá nhanh)
                        scannerTimeoutRef.current = setTimeout(() => {
                            scannerInputRef.current = '';
                        }, 1000);
                    }

                    // Ngăn không cho input hiển thị trên page
                    event.preventDefault();
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            if (scannerTimeoutRef.current) {
                clearTimeout(scannerTimeoutRef.current);
            }
        };
    }, [isListeningForScanner]);

    const isAdmin = currentUser === "admin"
    return (
        <div className="space-y-6">
            {/* Nút bật/tắt quét GM65 Scanner */}
            <div className="space-y-4">
                <div className="">
                    {/* {!shipment?.id && ( */}
                    <ShipmentScannerButton onSuccess={(data) => setScannedData(data)} />
                    {/* )} */}

                    {/* Hiển thị trạng thái scanner */}
                    {/* {isListeningForScanner && (
                        <Badge variant="default" className="text-xs bg-green-600">
                            🟢 Sẵn sàng nhận dữ liệu từ GM65
                        </Badge>
                    )} */}
                </div>

                {/* Hướng dẫn sử dụng GM65 */}
                {/* <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <QrCode className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Hướng dẫn sử dụng GM65 Scanner
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ol className="ml-4 space-y-1 list-decimal">
                                    <li>Nhấn nút "🟢 Bắt đầu GM65 Scanner" ở trên để kích hoạt</li>
                                    <li>Khi thấy trạng thái "🟢 Sẵn sàng nhận dữ liệu từ GM65", hãy quét mã vạch</li>
                                    <li>GM65 sẽ tự động gửi dữ liệu sau khi quét thành công</li>
                                    <li>Dữ liệu sẽ hiển thị tự động và scanner sẽ tự dừng</li>
                                    <li><strong>Lưu ý:</strong> Chỉ quét khi đã bấm nút kích hoạt để tránh nhiễu</li>
                                </ol>
                            </div>
                            {isListeningForScanner && (
                                <div className="p-3 mt-3 bg-green-100 border border-green-300 rounded">
                                    <p className="text-sm font-medium text-green-800">
                                        ✅ Scanner đã sẵn sàng! Hãy quét mã vạch bằng GM65 ngay bây giờ.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div> */}
            </div>

            {/* Hiển thị thông tin quét được */}
            {scannedData && (
                <ShipmentsNumberDialog shipmentId={scannedData} onClose={handleSetShipmentSuccess} />
            )}

            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Lô hàng</h2>
                    <p className="text-gray-600">Quản lý và theo dõi lô hàng của bạn</p>
                </div>
            </div>

            {/* Stats Cards */}
            {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
            </div> */}

            {/* Shipments Table */}
            {!shipment?.id ? (
                <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">Không có lô hàng nào.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <Badge variant="outline" className="flex justify-center w-full py-2 text-sm text-green-600 border-green-500">
                        Mã lô hàng: {shipment?.id}
                    </Badge>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <span className="text-sm text-muted-foreground">
                            Thời gian tạo: {moment(shipment.createdAt).format("HH:mm:ss DD/MM/YYYY")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Người tạo: {shipment.creator}
                        </span>
                    </div>

                </div>
            )}
            {shipment?.id && (
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách vật tư</CardTitle>
                        <CardDescription>{isAdmin ? "Tất cả vật tư trong lô hàng" : "Vật tư của bạn"}</CardDescription>
                        {shipment?.id && (
                            <ShipmentItemScannerButton />
                        )}
                    </CardHeader>

                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table className="min-w-full table-auto">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-3/4">Mã vật tư</TableHead>
                                        <TableHead className="w-1/4 text-center">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shipment?.items?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium break-all">{item.id}</TableCell>
                                            <TableCell className="flex justify-center w-full text-center">
                                                <DeleteItemDialog item={item.id} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                        </div>
                    </CardContent>
                </Card>
            )}
            {shipment?.id && (
                <div className="flex items-center justify-between gap-4">
                    <ConfirmClearShipmentDialog shipmentId={shipment.id} />
                    <ConfirmCreateShipmentDialog shipment={shipment} />
                </div>
            )}
        </div>
    )
}
