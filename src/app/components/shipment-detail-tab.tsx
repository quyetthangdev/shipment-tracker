import moment from "moment"
import { AlertTriangle } from "lucide-react"
import autoTable from "jspdf-autotable"
import { useRef } from "react"
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

    // const handleExportPDF = async (shipment: IShipment) => {
    //     try {
    //         let allHtmlContent = '';

    //         for (const item of shipment.items) {
    //             const html = await generateShipmentHTML({
    //                 logoString: Be_Vietnam_Pro_base64,
    //                 slug: shipment.slug,
    //                 id: item.id,
    //                 creator: item.creator,
    //                 createdAt: item.createdAt,
    //                 items: shipment.items,
    //             });

    //             allHtmlContent += html;
    //         }

    //         // Gán nội dung vào ref, sau đó render rồi mới export
    //         if (printRef.current) {
    //             printRef.current.innerHTML = allHtmlContent;

    //             const pdf = await ReactToPdf(() => printRef.current!, {
    //                 filename: `shipment-${shipment.slug || shipment.id || 'export'}.pdf`,
    //             });

    //             await pdf.save();
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("Lỗi khi tạo nội dung PDF");
    //     }
    // };


    // const handleExportPDF = (shipment: IShipment) => {
    //     console.log("Exporting shipment details as CSV", shipment);
    //     // Logic to export shipment details as CSV
    // }

    // Hàm định dạng giá trị thành ô CSV, escape dấu " và bao trong dấu "

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
            [`Trạng thái:`, shipment.status],
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
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="w-12 h-12 mb-4 text-red-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Không tìm thấy lô hàng</h3>
                    <p className="text-center text-gray-600">
                        Lô hàng đã chọn không thể tìm thấy hoặc bạn không có quyền truy cập.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin chi tiết lô hàng</h2>
                </div>
            </div>
            {shipments.length !== 0 && shipments.map((createdShipment) => {
                return (<div>
                    <div>
                        {/* Shipment Info Cards */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
                                    <Badge
                                        variant={createdShipment.status === ShipmentStatus.COMPLETED ? "default" : "secondary"}
                                        className={createdShipment.status === ShipmentStatus.COMPLETED ? "bg-green-600" : "bg-yellow-500 text-white"}
                                    >
                                        {createdShipment.status === ShipmentStatus.COMPLETED ? "Hoàn thành" : "Đang xử lý"}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{createdShipment.id}</div>
                                    <p className="text-xs text-muted-foreground">Thời gian tạo: {moment(createdShipment.createdAt).format("HH:mm:ss DD/MM/YYYY")}</p>
                                    <p className="text-xs text-muted-foreground">Người tạo: {createdShipment.creator}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* QR Scans Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>QR Scan History</CardTitle>
                                <CardDescription>All QR codes scanned for this shipment, including duplicates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>QR Code</TableHead>
                                                <TableHead>Scan Time</TableHead>
                                                <TableHead>Scanned By</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {createdShipment && createdShipment?.items && createdShipment.items.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                                                        No QR codes scanned yet
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                createdShipment?.items && createdShipment.items.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-mono text-sm">{item.id}</TableCell>
                                                        <TableCell>{moment(item.createdAt).format("HH:mm:ss DD/MM/YYYY")}</TableCell>
                                                        <TableCell className="text-sm">{item.creator}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">

                                    <Button onClick={() => handleExportPDF(createdShipment)}>
                                        <span className="text-sm">Export PDF</span>
                                    </Button>
                                    <div ref={printRef} style={{ display: 'none' }} />
                                    <Button variant="outline" className="ml-2" onClick={() => handleExportExcel(createdShipment)} >
                                        <span className="text-sm">Export Excel</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                )
            })}
        </div>
    )
}
