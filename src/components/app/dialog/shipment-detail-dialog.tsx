import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge, Button } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IShipment, ShipmentStatus } from "@/types"
import { Package, Calendar, ListChecks, Download, FileText } from "lucide-react"
import moment from "moment"
import jsPDF from 'jspdf'
import autoTable from "jspdf-autotable"
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import toast from "react-hot-toast"
import { Be_Vietnam_Pro_base64 } from "@/assets/font/base64"

interface ShipmentDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    shipment: IShipment | null
}

const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
        case ShipmentStatus.IN_PROGRESS:
            return <Badge className="bg-yellow-600">Đang quét</Badge>
        case ShipmentStatus.COMPLETED:
            return <Badge className="bg-green-600">Đã tạo lô hàng</Badge>
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
}

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

export const ShipmentDetailDialog = ({ open, onOpenChange, shipment }: ShipmentDetailDialogProps) => {
    if (!shipment) return null

    const isCompleted = shipment.status === ShipmentStatus.COMPLETED

    const handleExportPDF = () => {
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
        doc.setFont("BeVietnamPro")
        doc.setFontSize(10)

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
                0: { cellWidth: 20, halign: "center" },
                1: { cellWidth: 60, halign: "left" },
                2: { cellWidth: 40, halign: "left" },
                3: { cellWidth: 50, halign: "left" },
            },
            head: [["STT", "Mã sản phẩm", "Người tạo", "Ngày tạo"]],
            body: shipment.items.map((item, index) => [
                index + 1,
                item.id,
                item.creator,
                new Date(item.createdAt).toLocaleString("vi-VN"),
            ]),
            didDrawCell: (data) => {
                data.doc.setFont("BeVietnamPro", "normal")
            },
        })

        doc.save(`phieu-dong-goi-${shipment.id}.pdf`)
        toast.success("Xuất PDF thành công")
    }

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('Phiếu đóng hàng')

            const exportTime = moment().format("DD/MM/YYYY HH:mm:ss")

            // Set column widths
            worksheet.columns = [
                { width: 6 },
                { width: 35 },
                { width: 25 },
                { width: 25 },
            ]

            // Title section
            const titleRow = worksheet.addRow(['PHIẾU QUÉT MÃ ĐÓNG HÀNG'])
            worksheet.mergeCells(`A${titleRow.number}:D${titleRow.number}`)
            titleRow.getCell(1).font = { bold: true, size: 16 }
            titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
            titleRow.height = 25

            // Info rows
            const infoRow1 = worksheet.addRow([`Mã phiếu: ${shipment.id}`])
            worksheet.mergeCells(`A${infoRow1.number}:D${infoRow1.number}`)
            infoRow1.getCell(1).font = { bold: true }

            const infoRow2 = worksheet.addRow([`Người tạo: ${shipment.creator || 'Chưa rõ'}`])
            worksheet.mergeCells(`A${infoRow2.number}:D${infoRow2.number}`)
            infoRow2.getCell(1).font = { bold: true }

            const infoRow3 = worksheet.addRow([`Ngày xuất: ${exportTime}`])
            worksheet.mergeCells(`A${infoRow3.number}:D${infoRow3.number}`)
            infoRow3.getCell(1).font = { bold: true }

            worksheet.addRow([])

            // Header row
            const headerRow = worksheet.addRow(['STT', 'Mã QR sản phẩm', 'Thời gian quét', 'Người quét'])
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' },
                }
                cell.alignment = { vertical: 'middle', horizontal: 'center' }
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                }
            })

            // Data Rows
            shipment.items.forEach((item, index) => {
                const row = worksheet.addRow([
                    index + 1,
                    item.id,
                    moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss"),
                    item.creator ?? 'Chưa rõ',
                ])

                row.eachCell((cell) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' }
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    }
                })
            })

            worksheet.addRow([])

            // Summary
            const summaryRow = worksheet.addRow([`Tổng số sản phẩm: ${shipment.items.length}`])
            worksheet.mergeCells(`A${summaryRow.number}:D${summaryRow.number}`)
            summaryRow.getCell(1).font = { bold: true }

            // Signature rows
            worksheet.addRow([])
            const signedRow1 = worksheet.addRow(['Người xuất file:', '....................................................'])
            worksheet.mergeCells(`B${signedRow1.number}:D${signedRow1.number}`)

            const signedRow2 = worksheet.addRow(['Xác nhận kho:', '....................................................'])
            worksheet.mergeCells(`B${signedRow2.number}:D${signedRow2.number}`)

            // Export file
            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
            saveAs(blob, `Phieu-dong-hang-${shipment.id}-${moment().format('DDMMYYYY_HHmmss')}.xlsx`)
            toast.success("Xuất Excel thành công")
        } catch (err) {
            console.error('Lỗi xuất Excel:', err)
            toast.error("Đã xảy ra lỗi khi xuất Excel")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center">
                        <div>
                            <DialogTitle className="flex gap-2 items-center text-xl">
                                <Package className="w-5 h-5 text-blue-600" />
                                Chi Tiết Lô Hàng
                            </DialogTitle>
                            <DialogDescription>Thông tin chi tiết về lô hàng {shipment.id}</DialogDescription>
                        </div>
                        {isCompleted && (
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700">
                                    <FileText className="mr-1 w-4 h-4" />
                                    PDF
                                </Button>
                                <Button size="sm" onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700">
                                    <Download className="mr-1 w-4 h-4" />
                                    Excel
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="pt-4 space-y-6">
                    {/* General Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Mã lô hàng</p>
                            <p className="font-semibold">{shipment.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Trạng thái</p>
                            <div>{getStatusBadge(shipment.status || ShipmentStatus.IN_PROGRESS)}</div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Người tạo</p>
                            <p className="font-medium">{shipment.creator || "—"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                                <Calendar className="inline mr-1 w-4 h-4" />
                                Ngày tạo
                            </p>
                            <p className="font-medium">
                                {shipment.createdAt
                                    ? moment(shipment.createdAt).format("DD/MM/YYYY HH:mm:ss")
                                    : "—"}
                            </p>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <p className="text-sm text-gray-500">
                                <ListChecks className="inline mr-1 w-4 h-4" />
                                Số lượng sản phẩm
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                                {shipment.items?.length || 0} sản phẩm
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    {shipment.items && shipment.items.length > 0 ? (
                        <div className="rounded-lg border">
                            <div className="p-4 bg-gray-50 border-b">
                                <h3 className="font-semibold text-gray-900">Danh sách sản phẩm</h3>
                                <p className="text-sm text-gray-600">
                                    Tổng cộng {shipment.items.length} sản phẩm trong lô hàng
                                </p>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">STT</TableHead>
                                            <TableHead>Mã sản phẩm</TableHead>
                                            <TableHead className="hidden md:table-cell">Ngày thêm</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shipment.items.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-mono text-sm">{item.id}</TableCell>
                                                <TableCell className="hidden text-sm text-gray-600 md:table-cell">
                                                    {item.createdAt
                                                        ? moment(item.createdAt).format("DD/MM/YYYY HH:mm")
                                                        : "—"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-gray-50 rounded-lg border">
                            <Package className="mx-auto w-12 h-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Lô hàng chưa có sản phẩm nào</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

