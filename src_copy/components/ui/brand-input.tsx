import { Input, InputProps, Textarea, TextareaProps } from "@chakra-ui/react"

interface BrandInputProps extends Omit<InputProps, 'variant'> {
  brandVariant?: 'default' | 'dark'
}

interface BrandTextareaProps extends Omit<TextareaProps, 'variant'> {
  brandVariant?: 'default' | 'dark'
}

export function BrandInput({ brandVariant = 'default', ...props }: BrandInputProps) {
  const getVariantStyles = () => {
    switch (brandVariant) {
      case 'dark':
        return {
          bg: "brand.1",
          color: "brand.4",
          _hover: { borderColor: "brand.4" },
          _focus: { borderColor: "brand.4", boxShadow: "none" }
        }
      case 'default':
      default:
        return {
          bg: "brand.2",
          color: "brand.4",
          _hover: { borderColor: "brand.4" },
          _focus: { borderColor: "brand.4", boxShadow: "none" }
        }
    }
  }

  return (
    <Input
      {...getVariantStyles()}
      {...props}
    />
  )
}

export function BrandTextarea({ brandVariant = 'default', ...props }: BrandTextareaProps) {
  const getVariantStyles = () => {
    switch (brandVariant) {
      case 'dark':
        return {
          bg: "brand.1",
          color: "brand.4",
          borderColor: "brand.3",
          _hover: { borderColor: "brand.4" },
          _focus: { borderColor: "brand.4", boxShadow: "none" }
        }
      case 'default':
      default:
        return {
          bg: "brand.2",
          color: "brand.4",
          borderColor: "brand.3",
          _hover: { borderColor: "brand.4" },
          _focus: { borderColor: "brand.4", boxShadow: "none" }
        }
    }
  }

  return (
    <Textarea
      {...getVariantStyles()}
      {...props}
    />
  )
}