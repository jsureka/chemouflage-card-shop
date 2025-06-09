import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageSizeSelectorProps {
  value: number;
  onValueChange: (value: number) => void;
  options?: number[];
  label?: string;
  className?: string;
  disabled?: boolean;
}

const PageSizeSelector = ({
  value,
  onValueChange,
  options = [10, 20, 50, 100],
  label = "Items per page",
  className = "",
  disabled = false,
}: PageSizeSelectorProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Label className="text-sm text-gray-300 whitespace-nowrap">
        {label}:
      </Label>
      <Select
        value={value.toString()}
        onValueChange={(stringValue) => onValueChange(parseInt(stringValue))}
        disabled={disabled}
      >
        <SelectTrigger className="w-20 h-8 bg-teal-900/20 border-teal-500/30 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PageSizeSelector;
