import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PlaceParts = {
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

interface Props {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  onPlaceSelected?: (parts: PlaceParts) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
}

export function AddressAutocomplete({
  label = "Street Address",
  value,
  onChange,
  placeholder = "Enter street address",
  id = "address-autocomplete",
  required,
}: Props) {
  return (
    <div className="relative">
      {label && <Label htmlFor={id} className="mb-1 block">{label}</Label>}
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete="street-address"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default AddressAutocomplete;
