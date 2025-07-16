import { Button, ButtonProps } from "@chakra-ui/react"
import { ReactNode } from "react"

interface IconActionButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  variant?: 'close' | 'menu' | 'action' | 'danger'
  icon: ReactNode
}

export function IconActionButton({ variant = 'action', icon, ...props }: IconActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'close':
        return {
          bg: "brand.1",
          color: "brand.4",
          borderRadius: "none",
          _hover: { bg: "brand.2" },
          _active: { bg: "brand.2" }
        }
      case 'menu':
        return {
          bg: "transparent",
          color: "brand.4",
          _hover: { bg: "brand.1" },
          _active: { bg: "brand.1" }
        }
      case 'danger':
        return {
          bg: "transparent",
          color: "red.400",
          _hover: { bg: "red.50", color: "red.600" },
          _active: { bg: "red.100" }
        }
      case 'action':
      default:
        return {
          bg: "brand.1",
          color: "brand.4",
          _hover: { bg: "brand.2" },
          _active: { bg: "brand.2" }
        }
    }
  }

  return (
    <Button
      size="sm"
      {...getVariantStyles()}
      {...props}
    >
      {icon}
    </Button>
  )
}