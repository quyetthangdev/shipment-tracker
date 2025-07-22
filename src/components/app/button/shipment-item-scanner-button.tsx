import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui";
import { useShipmentStore } from "@/stores";
import { IShipmentItem } from "@/types";

export default function ShipmentItemScannerButton() {
    const [isListeningForScanner, setIsListeningForScanner] = useState(false);
    const scannerInputRef = useRef<string>('');
    const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { shipment, addShipmentItem } = useShipmentStore();

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isListeningForScanner) return;

            if (event.key === 'Enter' || event.key === 'Tab') {
                const code = scannerInputRef.current.trim();
                if (code) {
                    const existingItems = shipment?.items ?? [];
                    const isDuplicate = existingItems.some(item => item.id === code);

                    if (isDuplicate) {
                        toast.error(`Mã QR ${code} đã tồn tại trong shipment`);
                    } else {
                        const newItem: IShipmentItem = {
                            createdAt: new Date().toISOString(),
                            id: code,
                            creator: "Nguyen Van A", // Example creator, replace with actual logic
                        }
                        addShipmentItem(newItem);
                        toast.success(`Đã thêm mã QR ${code}`);
                    }

                    scannerInputRef.current = '';
                    // setIsListeningForScanner(false);

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
                }, 1500); // tăng timeout nếu QR dài hơn

                event.preventDefault();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            if (scannerTimeoutRef.current) clearTimeout(scannerTimeoutRef.current);
        };
    }, [isListeningForScanner, addShipmentItem, shipment]);

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
            className={`${isListeningForScanner ? "bg-red-600 hover:bg-red-700" : ""}`}
        >
            <PlusCircle className="w-4 h-4" />
            {isListeningForScanner ? "Dừng scan" : "Thêm vật tư"}
        </Button>
    );
}
