import { useState } from "react";

import { Button, Input } from "@/components/ui";

export default function ManualShipmentInput({ onSuccess, disabled }: { onSuccess?: (data: string) => void, disabled?: boolean }) {
    const [shipmentId, setShipmentId] = useState<string>("");
    const handleSubmit = () => {
        onSuccess?.(shipmentId)
    };
    return (
        <div className="flex items-center space-x-2">
            <Input type="text" placeholder="Mã Shipment" value={shipmentId} onChange={(e) => setShipmentId(e.target.value)} />
            <Button onClick={handleSubmit} disabled={disabled || shipmentId.length === 0}>Tạo Shipment</Button>
        </div>
    );
}