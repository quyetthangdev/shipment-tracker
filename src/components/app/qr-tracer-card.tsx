import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button, Badge } from "@/components/ui"
import { Search, QrCode, Package, User, Calendar, MapPin, CheckCircle2, XCircle } from "lucide-react"
import { useShipmentStore } from "@/stores"
import { IShipmentItem } from "@/types"
import moment from "moment"
import { QRTracerScannerButton, QRTracerGM65ScannerButton } from "./button"

interface ItemTraceResult {
    item: IShipmentItem
    shipment: {
        id: string
        name?: string
        trackingNumber?: string
        status?: string
        origin?: string
        destination?: string
        creator?: string
        createdAt: string
    }
    billing: {
        id: string
        status: string
        createdAt: string
        creator: string
        itemCount: number
    }
}

export function QRTracerCard() {
    const { shipments } = useShipmentStore()
    const [searchQR, setSearchQR] = useState("")
    const [traceResults, setTraceResults] = useState<ItemTraceResult[]>([])
    const [notFound, setNotFound] = useState(false)

    const handleSearch = (qrCode?: string) => {
        const codeToSearch = qrCode || searchQR
        if (!codeToSearch.trim()) return

        const results: ItemTraceResult[] = []

        // Tìm kiếm item trong tất cả shipments và billings
        for (const shipment of shipments) {
            // Tìm trong từng billing của shipment
            for (const billing of shipment.billings || []) {
                const foundItem = billing.items?.find(item => item.id === codeToSearch.trim())

                if (foundItem) {
                    results.push({
                        item: foundItem,
                        shipment: {
                            id: shipment.id || "",
                            name: shipment.name,
                            trackingNumber: shipment.trackingNumber,
                            status: shipment.status,
                            origin: shipment.origin,
                            destination: shipment.destination,
                            creator: shipment.creator,
                            createdAt: shipment.createdAt || ""
                        },
                        billing: {
                            id: billing.id,
                            status: billing.status,
                            createdAt: billing.createdAt,
                            creator: billing.creator,
                            itemCount: billing.items?.length || 0
                        }
                    })
                }
            }
        }

        if (results.length > 0) {
            setTraceResults(results)
            setNotFound(false)
        } else {
            setTraceResults([])
            setNotFound(true)
        }
    }

    const handleScanComplete = (code: string) => {
        setSearchQR(code)
        handleSearch(code)
    }

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "completed":
                return <Badge variant="outline" className="text-green-600 border-green-600">Hoàn thành</Badge>
            case "in_progress":
                return <Badge variant="outline">Đang xử lý</Badge>
            case "cancelled":
                return <Badge variant="destructive">Đã hủy</Badge>
            default:
                return <Badge variant="secondary">Không xác định</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Truy xuất mã QR</h2>
                <p className="text-gray-600">Tra cứu thông tin sản phẩm qua mã QR</p>
            </div>

            {/* Search Card */}
            <Card className="rounded-lg shadow-sm">
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <QrCode className="w-5 h-5" />
                        Tìm kiếm sản phẩm
                    </CardTitle>
                    <CardDescription>Nhập hoặc quét mã QR để tra cứu thông tin</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Nhập mã QR sản phẩm..."
                                value={searchQR}
                                onChange={(e) => {
                                    setSearchQR(e.target.value)
                                    setNotFound(false)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch()
                                    }
                                }}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => handleSearch()}
                            >
                                <Search className="mr-2 w-4 h-4" />
                                Tìm kiếm
                            </Button>
                            <QRTracerGM65ScannerButton onScanComplete={handleScanComplete} />
                            <QRTracerScannerButton onScanComplete={handleScanComplete} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Result Card */}
            {notFound && (
                <Card className="rounded-lg border-red-200 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 justify-center items-center py-8 text-center">
                            <XCircle className="w-16 h-16 text-red-500" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Không tìm thấy</h3>
                                <p className="text-sm text-gray-600">
                                    Mã QR <span className="font-mono font-semibold">{searchQR}</span> không tồn tại trong hệ thống
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {traceResults.length > 0 && (
                <div className="space-y-6">
                    {/* Status Card */}
                    <Card className="rounded-lg border-green-200 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 justify-center items-center py-4 text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Sản phẩm đã được quét</h3>
                                    <p className="text-sm text-gray-600">
                                        Mã QR <span className="font-mono font-semibold">{traceResults[0].item.id}</span>
                                    </p>
                                    {traceResults.length > 1 && (
                                        <p className="mt-2 text-sm font-semibold text-blue-600">
                                            Tìm thấy {traceResults.length} nơi chứa vật tư này
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results - Loop through all found locations */}
                    {traceResults.map((traceResult, resultIndex) => (
                        <div key={`${traceResult.shipment.id}-${traceResult.billing.id}-${resultIndex}`} className="space-y-4">
                            {traceResults.length > 1 && (
                                <div className="flex gap-2 items-center">
                                    <Badge variant="outline" className="text-sm">
                                        Kết quả {resultIndex + 1}/{traceResults.length}
                                    </Badge>
                                </div>
                            )}

                            {/* Detail Cards Grid */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Item Info */}
                                <Card className="rounded-lg shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center text-lg">
                                            <Package className="w-5 h-5" />
                                            Thông tin sản phẩm
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Mã QR:</span>
                                            <span className="font-mono text-sm font-medium text-right">{traceResult.item.id}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Người quét:</span>
                                            <div className="flex gap-2 items-center">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium">{traceResult.item.creator}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Thời gian quét:</span>
                                            <div className="flex gap-2 items-center">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium">
                                                    {moment(traceResult.item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Billing Info */}
                                <Card className="rounded-lg shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center text-lg">
                                            <Package className="w-5 h-5 text-purple-600" />
                                            Thông tin Billing
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Số billing:</span>
                                            <span className="font-mono text-sm font-medium text-right">{traceResult.billing.id}</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Trạng thái:</span>
                                            <div>
                                                {traceResult.billing.status === "scanning" ? (
                                                    <Badge variant="outline">Đang quét</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 border-green-600">Hoàn thành</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Tổng vật tư:</span>
                                            <span className="text-sm font-medium">{traceResult.billing.itemCount} sản phẩm</span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Người tạo:</span>
                                            <span className="text-sm font-medium">{traceResult.billing.creator}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Shipment Info */}
                                <Card className="rounded-lg shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center text-lg">
                                            <Package className="w-5 h-5" />
                                            Thông tin Shipment
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Mã Shipment:</span>
                                            <span className="font-mono text-sm font-medium text-right">{traceResult.shipment.id}</span>
                                        </div>
                                        {traceResult.shipment.name && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-600">Tên:</span>
                                                <span className="text-sm font-medium text-right">{traceResult.shipment.name}</span>
                                            </div>
                                        )}
                                        {traceResult.shipment.trackingNumber && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-600">Mã vận đơn:</span>
                                                <span className="font-mono text-sm font-medium text-right">{traceResult.shipment.trackingNumber}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Trạng thái:</span>
                                            <div>{getStatusBadge(traceResult.shipment.status)}</div>
                                        </div>
                                        {traceResult.shipment.creator && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-600">Người tạo lô:</span>
                                                <div className="flex gap-2 items-center">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium">{traceResult.shipment.creator}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-gray-600">Ngày tạo lô:</span>
                                            <div className="flex gap-2 items-center">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium">
                                                    {moment(traceResult.shipment.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Location Info (if available) */}
                            {(traceResult.shipment.origin || traceResult.shipment.destination) && (
                                <Card className="rounded-lg shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center text-lg">
                                            <MapPin className="w-5 h-5" />
                                            Thông tin vận chuyển
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {traceResult.shipment.origin && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-600">Điểm đi:</span>
                                                <span className="text-sm font-medium text-right">{traceResult.shipment.origin}</span>
                                            </div>
                                        )}
                                        {traceResult.shipment.destination && (
                                            <div className="flex justify-between items-start">
                                                <span className="text-sm text-gray-600">Điểm đến:</span>
                                                <span className="text-sm font-medium text-right">{traceResult.shipment.destination}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Timeline Card */}
                            <Card className="rounded-lg shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex gap-2 items-center text-lg">
                                        <Calendar className="w-5 h-5" />
                                        Dòng thời gian
                                    </CardTitle>
                                    <CardDescription>Lịch sử hoạt động của sản phẩm</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex justify-center items-center w-8 h-8 bg-green-100 rounded-full">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div className="flex-1 my-2 w-px bg-gray-300" style={{ minHeight: '20px' }}></div>
                                            </div>
                                            <div className="pb-4">
                                                <p className="font-medium text-gray-900">Sản phẩm được quét</p>
                                                <p className="text-sm text-gray-600">
                                                    {moment(traceResult.item.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                                                </p>
                                                <p className="text-sm text-gray-500">Bởi {traceResult.item.creator}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex justify-center items-center w-8 h-8 bg-gray-900 rounded-full">
                                                    <Package className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1 my-2 w-px bg-gray-300" style={{ minHeight: '20px' }}></div>
                                            </div>
                                            <div className="pb-4">
                                                <p className="font-medium text-gray-900">Thêm vào billing</p>
                                                <p className="text-sm text-gray-600">
                                                    {moment(traceResult.billing.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                                                </p>
                                                <p className="text-sm text-gray-500">Billing: {traceResult.billing.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex justify-center items-center w-8 h-8 bg-gray-900 rounded-full">
                                                    <Package className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Tạo Shipment</p>
                                                <p className="text-sm text-gray-600">
                                                    {moment(traceResult.shipment.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                                                </p>
                                                <p className="text-sm text-gray-500">Shipment: {traceResult.shipment.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

