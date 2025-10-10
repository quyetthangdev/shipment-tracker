import moment from "moment"
import { AlertTriangle, Search, Receipt } from "lucide-react"
import autoTable from "jspdf-autotable"
import { useRef, useState } from "react"
import jsPDF from 'jspdf'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui"
import { useShipmentStore } from "@/stores"
import { IShipment, ShipmentStatus, BillingStatus } from "@/types"
import toast from "react-hot-toast"
import { Be_Vietnam_Pro_base64 } from "@/assets/font/base64"


export default function ShipmentDetailTab() {
    const { shipments } = useShipmentStore()
    const printRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("")
    const [billingSearchQuery, setBillingSearchQuery] = useState("")

    const getStatusText = (status?: string) => {
        if (!status) return "Không xác định";
        switch (status) {
            case ShipmentStatus.IN_PROGRESS:
                return "Đang quét"
            case ShipmentStatus.COMPLETED:
                return "Đã tạo Shipment"
            default:
                return "Không xác định"
        }
    }


    const handleExportPDF = (shipment: IShipment) => {
        const doc = new jsPDF()

        // Thêm font tiếng Việt
        doc.addFileToVFS("BeVietnamPro.ttf", Be_Vietnam_Pro_base64)
        doc.addFont("BeVietnamPro.ttf", "BeVietnamPro", "normal")
        doc.setFont("BeVietnamPro")
        doc.setFontSize(14)

        // Tiêu đề chính
        doc.text("PHIẾU ĐÓNG GÓI VẬN CHUYỂN", 105, 15, { align: "center" })

        // Thông tin Shipment
        doc.setFontSize(11)
        const createdDate = new Date(shipment.createdAt).toLocaleString("vi-VN")
        const totalItems = shipment.billings?.reduce((sum, b) => sum + (b.items?.length || 0), 0) || 0
        const info = [
            [`Mã Shipment:`, shipment.id],
            [`Tên Shipment:`, shipment.name],
            [`Người tạo:`, shipment.creator],
            [`Ngày tạo:`, createdDate],
            [`Trạng thái:`, getStatusText(shipment.status)],
            [`Mã theo dõi:`, shipment.trackingNumber],
            [`Số billings:`, `${shipment.billings?.length || 0}`],
            [`Tổng sản phẩm:`, `${totalItems}`],
        ]

        let y = 25
        info.forEach(([label, value]) => {
            doc.text(`${label}`, 15, y)
            doc.text(`${value}`, 60, y)
            y += 6
        })

        // Cách ra phần bảng
        y += 4
        doc.setFont("BeVietnamPro")
        doc.setFontSize(10)

        // Duyệt qua từng billing
        shipment.billings?.forEach((billing, billingIndex) => {
            // Tiêu đề billing
            if (y > 250) {
                doc.addPage()
                y = 20
            }

            doc.setFontSize(11)
            doc.setFont("BeVietnamPro", "bold")
            doc.text(`Billing ${billingIndex + 1}: ${billing.id}`, 15, y)
            y += 6
            doc.setFontSize(9)
            doc.setFont("BeVietnamPro", "normal")
            doc.text(`Trạng thái: ${billing.status === BillingStatus.SCANNING ? 'Đang quét' : 'Hoàn thành'} | Số sản phẩm: ${billing.items?.length || 0}`, 15, y)
            y += 4

            // Bảng danh sách hàng của billing này
            autoTable(doc, {
                startY: y,
                styles: {
                    font: "BeVietnamPro",
                    fontStyle: "normal",
                    fontSize: 9,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [147, 51, 234],
                    textColor: 255,
                    halign: "left",
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: "center" },
                    1: { cellWidth: 60, halign: "left" },
                    2: { cellWidth: 40, halign: "left" },
                    3: { cellWidth: 50, halign: "left" },
                },
                head: [["STT", "Mã sản phẩm", "Người tạo", "Ngày tạo"]],
                body: billing.items?.map((item, index) => [
                    index + 1,
                    item.id,
                    item.creator,
                    new Date(item.createdAt).toLocaleString("vi-VN"),
                ]) || [],
                didDrawCell: (data) => {
                    data.doc.setFont("BeVietnamPro", "normal")
                },
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            y = (doc as any).lastAutoTable.finalY + 10
        })

        // Tải về file
        doc.save(`phieu-dong-goi-${shipment.id}.pdf`)
    }

    // Filter shipments dựa trên search query
    const filteredShipments = shipments.filter(shipment => {
        // Tìm theo mã shipment
        const matchesShipment = shipment.id?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true

        // Tìm theo mã billing (nếu có billing nào match)
        const matchesBilling = (!billingSearchQuery) ||
            (shipment.billings?.some(b => b.id.toLowerCase().includes(billingSearchQuery.toLowerCase())) ?? false)

        return matchesShipment && matchesBilling
    })

    const handleExportExcel = async (shipment: IShipment) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Phiếu đóng hàng');

            const exportTime = moment().format("DD/MM/YYYY HH:mm:ss");
            const totalItems = shipment.billings?.reduce((sum, b) => sum + (b.items?.length || 0), 0) || 0;

            // === Set column widths first
            worksheet.columns = [
                { width: 6 },  // STT
                { width: 40 }, // Mã QR sản phẩm
                { width: 25 }, // Thời gian quét
                { width: 20 }, // Người quét
                { width: 20 }, // Billing
            ];

            // === Title section
            const titleRow = worksheet.addRow(['PHIẾU QUÉT MÃ ĐÓNG HÀNG']);
            worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
            titleRow.getCell(1).font = { bold: true, size: 16 };
            titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            titleRow.height = 25;

            // === Info rows
            const infoRow1 = worksheet.addRow([`Mã phiếu: ${shipment.id}`]);
            worksheet.mergeCells(`A${infoRow1.number}:E${infoRow1.number}`);
            infoRow1.getCell(1).font = { bold: true };

            const infoRow2 = worksheet.addRow([`Người tạo: ${shipment.creator || 'Chưa rõ'}`]);
            worksheet.mergeCells(`A${infoRow2.number}:E${infoRow2.number}`);
            infoRow2.getCell(1).font = { bold: true };

            const infoRow3 = worksheet.addRow([`Ngày xuất: ${exportTime}`]);
            worksheet.mergeCells(`A${infoRow3.number}:E${infoRow3.number}`);
            infoRow3.getCell(1).font = { bold: true };

            const infoRow4 = worksheet.addRow([`Tổng số billings: ${shipment.billings?.length || 0}`]);
            worksheet.mergeCells(`A${infoRow4.number}:E${infoRow4.number}`);
            infoRow4.getCell(1).font = { bold: true };

            // === Empty row
            worksheet.addRow([]);

            // === Duyệt qua từng billing
            let sttCounter = 0;
            shipment.billings?.forEach((billing, billingIndex) => {
                // Billing header
                const billingHeaderRow = worksheet.addRow([`BILLING ${billingIndex + 1}: ${billing.id} (${billing.items?.length || 0} sản phẩm)`]);
                worksheet.mergeCells(`A${billingHeaderRow.number}:E${billingHeaderRow.number}`);
                billingHeaderRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF9333EA' } };
                billingHeaderRow.getCell(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF3E8FF' },
                };
                billingHeaderRow.height = 20;

                // Header row cho billing
                const headerRow = worksheet.addRow(['STT', 'Mã QR sản phẩm', 'Thời gian quét', 'Người quét', 'Billing']);
                headerRow.eachCell((cell) => {
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF9333EA' },
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                });

                // Data rows cho billing này
                billing.items?.forEach((item) => {
                    sttCounter++;
                    const row = worksheet.addRow([
                        sttCounter,
                        item.id,
                        moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss"),
                        item.creator ?? 'Chưa rõ',
                        billing.id,
                    ]);

                    row.eachCell((cell) => {
                        cell.alignment = { vertical: 'middle', horizontal: 'left' };
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        };
                    });
                });

                // Empty row sau mỗi billing
                worksheet.addRow([]);
            });

            // === Summary
            const summaryRow = worksheet.addRow([`TỔNG SỐ SẢN PHẨM: ${totalItems}`]);
            worksheet.mergeCells(`A${summaryRow.number}:E${summaryRow.number}`);
            summaryRow.getCell(1).font = { bold: true, size: 12 };
            summaryRow.getCell(1).alignment = { horizontal: 'center' };

            // === Signature rows
            worksheet.addRow([]);
            const signedRow1 = worksheet.addRow(['Người xuất file:', '....................................................']);
            worksheet.mergeCells(`B${signedRow1.number}:E${signedRow1.number}`);

            const signedRow2 = worksheet.addRow(['Xác nhận kho:', '....................................................']);
            worksheet.mergeCells(`B${signedRow2.number}:E${signedRow2.number}`);

            // === Export file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, `Phieu-dong-hang-${shipment.id}-${moment().format('DDMMYYYY_HHmmss')}.xlsx`);
            toast.success("Xuất Excel thành công");
        } catch (err) {
            console.error('Lỗi xuất Excel:', err);
            toast.error("Đã xảy ra lỗi khi xuất Excel");
        }
    };

    if (!shipments || shipments.length === 0) {
        return (
            <Card className="rounded-lg shadow-sm">
                <CardContent className="flex flex-col justify-center items-center py-12">
                    <AlertTriangle className="mb-4 w-12 h-12 text-red-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Không tìm thấy Shipment nào!</h3>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="px-3 space-y-6 max-w-7xl">
            <div className="space-y-4">
                <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Thông tin chi tiết Shipment</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            {(searchQuery || billingSearchQuery) ? `Tìm thấy ${filteredShipments.length} / ${shipments.length} Shipment` : `Tổng cộng ${shipments.length} Shipment`}
                        </p>
                    </div>
                </div>

                {/* Search Filters */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo mã Shipment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo số Billing..."
                            value={billingSearchQuery}
                            onChange={(e) => setBillingSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>

            {filteredShipments.length === 0 ? (
                <Card className="rounded-lg shadow-sm">
                    <CardContent className="flex flex-col justify-center items-center py-12">
                        <Search className="mb-4 w-12 h-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">Không tìm thấy Shipment nào!</h3>
                        <p className="text-sm text-gray-500">Thử tìm kiếm với từ khóa khác</p>
                    </CardContent>
                </Card>
            ) : (
                filteredShipments.map((createdShipment, index) => (
                    <Card key={createdShipment.id || index} className="rounded-lg shadow-sm">
                        <CardHeader className="bg-gray-50 border-b">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1">
                                    <div className="flex gap-3 items-center">
                                        <CardTitle className="text-xl">{createdShipment.id}</CardTitle>
                                        <Badge
                                            variant="default"
                                            className={
                                                createdShipment.status === ShipmentStatus.COMPLETED
                                                    ? "bg-green-600"
                                                    : createdShipment.status === ShipmentStatus.CANCELLED
                                                        ? "bg-red-600"
                                                        : "bg-yellow-500 text-white"
                                            }
                                        >
                                            {createdShipment.status === ShipmentStatus.COMPLETED && "Đã tạo Shipment"}
                                            {createdShipment.status === ShipmentStatus.IN_PROGRESS && "Đang quét"}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-4">
                                        <span>👤 Người tạo: <strong>{createdShipment.creator}</strong></span>
                                        <span>🕒 {moment(createdShipment.createdAt).format("HH:mm:ss DD/MM/YYYY")}</span>
                                        <span>🧾 <strong>{createdShipment.billings?.length || 0}</strong> billing(s)</span>
                                        <span>📦 <strong>{createdShipment.billings?.reduce((sum, b) => sum + (b.items?.length || 0), 0) || 0}</strong> sản phẩm</span>
                                    </div>
                                </div>
                                {createdShipment.status === ShipmentStatus.COMPLETED && (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleExportPDF(createdShipment)}>
                                            Xuất PDF
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleExportExcel(createdShipment)}>
                                            Xuất Excel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="pt-4 space-y-4">
                            <CardDescription>
                                Lịch sử quét QR - Tất cả mã QR đã quét cho Shipment này, được chia theo billing
                            </CardDescription>

                            {(!createdShipment.billings || createdShipment.billings.length === 0) ? (
                                <div className="py-12 text-center">
                                    <Receipt className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                                    <p className="text-gray-500">Chưa có billing nào</p>
                                </div>
                            ) : (
                                createdShipment.billings.map((billing, billingIndex) => (
                                    <div key={billing.id} className="space-y-2">
                                        {/* Billing Header */}
                                        <div className="flex gap-3 justify-between items-center p-3 bg-gray-100 rounded-lg border text-muted-foreground border-muted-foreground/20">
                                            <div className="flex gap-3 items-center">
                                                <Receipt className="w-5 h-5" />
                                                <div>
                                                    <h4 className="font-mono text-sm font-semibold">
                                                        Billing {billingIndex + 1}: {billing.id}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {billing.items?.length || 0} sản phẩm •
                                                        {billing.status === BillingStatus.SCANNING ? ' Đang quét' : ' Hoàn thành'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={billing.status === BillingStatus.SCANNING ? 'border-yellow-500 bg-yellow-500 text-white' : 'border-green-500 bg-green-500 text-white'}>
                                                {billing.status === BillingStatus.SCANNING ? 'Đang quét' : 'Hoàn thành'}
                                            </Badge>
                                        </div>

                                        {/* Items Table */}
                                        <div className="overflow-x-auto rounded-lg border shadow-sm">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-16">STT</TableHead>
                                                        <TableHead>Mã QR</TableHead>
                                                        <TableHead>Thời gian quét</TableHead>
                                                        <TableHead>Người quét</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {!billing.items || billing.items.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                                                                Chưa có mã QR nào
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        billing.items.map((item, itemIndex) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="font-medium">{itemIndex + 1}</TableCell>
                                                                <TableCell className="font-mono text-sm">{item.id}</TableCell>
                                                                <TableCell>{moment(item.createdAt).format("HH:mm:ss DD/MM/YYYY")}</TableCell>
                                                                <TableCell className="text-sm">{item.creator}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                ))
            )}

            <div ref={printRef} style={{ display: 'none' }} />
        </div>
    )
}
