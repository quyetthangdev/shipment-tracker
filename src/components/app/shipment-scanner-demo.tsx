import { ShipmentItemScannerButton } from "@/components/app/button";

export default function ShipmentScannerDemo() {
    return (
        <div className="max-w-md p-6 mx-auto">
            <h2 className="mb-4 text-xl font-bold">Shipment Scanner Demo</h2>
            <div className="space-y-4">
                <div className="text-sm text-gray-600">
                    <p>Hướng dẫn sử dụng:</p>
                    <ol className="mt-2 space-y-1 list-decimal list-inside">
                        <li>Nhấn "Scan Shipment" để bắt đầu quét mã QR shipment</li>
                        <li>Quét mã QR của shipment</li>
                        <li>Nếu shipment chưa tồn tại → tạo mới</li>
                        <li>Nếu đã tồn tại và chưa hoàn thành → hiển thị thông tin</li>
                        <li>Nếu đã hoàn thành → hiển thị lỗi</li>
                        <li>Sau khi chọn shipment, có thể scan thêm items</li>
                    </ol>
                </div>

                <ShipmentItemScannerButton />
            </div>
        </div>
    );
}
