import moment from "moment"
import { AlertTriangle, Search } from "lucide-react"
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
import { IShipment, ShipmentStatus } from "@/types"
import toast from "react-hot-toast"
import { Be_Vietnam_Pro_base64 } from "@/assets/font/base64"


export default function ShipmentDetailTab() {
    const { shipments } = useShipmentStore()
    const printRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("")

    const getStatusText = (status?: string) => {
        if (!status) return "Không xác định";
        switch (status) {
            case ShipmentStatus.IN_PROGRESS:
                return "Đang quét"
            case ShipmentStatus.COMPLETED:
                return "Đã tạo lô hàng"
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

        // Thông tin lô hàng
        doc.setFontSize(11)
        const createdDate = new Date(shipment.createdAt).toLocaleString("vi-VN")
        const info = [
            [`Mã lô hàng:`, shipment.id],
            [`Tên lô hàng:`, shipment.name],
            [`Người tạo:`, shipment.creator],
            [`Ngày tạo:`, createdDate],
            [`Trạng thái:`, getStatusText(shipment.status)],
            [`Mã theo dõi:`, shipment.trackingNumber],
        ]

        let y = 25
        info.forEach(([label, value]) => {
            doc.text(`${label}`, 15, y)
            doc.text(`${value}`, 60, y)
            y += 6
        })

        // Cách ra phần bảng
        y += 4
        doc.setFont("BeVietnamPro") // KHÔNG bỏ dòng này
        doc.setFontSize(10)
        console.log(doc.getFontList())

        // Bảng danh sách hàng
        autoTable(doc, {
            startY: y,
            styles: {
                font: "BeVietnamPro",
                fontStyle: "normal",
                fontSize: 10,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: 255,
                halign: "left",
            },
            columnStyles: {
                0: { cellWidth: 20, halign: "center" }, // STT
                1: { cellWidth: 60, halign: "left" }, // Mã sản phẩm
                2: { cellWidth: 40, halign: "left" }, // Người tạo
                3: { cellWidth: 50, halign: "left" }, // Ngày tạo
            },
            head: [["STT", "Mã sản phẩm", "Người tạo", "Ngày tạo"]],
            body: shipment.items.map((item, index) => [
                index + 1,
                item.id,
                item.creator,
                new Date(item.createdAt).toLocaleString("vi-VN"),
            ]),
            didDrawCell: (data) => {
                data.doc.setFont("BeVietnamPro", "normal") // ÉP FONT CHO MỖI CELL
            },
        })

        // Tải về file
        doc.save(`phieu-dong-goi-${shipment.id}.pdf`)
    }

    // Filter shipments dựa trên search query
    const filteredShipments = shipments.filter(shipment =>
        shipment.id?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleExportExcel = async (shipment: IShipment) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Phiếu đóng hàng');

            const exportTime = moment().format("DD/MM/YYYY HH:mm:ss");

            // === Set column widths first
            worksheet.columns = [
                { width: 6 },  // STT
                { width: 35 }, // Mã QR sản phẩm
                { width: 25 }, // Thời gian quét
                { width: 25 }, // Người quét
            ];

            // === Title section
            const titleRow = worksheet.addRow(['PHIẾU QUÉT MÃ ĐÓNG HÀNG']);
            worksheet.mergeCells(`A${titleRow.number}:D${titleRow.number}`);
            titleRow.getCell(1).font = { bold: true, size: 16 };
            titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            titleRow.height = 25;

            // === Info rows
            const infoRow1 = worksheet.addRow([`Mã phiếu: ${shipment.id}`]);
            worksheet.mergeCells(`A${infoRow1.number}:D${infoRow1.number}`);
            infoRow1.getCell(1).font = { bold: true };

            const infoRow2 = worksheet.addRow([`Ngày xuất: ${exportTime}`]);
            worksheet.mergeCells(`A${infoRow2.number}:D${infoRow2.number}`);
            infoRow2.getCell(1).font = { bold: true };

            // === Empty row
            worksheet.addRow([]);

            // === Header row
            const headerRow = worksheet.addRow(['STT', 'Mã QR sản phẩm', 'Thời gian quét', 'Người quét']);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' },
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });

            // === Data Rows
            shipment.items.forEach((item, index) => {
                const row = worksheet.addRow([
                    index + 1,
                    item.id,
                    moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss"),
                    item.creator ?? 'Chưa rõ',
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

            // === Empty row
            worksheet.addRow([]);

            // === Summary
            const summaryRow = worksheet.addRow([`Tổng số sản phẩm: ${shipment.items.length}`]);
            worksheet.mergeCells(`A${summaryRow.number}:D${summaryRow.number}`);
            summaryRow.getCell(1).font = { bold: true };

            // === Signature rows
            worksheet.addRow([]);
            const signedRow1 = worksheet.addRow(['Người xuất file:', '....................................................']);
            worksheet.mergeCells(`B${signedRow1.number}:D${signedRow1.number}`);

            const signedRow2 = worksheet.addRow(['Xác nhận kho:', '....................................................']);
            worksheet.mergeCells(`B${signedRow2.number}:D${signedRow2.number}`);

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
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Không tìm thấy lô hàng nào!</h3>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="px-3 space-y-6 max-w-7xl">
            <div className="flex flex-col gap-4 justify-between items-start sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin chi tiết lô hàng</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {searchQuery ? `Tìm thấy ${filteredShipments.length} / ${shipments.length} lô hàng` : `Tổng cộng ${shipments.length} lô hàng`}
                    </p>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm theo mã lô hàng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {filteredShipments.length === 0 ? (
                <Card className="rounded-lg shadow-sm">
                    <CardContent className="flex flex-col justify-center items-center py-12">
                        <Search className="mb-4 w-12 h-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-900">Không tìm thấy lô hàng nào!</h3>
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
                                            {createdShipment.status === ShipmentStatus.COMPLETED && "Đã tạo lô hàng"}
                                            {createdShipment.status === ShipmentStatus.IN_PROGRESS && "Đang quét"}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-col gap-2 mt-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:gap-4">
                                        <span>👤 Người tạo: <strong>{createdShipment.creator}</strong></span>
                                        <span>🕒 {moment(createdShipment.createdAt).format("HH:mm:ss DD/MM/YYYY")}</span>
                                        <span>📦 <strong>{createdShipment.items?.length || 0}</strong> sản phẩm</span>
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

                        <CardContent className="pt-4">
                            <CardDescription className="mb-3">
                                Lịch sử quét QR - Tất cả mã QR đã quét cho lô hàng này
                            </CardDescription>
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
                                        {createdShipment?.items && createdShipment.items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                                                    Chưa có mã QR nào được quét
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            createdShipment?.items && createdShipment.items.map((item, itemIndex) => (
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
                        </CardContent>
                    </Card>
                ))
            )}

            <div ref={printRef} style={{ display: 'none' }} />
        </div>
    )
}
