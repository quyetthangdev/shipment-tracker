import { useState } from "react"
import { Button } from "@/components/ui"
import { QrCode } from "lucide-react"
import { BarcodeScanner } from "@capacitor-community/barcode-scanner"
import { Capacitor } from "@capacitor/core"

interface QRTracerScannerButtonProps {
    onScanComplete?: (code: string) => void
}

export function QRTracerScannerButton({ onScanComplete }: QRTracerScannerButtonProps) {
    const [isScanning, setIsScanning] = useState(false)

    const handleScan = async () => {
        if (!Capacitor.isNativePlatform()) {
            alert("Tính năng quét QR chỉ khả dụng trên thiết bị di động")
            return
        }

        try {
            setIsScanning(true)

            // Request camera permission
            const status = await BarcodeScanner.checkPermission({ force: true })
            if (!status.granted) {
                alert("Cần cấp quyền camera để quét mã QR")
                setIsScanning(false)
                return
            }

            // Make background transparent
            document.body.classList.add("scanner-active")
            await BarcodeScanner.hideBackground()

            // Start scanning
            const result = await BarcodeScanner.startScan()

            // Remove transparency
            document.body.classList.remove("scanner-active")
            await BarcodeScanner.showBackground()

            if (result.hasContent) {
                onScanComplete?.(result.content || "")
            }
        } catch (error) {
            console.error("Scan error:", error)
            alert("Lỗi khi quét mã QR")
            document.body.classList.remove("scanner-active")
            await BarcodeScanner.showBackground()
        } finally {
            setIsScanning(false)
        }
    }

    return (
        <Button
            onClick={handleScan}
            disabled={isScanning}
            variant="outline"
        >
            <QrCode className="w-4 h-4" />
            {isScanning ? "Đang quét..." : "Quét QR"}
        </Button>
    )
}

