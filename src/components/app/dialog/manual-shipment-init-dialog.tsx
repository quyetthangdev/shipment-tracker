'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

export default function ManualShipmentInitDialog() {
    const [open, setOpen] = useState(false)
    const [shipmentCode, setShipmentCode] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const trimmedCode = shipmentCode.trim()
        if (!trimmedCode) {
            toast.error('Vui lòng nhập mã shipment.')
            return
        }

        // TODO: xử lý tiếp với mã shipment đã nhập
        toast.success(`Đã nhập mã shipment: ${trimmedCode}`)
        setOpen(false)
        setShipmentCode('')
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Nhập mã shipment thủ công</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Nhập mã shipment</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="shipmentCode">Mã shipment</Label>
                        <Input
                            id="shipmentCode"
                            value={shipmentCode}
                            onChange={(e) => setShipmentCode(e.target.value)}
                            placeholder="SHIP-123"
                            autoFocus
                            autoComplete="off"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Xác nhận</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
