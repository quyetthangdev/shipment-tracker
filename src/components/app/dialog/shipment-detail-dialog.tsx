import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge, Button } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IShipment, ShipmentStatus, BillingStatus } from "@/types"
import { Package, Calendar, ListChecks, Download, FileText, Receipt } from "lucide-react"
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
            return <Badge className="bg-green-600">Đã tạo Shipment</Badge>
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
            return "Đã tạo Shipment"
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
                    fillColor: [31, 41, 55],
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

        doc.save(`phieu-dong-goi-${shipment.id}.pdf`)
        toast.success("Xuất PDF thành công")
    }

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet('Phiếu đóng hàng')

            const exportTime = moment().format("DD/MM/YYYY HH:mm:ss")
            const totalItems = shipment.billings?.reduce((sum, b) => sum + (b.items?.length || 0), 0) || 0

            // Set column widths
            worksheet.columns = [
                { width: 6 },
                { width: 40 },
                { width: 25 },
                { width: 20 },
                { width: 20 },
            ]

            // Title section
            const titleRow = worksheet.addRow(['PHIẾU QUÉT MÃ ĐÓNG HÀNG'])
            worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`)
            titleRow.getCell(1).font = { bold: true, size: 16 }
            titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }
            titleRow.height = 25

            // Info rows
            const infoRow1 = worksheet.addRow([`Mã phiếu: ${shipment.id}`])
            worksheet.mergeCells(`A${infoRow1.number}:E${infoRow1.number}`)
            infoRow1.getCell(1).font = { bold: true }

            const infoRow2 = worksheet.addRow([`Người tạo: ${shipment.creator || 'Chưa rõ'}`])
            worksheet.mergeCells(`A${infoRow2.number}:E${infoRow2.number}`)
            infoRow2.getCell(1).font = { bold: true }

            const infoRow3 = worksheet.addRow([`Ngày xuất: ${exportTime}`])
            worksheet.mergeCells(`A${infoRow3.number}:E${infoRow3.number}`)
            infoRow3.getCell(1).font = { bold: true }

            const infoRow4 = worksheet.addRow([`Tổng số billings: ${shipment.billings?.length || 0}`])
            worksheet.mergeCells(`A${infoRow4.number}:E${infoRow4.number}`)
            infoRow4.getCell(1).font = { bold: true }

            worksheet.addRow([])

            // Duyệt qua từng billing
            let sttCounter = 0
            shipment.billings?.forEach((billing, billingIndex) => {
                // Billing header
                const billingHeaderRow = worksheet.addRow([`BILLING ${billingIndex + 1}: ${billing.id} (${billing.items?.length || 0} sản phẩm)`])
                worksheet.mergeCells(`A${billingHeaderRow.number}:E${billingHeaderRow.number}`)
                billingHeaderRow.getCell(1).font = { bold: true, size: 12 }
                billingHeaderRow.getCell(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE5E7EB' },
                }
                billingHeaderRow.height = 20

                // Header row cho billing
                const headerRow = worksheet.addRow(['STT', 'Mã QR sản phẩm', 'Thời gian quét', 'Người quét', 'Billing'])
                headerRow.eachCell((cell) => {
                    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF1F2937' },
                    }
                    cell.alignment = { vertical: 'middle', horizontal: 'center' }
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    }
                })

                // Data rows cho billing này
                billing.items?.forEach((item) => {
                    sttCounter++
                    const row = worksheet.addRow([
                        sttCounter,
                        item.id,
                        moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss"),
                        item.creator ?? 'Chưa rõ',
                        billing.id,
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

                // Empty row sau mỗi billing
                worksheet.addRow([])
            })

            // Summary
            const summaryRow = worksheet.addRow([`TỔNG SỐ SẢN PHẨM: ${totalItems}`])
            worksheet.mergeCells(`A${summaryRow.number}:E${summaryRow.number}`)
            summaryRow.getCell(1).font = { bold: true, size: 12 }
            summaryRow.getCell(1).alignment = { horizontal: 'center' }

            // Signature rows
            worksheet.addRow([])
            const signedRow1 = worksheet.addRow(['Người xuất file:', '....................................................'])
            worksheet.mergeCells(`B${signedRow1.number}:E${signedRow1.number}`)

            const signedRow2 = worksheet.addRow(['Xác nhận kho:', '....................................................'])
            worksheet.mergeCells(`B${signedRow2.number}:E${signedRow2.number}`)

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
                                Chi Tiết Shipment
                            </DialogTitle>
                            <DialogDescription>Thông tin chi tiết về Shipment {shipment.id}</DialogDescription>
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
                            <p className="text-sm text-gray-500">Mã Shipment</p>
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
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                                <Receipt className="inline mr-1 w-4 h-4" />
                                Số billings
                            </p>
                            <p className="text-lg font-semibold">
                                {shipment.billings?.length || 0}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                                <ListChecks className="inline mr-1 w-4 h-4" />
                                Tổng sản phẩm
                            </p>
                            <p className="text-lg font-semibold">
                                {shipment.billings?.reduce((sum, b) => sum + (b.items?.length || 0), 0) || 0}
                            </p>
                        </div>
                    </div>

                    {/* Billings & Items */}
                    {(!shipment.billings || shipment.billings.length === 0) ? (
                        <div className="p-8 text-center bg-gray-50 rounded-lg border">
                            <Receipt className="mx-auto w-12 h-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Chưa có billing nào</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">Danh sách Billings & Sản phẩm</h3>
                            {shipment.billings.map((billing, billingIndex) => (
                                <div key={billing.id} className="space-y-2">
                                    {/* Billing Header */}
                                    <div className="flex gap-3 justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                                        <div className="flex gap-3 items-center">
                                            <Receipt className="w-5 h-5" />
                                            <div>
                                                <h4 className="font-mono text-sm font-semibold">
                                                    Billing {billingIndex + 1}: {billing.id}
                                                </h4>
                                                <p className="text-xs text-gray-600">
                                                    {billing.items?.length || 0} sản phẩm •
                                                    {billing.status === BillingStatus.SCANNING ? ' Đang quét' : ' Hoàn thành'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={billing.status === BillingStatus.SCANNING ? '' : 'bg-green-600'}>
                                            {billing.status === BillingStatus.SCANNING ? 'Đang quét' : 'Hoàn thành'}
                                        </Badge>
                                    </div>

                                    {/* Items Table */}
                                    {billing.items && billing.items.length > 0 && (
                                        <div className="rounded-lg border">
                                            <div className="max-h-[200px] overflow-y-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-16">STT</TableHead>
                                                            <TableHead>Mã sản phẩm</TableHead>
                                                            <TableHead className="hidden md:table-cell">Thời gian</TableHead>
                                                            <TableHead className="hidden lg:table-cell">Người quét</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {billing.items.map((item, itemIndex) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="font-medium">{itemIndex + 1}</TableCell>
                                                                <TableCell className="font-mono text-sm">{item.id}</TableCell>
                                                                <TableCell className="hidden text-sm text-gray-600 md:table-cell">
                                                                    {moment(item.createdAt).format("DD/MM/YYYY HH:mm")}
                                                                </TableCell>
                                                                <TableCell className="hidden text-sm lg:table-cell">
                                                                    {item.creator}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

