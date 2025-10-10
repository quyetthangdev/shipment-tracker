import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui";
import { useShipmentStore, useAuthStore } from "@/stores";
import { ShipmentStatus } from "@/types";

export default function ShipmentItemScannerButton({ onIsScanning }: { onIsScanning?: (isScanning: boolean) => void }) {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code'); // Shipment code từ URL

    const [isListeningForScanner, setIsListeningForScanner] = useState(false);
    const scannerInputRef = useRef<string>('');
    const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { shipments, addItemToBilling, activeBillingId } = useShipmentStore();
    const { user } = useAuthStore();

    // Tìm shipment hiện tại dựa trên code từ URL
    const activeShipment = code ? shipments.find(s => s.id === code) : null;
    const activeBilling = activeShipment && activeBillingId
        ? activeShipment.billings?.find(b => b.id === activeBillingId)
        : null;

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isListeningForScanner || !activeShipment || !activeBilling) return;

            if (event.key === 'Enter' || event.key === 'Tab') {
                const scannedCode = scannerInputRef.current.trim();
                console.log("Scanned code:", scannedCode);

                if (scannedCode) {
                    // Kiểm tra xem shipment có đang ở trạng thái có thể chỉnh sửa không
                    if (activeShipment.status === ShipmentStatus.COMPLETED) {
                        toast.error(`Shipment ${activeShipment.id} đã hoàn thành, không thể thêm vật tư`);
                    } else if (!activeBillingId) {
                        toast.error(`Vui lòng chọn billing trước khi quét vật tư`);
                    } else {
                        // Kiểm tra item đã tồn tại trong billing chưa
                        const isDuplicate = activeBilling.items?.some(i => i.id === scannedCode);
                        if (isDuplicate) {
                            toast.error(`Vật tư ${scannedCode} đã có trong billing ${activeBillingId}`);
                        } else {
                            const currentUser = user?.username || "Unknown";
                            // Thêm item vào billing hiện tại
                            addItemToBilling(activeShipment.id!, activeBillingId, {
                                id: scannedCode,
                                creator: currentUser,
                                createdAt: new Date().toISOString()
                            });
                            toast.success(`Đã thêm vật tư ${scannedCode} vào billing ${activeBillingId}`);
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
    }, [isListeningForScanner, activeShipment, activeBilling, activeBillingId, addItemToBilling, user?.username]);

    return (
        <div className="space-y-3">
            {!activeShipment || !activeBilling ? (
                <div className="p-3 text-center bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600">
                        {!activeShipment ? "Cần có shipment để quét vật tư" : "Vui lòng chọn billing trước"}
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
                        {isListeningForScanner ? "Dừng quét" : "Quét vật tư"}
                    </Button>

                    {/* <div className="p-3 bg-gray-50 rounded-lg border">
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
                                <div className="overflow-y-auto space-y-1 max-h-32">
                                    {activeShipment.items.map((item, index) => (
                                        <div key={item.id} className="px-2 py-1 text-xs bg-white rounded border">
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
