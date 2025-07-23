import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui";
import { useShipmentStore } from "@/stores";
import { IShipment, ShipmentStatus } from "@/types";
import AddItemScannerButton from "./add-item-scanner-button";

export default function ShipmentItemScannerButton() {
    const [isListeningForScanner, setIsListeningForScanner] = useState(false);
    const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);
    const scannerInputRef = useRef<string>('');
    const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { shipments, addShipmentItem, addShipment } = useShipmentStore();

    const activeShipment = shipments.find(s => s.id === activeShipmentId);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isListeningForScanner) return;

            if (event.key === 'Enter' || event.key === 'Tab') {
                const code = scannerInputRef.current.trim();
                console.log("Scanner input:", code);
                if (code) {
                    const isShipment = /^SHIP-\d+$/.test(code);
                    const isShipmentItem = /^SHIP-\d+-ITEM-\d+$/.test(code);

                    if (isShipment) {
                        const existingShipment = shipments.find(s => s.id === code);
                        if (existingShipment) {
                            if (existingShipment.status === ShipmentStatus.COMPLETED) {
                                toast.error(`Shipment ${code} đã hoàn thành`);
                            } else {
                                setActiveShipmentId(code);
                                toast.success(`Đã chọn shipment ${code}`);
                            }
                        } else {
                            const newShipment: IShipment = {
                                id: code,
                                name: `Shipment ${code}`,
                                trackingNumber: code,
                                items: [],
                                status: ShipmentStatus.PENDING,
                                createdAt: new Date().toISOString(),
                                slug: code.toLowerCase().replace(/\s+/g, '-'),
                                creator: "Nguyen Van A"
                            };
                            addShipment(newShipment);
                            setActiveShipmentId(code);
                            toast.success(`Tạo mới shipment ${code}`);
                        }
                    } else if (isShipmentItem) {
                        const shipmentId = code.split("-ITEM-")[0];
                        const targetShipment = shipments.find(s => s.id === shipmentId);

                        if (!targetShipment) {
                            toast.error(`Không tìm thấy shipment ${shipmentId} cho item ${code}`);
                        } else if (targetShipment.status === ShipmentStatus.COMPLETED) {
                            toast.error(`Shipment ${shipmentId} đã hoàn thành`);
                        } else {
                            const isDuplicate = targetShipment.items?.some(i => i.id === code);
                            if (isDuplicate) {
                                toast.error(`Item ${code} đã có trong shipment`);
                            } else {
                                addShipmentItem(shipmentId, {
                                    id: code,
                                    creator: "Nguyen Van A", // Example creator, replace with actual logic
                                    createdAt: new Date().toISOString()
                                });
                                toast.success(`Đã thêm item ${code} vào shipment ${shipmentId}`);
                            }
                        }
                    } else {
                        toast.error(`Mã không hợp lệ: ${code}`);
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
    }, [isListeningForScanner, addShipmentItem, addShipment, shipments]);

    return (
        <div className="space-y-3">
            <Button
                onClick={() => {
                    if (isListeningForScanner) {
                        setIsListeningForScanner(false);
                        scannerInputRef.current = '';
                        if (scannerTimeoutRef.current) {
                            clearTimeout(scannerTimeoutRef.current);
                            scannerTimeoutRef.current = null;
                        }
                    } else {
                        scannerInputRef.current = '';
                        setIsListeningForScanner(true);
                    }
                }}
                className={`${isListeningForScanner ? "bg-red-600 hover:bg-red-700" : ""}`}
            >
                <PlusCircle className="w-4 h-4" />
                {isListeningForScanner ? "Dừng scan" : "Scan Shipment"}
            </Button>

            {activeShipment && (
                <div className="p-3 border rounded-lg bg-gray-50">
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
                        <AddItemScannerButton activeShipmentId={activeShipmentId} />
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
                </div>
            )}
        </div>
    );
}
