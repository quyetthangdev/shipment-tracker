import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEmployeeStore } from "@/stores"
import toast from "react-hot-toast"

interface AddEmployeeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const AddEmployeeDialog = ({ open, onOpenChange }: AddEmployeeDialogProps) => {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const { addEmployee } = useEmployeeStore()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

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

        if (!password.trim()) {
            toast.error("Vui lòng nhập mật khẩu")
            return
        }

        if (password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự")
            return
        }

        const newEmployee = {
            id: `emp-${Date.now()}`,
            name: name.trim(),
            phone: phone.trim(),
            password: password.trim(),
            createdAt: new Date().toISOString(),
        }

        addEmployee(newEmployee)
        toast.success(`Đã thêm người dùng ${name}`)

        // Reset form
        setName("")
        setPhone("")
        setPassword("")
        onOpenChange(false)
    }

    const handleCancel = () => {
        setName("")
        setPhone("")
        setPassword("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm Người Dùng Mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin người dùng mới. Nhấn lưu để thêm vào hệ thống.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <Label htmlFor="name" className="text-right">
                                Tên <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="Nguyễn Văn A"
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <Label htmlFor="phone" className="text-right">
                                Số ĐT <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="col-span-3"
                                placeholder="0912345678"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4 items-center">
                            <Label htmlFor="password" className="text-right">
                                Mật khẩu <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="col-span-3"
                                placeholder="Tối thiểu 6 ký tự"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Lưu
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

