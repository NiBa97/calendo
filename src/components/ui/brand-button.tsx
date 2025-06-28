import { Button, ButtonProps } from "@chakra-ui/react"
import { ReactNode } from "react"

interface BrandButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  children: ReactNode
}

export function BrandButton({ variant = 'primary', children, ...props }: BrandButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: "brand.2",
          color: "brand.4",
          _hover: { bg: "brand.3" },
          _active: { bg: "brand.3" }
        }
      case 'secondary':
        return {
          bg: "brand.1",
          color: "brand.4",
          _hover: { bg: "brand.2" },
          _active: { bg: "brand.2" }
        }
      case 'ghost':
        return {
          bg: "transparent",
          color: "brand.4",
          _hover: { bg: "brand.1" },
          _active: { bg: "brand.1" }
        }
      case 'danger':
        return {
          bg: "red.500",
          color: "white",
          _hover: { bg: "red.600" },
          _active: { bg: "red.600" }
        }
      default:
        return {}
    }
  }

  return (
    <Button
      {...getVariantStyles()}
      {...props}
    >
      {children}
    </Button>
  )
}