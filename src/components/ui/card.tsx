import { Box, BoxProps } from "@chakra-ui/react"
import { ReactNode } from "react"

interface CardProps extends BoxProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'flat'
  children: ReactNode
}

export function Card({ variant = 'default', children, ...props }: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'flat':
        return {
          bg: "brand.2",
          borderRadius: "8px",
          p: 3
        }
      case 'elevated':
        return {
          bg: "brand.3",
          borderRadius: "8px",
          boxShadow: "lg",
          p: 4
        }
      case 'bordered':
        return {
          bg: "brand.2",
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "brand.3",
          p: 3
        }
      case 'default':
      default:
        return {
          bg: "brand.3",
          borderRadius: "8px",
          boxShadow: "md",
          p: 3
        }
    }
  }

  return (
    <Box
      {...getVariantStyles()}
      {...props}
    >
      {children}
    </Box>
  )
}