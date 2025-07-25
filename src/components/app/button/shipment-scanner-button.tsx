import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";

export default function ShipmentScannerButton({
    disabled,
    onSuccess,
}: {
    disabled: boolean;
    onSuccess: (data: string) => void;
}) {
    const [isListeningForScanner, setIsListeningForScanner] = useState(false);
    const scannerInputRef = useRef<string>("");
    const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isListeningForScanner) return;

            if (event.key === "Enter" || event.key === "Tab") {
                const scanned = scannerInputRef.current.trim();
                if (scanned) {
                    // Luôn gọi onSuccess để component cha xử lý logic
                    onSuccess(scanned);

                    setIsListeningForScanner(false);
                    scannerInputRef.current = "";
                    if (scannerTimeoutRef.current) {
                        clearTimeout(scannerTimeoutRef.current);
                        scannerTimeoutRef.current = null;
                    }
                }

                event.preventDefault();
            } else if (event.key.length === 1) {
                scannerInputRef.current += event.key;

                if (scannerTimeoutRef.current) {
                    clearTimeout(scannerTimeoutRef.current);
                }

                scannerTimeoutRef.current = setTimeout(() => {
                    scannerInputRef.current = "";
                }, 1000);

                event.preventDefault();
            }
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
            if (scannerTimeoutRef.current) {
                clearTimeout(scannerTimeoutRef.current);
            }
        };
    }, [isListeningForScanner, onSuccess]);

    const toggleScan = () => {
        setIsListeningForScanner((prev) => !prev);
        scannerInputRef.current = "";

        if (scannerTimeoutRef.current) {
            clearTimeout(scannerTimeoutRef.current);
            scannerTimeoutRef.current = null;
        }
    };

    return (
        <Button
            onClick={toggleScan}
            className={`w-full ${isListeningForScanner ? "bg-destructive hover:bg-red-700" : ""}`}
            disabled={disabled}
        >
            {isListeningForScanner ? "Dừng scan" : "Bắt đầu scan"}
        </Button>
    );
}
