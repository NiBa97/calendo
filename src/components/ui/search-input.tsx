import { InputGroup, InputGroupProps } from "@chakra-ui/react"
import { FaSearch } from "react-icons/fa"
import { BrandInput } from "./brand-input"

interface SearchInputProps extends Omit<InputGroupProps, 'children' | 'onChange'> {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  brandVariant?: 'default' | 'dark'
}

export function SearchInput({ 
  placeholder = "Search...", 
  value, 
  onChange,
  brandVariant = 'default',
  ...props 
}: SearchInputProps) {
  return (
    <InputGroup startElement={<FaSearch />} {...props}>
      <BrandInput
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        brandVariant={brandVariant}
      />
    </InputGroup>
  )
}