import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEmployeeStore } from "@/stores"
import toast from "react-hot-toast"
import { AlertTriangle } from "lucide-react"

interface DeleteEmployeeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    employeeId: string | null
    employeeName: string | null
}

export const DeleteEmployeeDialog = ({ open, onOpenChange, employeeId, employeeName }: DeleteEmployeeDialogProps) => {
    const { removeEmployee } = useEmployeeStore()

    const handleDelete = () => {
        if (employeeId && employeeName) {
            removeEmployee(employeeId)
            toast.success(`Đã xóa người dùng ${employeeName}`)
            onOpenChange(false)
        }
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex gap-3 items-center">
                        <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <DialogTitle className="text-red-600">Xóa Người Dùng</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-gray-900">
                            <span className="text-gray-600">Người dùng: </span>
                            <span className="font-semibold">{employeeName}</span>
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

