import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEmployeeStore } from "@/stores"
import toast from "react-hot-toast"
import { Edit } from "lucide-react"

interface UpdateEmployeeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    employee: { id: string; name: string; phone: string; password?: string } | null
}

export const UpdateEmployeeDialog = ({ open, onOpenChange, employee }: UpdateEmployeeDialogProps) => {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const { updateEmployee } = useEmployeeStore()

    useEffect(() => {
        if (employee) {
            setName(employee.name)
            setPhone(employee.phone)
            setPassword(employee.password || "")
        }
    }, [employee])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!employee) return

        if (!name.trim()) {
            toast.error("Vui lòng nhập tên người dùng")
            return
        }

        if (!phone.trim()) {
            toast.error("Vui lòng nhập số điện thoại")
            return
        }

        // Validate phone number (basic validation)
        const phoneRegex = /^[0-9]{10,11}$/
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            toast.error("Số điện thoại không hợp lệ (10-11 số)")
            return
        }

        // Validate password if provided
        if (password.trim() && password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự")
            return
        }

        const updateData: { name: string; phone: string; password?: string } = {
            name: name.trim(),
            phone: phone.trim(),
        }

        // Only include password if it's been changed/provided
        if (password.trim()) {
            updateData.password = password.trim()
        }

        updateEmployee(employee.id, updateData)

        toast.success(`Đã cập nhật thông tin ${name}`)
        onOpenChange(false)
    }

    const handleCancel = () => {
        onOpenChange(false)
    }

    if (!employee) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex gap-3 items-center">
                        <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-full">
                            <Edit className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-blue-600">Cập Nhật Người Dùng</DialogTitle>
                            <DialogDescription className="pt-1">
                                Chỉnh sửa thông tin người dùng
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <Label htmlFor="update-name" className="text-right">
                                Tên <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="update-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="Nguyễn Văn A"
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <Label htmlFor="update-phone" className="text-right">
                                Số ĐT <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="update-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="col-span-3"
                                placeholder="0912345678"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <Label htmlFor="update-password" className="text-right">
                                Mật khẩu
                            </Label>
                            <Input
                                id="update-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="col-span-3"
                                placeholder="Để trống nếu không đổi"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Cập nhật
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

