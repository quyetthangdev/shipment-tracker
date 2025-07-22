import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";

export default function ShipmentScannerButton({ onSuccess }: { onSuccess: (data: string) => void }) {
    const [isListeningForScanner, setIsListeningForScanner] = useState(false); // Lắng nghe input từ scanner
    const scannerInputRef = useRef<string>(''); // Lưu input từ scanner
    const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout để phát hiện kết thúc scan

    // Xử lý input từ mắt đọc GM65
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Chỉ xử lý khi đang lắng nghe scanner
            if (isListeningForScanner) {
                // GM65 thường kết thúc bằng Enter hoặc Tab
                if (event.key === 'Enter' || event.key === 'Tab') {
                    if (scannerInputRef.current.trim()) {
                        console.log("✅ Scanner result:", scannerInputRef.current);
                        onSuccess(scannerInputRef.current.trim()); // Gọi callback khi có dữ liệu
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
    }, [isListeningForScanner, onSuccess]);
    return (
        <Button
            onClick={() => {
                if (isListeningForScanner) {
                    // Dừng lắng nghe scanner
                    setIsListeningForScanner(false);
                    scannerInputRef.current = '';
                    if (scannerTimeoutRef.current) {
                        clearTimeout(scannerTimeoutRef.current);
                        scannerTimeoutRef.current = null;
                    }
                } else {
                    // Bắt đầu lắng nghe scanner
                    scannerInputRef.current = ''; // Reset input
                    setIsListeningForScanner(true);
                }
            }}
            className={`w-full ${isListeningForScanner ? "bg-red-600 hover:bg-red-700" : ""
                }`}
        >
            {isListeningForScanner ? "Dừng scan" : "Bắt đầu scan"}
        </Button>
    );
}