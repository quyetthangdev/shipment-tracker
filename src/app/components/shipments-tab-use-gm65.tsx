import { useEffect, useRef, useState } from "react"

import { } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from "@/components/ui"
import { ConfirmClearShipmentDialog, ConfirmCreateShipmentDialog, DeleteItemDialog, ShipmentsNumberDialog } from "@/components/app/dialog"
import { useShipmentStore } from "@/stores"
import { ShipmentScannerButton } from "@/components/app/button"
import ShipmentItemScannerButton from "@/components/app/button/shipment-item-scanner-button"
import moment from "moment"
import { ShipmentStatus } from "@/types"

interface ShipmentsTabProps {
    currentUser: "admin" | "user"
    onShipmentSelect: (shipmentId: string) => void
}

export default function ShipmentsTab({ currentUser }: ShipmentsTabProps) {
    const [scannedData, setScannedData] = useState<string | null>(null); // Dữ liệu quét từ GM65
    const [isListeningForScanner, setIsListeningForScanner] = useState(false); // Lắng nghe input từ scanner
    const { shipments } = useShipmentStore();

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
                <div>
                    {/* {!shipments.length && ( */}
                    <ShipmentScannerButton onSuccess={(data) => setScannedData(data)} />
                    {/* )} */}
                </div>
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

            {/* Shipments Table */}
            {!shipments.length ? (
                <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">Không có lô hàng nào.</p>
                </div>
            ) : (
                <div>
                    {shipments.length > 0 &&
                        shipments
                            .filter(shipment => shipment.status === ShipmentStatus.PENDING)
                            .map(shipment => (
                                <div key={shipment.id} className="space-y-4">
                                    <Badge
                                        variant="outline"
                                        className="flex justify-center w-full py-2 text-sm text-green-600 border-green-500"
                                    >
                                        Mã lô hàng: {shipment.id}
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
                            ))}
                </div>

            )}
            {shipments
                .filter(shipment => shipment.status === ShipmentStatus.PENDING)
                .map((shipment) => (
                    <div key={shipment.id}>
                        {shipment?.id && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Danh sách vật tư</CardTitle>
                                    <CardDescription>
                                        {isAdmin ? "Tất cả vật tư trong lô hàng" : "Vật tư của bạn"}
                                    </CardDescription>
                                    <ShipmentItemScannerButton />
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
                                                {shipment.items?.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium break-all">
                                                            {item.id}
                                                        </TableCell>
                                                        <TableCell className="flex justify-center w-full text-center">
                                                            <DeleteItemDialog item={item.id} shipmentId={shipment.id} />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        <div className="flex items-center justify-between gap-4 mt-4">
                            <ConfirmClearShipmentDialog shipmentId={shipment.id} />
                            <ConfirmCreateShipmentDialog shipment={shipment} />
                        </div>
                    </div>
                ))}

        </div>
    )
}
