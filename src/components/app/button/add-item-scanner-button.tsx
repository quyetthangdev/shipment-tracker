import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Package } from "lucide-react";

import { Button } from "@/components/ui";
import { useShipmentStore } from "@/stores";
import { IShipmentItem, ShipmentStatus } from "@/types";

interface AddItemScannerButtonProps {
    activeShipmentId: string | null;
}

export default function AddItemScannerButton({ activeShipmentId }: AddItemScannerButtonProps) {
    const [isListeningForScanner, setIsListeningForScanner] = useState(false);
    const scannerInputRef = useRef<string>('');
    const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { shipments, addShipmentItem } = useShipmentStore();

    const activeShipment = shipments.find(s => s.id === activeShipmentId);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isListeningForScanner || !activeShipmentId) return;

            if (event.key === 'Enter' || event.key === 'Tab') {
                const code = scannerInputRef.current.trim();
                if (code) {
                    const existingItems = activeShipment?.billings.flatMap(billing => billing.items) ?? [];
                    const isDuplicate = existingItems.some(item => item.id === code);

                    if (isDuplicate) {
                        toast.error(`Mã ${code} đã tồn tại trong Shipment ${activeShipmentId}`);
                    } else {
                        const newItem: IShipmentItem = {
                            createdAt: new Date().toISOString(),
                            id: code,
                            creator: "Nguyen Van A", // Thay thế bằng logic thực tế
                        }
                        addShipmentItem(activeShipmentId, newItem);
                        toast.success(`Đã thêm vật tư ${code} vào Shipment ${activeShipmentId}`);
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
    }, [isListeningForScanner, activeShipmentId, addShipmentItem, activeShipment]);

    if (!activeShipmentId || !activeShipment) {
        return null;
    }

    return (
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
            className={`${isListeningForScanner ? "bg-green-600 hover:bg-green-700" : ""}`}
            disabled={activeShipment.status === ShipmentStatus.COMPLETED}
        >
            <Package className="w-4 h-4" />
            {isListeningForScanner ? "Dừng quét" : "Quét thêm vật tư"}
        </Button>
    );
}
