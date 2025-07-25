import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui";
import { useShipmentStore } from "@/stores";
import { ShipmentStatus } from "@/types";

export default function ShipmentItemScannerButton({ onIsScanning }: { onIsScanning?: (isScanning: boolean) => void }) {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code'); // Shipment code từ URL

    const [isListeningForScanner, setIsListeningForScanner] = useState(false);
    const scannerInputRef = useRef<string>('');
    const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { shipments, addShipmentItem } = useShipmentStore();

    // Tìm shipment hiện tại dựa trên code từ URL
    const activeShipment = code ? shipments.find(s => s.id === code) : null;

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isListeningForScanner || !activeShipment) return;

            if (event.key === 'Enter' || event.key === 'Tab') {
                const scannedCode = scannerInputRef.current.trim();
                console.log("Scanned code:", scannedCode);

                if (scannedCode) {
                    // Kiểm tra xem shipment có đang ở trạng thái có thể chỉnh sửa không
                    if (activeShipment.status === ShipmentStatus.COMPLETED) {
                        toast.error(`Lô hàng ${activeShipment.id} đã hoàn thành, không thể thêm vật tư`);
                    } else {
                        // Kiểm tra item đã tồn tại trong shipment chưa
                        const isDuplicate = activeShipment.items?.some(i => i.id === scannedCode);
                        if (isDuplicate) {
                            toast.error(`Vật tư ${scannedCode} đã có trong lô hàng ${activeShipment.id}`);
                        } else {
                            // Thêm item vào shipment hiện tại
                            addShipmentItem(activeShipment.id!, {
                                id: scannedCode,
                                creator: "Nguyen Van A", // Thay bằng user thực tế
                                createdAt: new Date().toISOString()
                            });
                            toast.success(`Đã thêm vật tư ${scannedCode} vào lô hàng ${activeShipment.id}`);
                        }
                    }

                    scannerInputRef.current = '';
                    if (scannerTimeoutRef.current) {
                        clearTimeout(scannerTimeoutRef.current);
                        scannerTimeoutRef.current = null;
                    }
                }
                event.preventDefault();
            } else if (event.key.length === 1) {
                scannerInputRef.current += event.key;

                if (scannerTimeoutRef.current) clearTimeout(scannerTimeoutRef.current);
                scannerTimeoutRef.current = setTimeout(() => {
                    scannerInputRef.current = '';
                }, 1500);

                event.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            if (scannerTimeoutRef.current) clearTimeout(scannerTimeoutRef.current);
        };
    }, [isListeningForScanner, activeShipment, addShipmentItem]);

    return (
        <div className="space-y-3">
            {!activeShipment ? (
                <div className="p-3 text-center border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600">
                        Cần có shipment trong URL để có thể thêm item
                    </p>
                </div>
            ) : (
                <>
                    <Button
                        onClick={() => {
                            if (isListeningForScanner) {
                                setIsListeningForScanner(false);
                                onIsScanning?.(false);
                                scannerInputRef.current = '';
                                if (scannerTimeoutRef.current) {
                                    clearTimeout(scannerTimeoutRef.current);
                                    scannerTimeoutRef.current = null;
                                }
                            } else {
                                scannerInputRef.current = '';
                                setIsListeningForScanner(true);
                                onIsScanning?.(true);
                            }
                        }}
                        className={`w-full ${isListeningForScanner ? "bg-red-600 hover:bg-red-700" : ""}`}
                        disabled={activeShipment.status === ShipmentStatus.COMPLETED}
                    >
                        <PlusCircle className="w-4 h-4" />
                        {isListeningForScanner ? "Dừng quét" : "Quét thêm vật tư"}
                    </Button>

                    {/* <div className="p-3 border rounded-lg bg-gray-50">
                        <div className="space-y-1 text-sm text-gray-600">
                            <div>Shipment: <strong>{activeShipment.id}</strong></div>
                            <div>Tên: <strong>{activeShipment.name}</strong></div>
                            <div>Trạng thái: <span className={`font-semibold ${activeShipment.status === ShipmentStatus.COMPLETED
                                ? 'text-green-600'
                                : 'text-yellow-600'
                                }`}>{activeShipment.status}</span></div>
                            <div>Số items: <strong>{activeShipment.items?.length || 0}</strong></div>
                        </div>

                        <div className="mt-3">
                            <AddItemScannerButton activeShipmentId={activeShipment.id || null} />
                        </div>

                        {activeShipment.items && activeShipment.items.length > 0 && (
                            <div className="mt-3">
                                <div className="mb-2 text-sm font-medium text-gray-700">Items trong shipment:</div>
                                <div className="space-y-1 overflow-y-auto max-h-32">
                                    {activeShipment.items.map((item, index) => (
                                        <div key={item.id} className="px-2 py-1 text-xs bg-white border rounded">
                                            {index + 1}. {item.id}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div> */}
                </>
            )}
        </div>
    );
}
