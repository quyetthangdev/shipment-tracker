import { useEffect, useState } from "react";

export default function ScannerTest() {
    const [scannedData, setScannedData] = useState("");
    const [buffer, setBuffer] = useState("");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                if (buffer) {
                    setScannedData(buffer);
                    setBuffer(""); // reset buffer sau khi enter
                }
            } else {
                setBuffer((prev) => prev + e.key);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [buffer]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
            <h1 className="mb-4 text-2xl font-bold">🧪 GM65 Barcode Test</h1>
            <p className="mb-2">Hãy đưa mã vạch/QR vào máy quét GM65.</p>
            <div className="p-4 bg-white border rounded shadow text-center min-w-[300px]">
                <p className="text-sm text-gray-500">Scanned result:</p>
                <div className="mt-2 font-mono text-lg text-blue-600">{scannedData || "Chưa có dữ liệu"}</div>
            </div>
        </div>
    );
}
