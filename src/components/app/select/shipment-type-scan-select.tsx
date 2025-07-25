import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"

export default function ShipmentTypeScanSelect({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Chọn phương thức nhập" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Phương thức nhập</SelectLabel>
          <SelectItem value="scan">Quét bar code</SelectItem>
          <SelectItem value="manual">Nhập tay</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
