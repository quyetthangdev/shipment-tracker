import * as XLSX from "xlsx";
import { IAuditLog } from "@/types";
import moment from "moment";

export const exportAuditLogsToExcel = (logs: IAuditLog[]) => {
  // Chuẩn bị data cho Excel
  const data = logs.map((log, index) => ({
    STT: index + 1,
    "Thời gian": moment(log.timestamp).format("DD/MM/YYYY HH:mm:ss"),
    "Người dùng": log.user,
    "Hành động": log.actionLabel,
    "Đối tượng": log.target || "—",
    "IP Address": log.ipAddress || "—",
    "Chi tiết": log.details || "—",
  }));

  // Tạo worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 5 }, // STT
    { wch: 20 }, // Thời gian
    { wch: 15 }, // Người dùng
    { wch: 20 }, // Hành động
    { wch: 25 }, // Đối tượng
    { wch: 15 }, // IP Address
    { wch: 40 }, // Chi tiết
  ];
  worksheet["!cols"] = columnWidths;

  // Tạo workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

  // Xuất file
  const fileName = `audit-logs-${moment().format("YYYYMMDD-HHmmss")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
