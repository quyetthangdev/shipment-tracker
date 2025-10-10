import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui"
import { Scan } from "lucide-react"
import toast from "react-hot-toast"

interface QRTracerGM65ScannerButtonProps {
    onScanComplete?: (code: string) => void
}

export function QRTracerGM65ScannerButton({ onScanComplete }: QRTracerGM65ScannerButtonProps) {
    const [isListeningForScanner, setIsListeningForScanner] = useState(false)
    const scannerInputRef = useRef<string>('')
    const scannerTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!isListeningForScanner) return

            if (event.key === 'Enter' || event.key === 'Tab') {
                const scannedCode = scannerInputRef.current.trim()
                console.log("Scanned code:", scannedCode)

                if (scannedCode) {
                    onScanComplete?.(scannedCode)
                    toast.success(`Đã quét mã: ${scannedCode}`)
                }

                scannerInputRef.current = ''
                if (scannerTimeoutRef.current) {
                    clearTimeout(scannerTimeoutRef.current)
                    scannerTimeoutRef.current = null
                }

                event.preventDefault()
            } else if (event.key.length === 1) {
                scannerInputRef.current += event.key

                if (scannerTimeoutRef.current) clearTimeout(scannerTimeoutRef.current)
                scannerTimeoutRef.current = setTimeout(() => {
                    scannerInputRef.current = ''
                }, 1500)

                event.preventDefault()
            }
        }

        document.addEventListener('keydown', handleKeyPress)
        return () => {
            document.removeEventListener('keydown', handleKeyPress)
            if (scannerTimeoutRef.current) clearTimeout(scannerTimeoutRef.current)
        }
    }, [isListeningForScanner, onScanComplete])

    return (
        <Button
            onClick={() => {
                if (isListeningForScanner) {
                    setIsListeningForScanner(false)
                    scannerInputRef.current = ''
                    if (scannerTimeoutRef.current) {
                        clearTimeout(scannerTimeoutRef.current)
                        scannerTimeoutRef.current = null
                    }
                } else {
                    scannerInputRef.current = ''
                    setIsListeningForScanner(true)
                }
            }}
            variant="outline"
            className={isListeningForScanner ? "text-white bg-red-600 hover:bg-red-700 hover:text-white" : ""}
        >
            <Scan className="mr-2 w-4 h-4" />
            {isListeningForScanner ? "Dừng quét" : "Quét GM65"}
        </Button>
    )
}

