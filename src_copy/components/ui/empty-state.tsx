import { Flex, Text, FlexProps } from "@chakra-ui/react"
import { ReactNode } from "react"

interface EmptyStateProps extends FlexProps {
  message?: string
  icon?: ReactNode
  children?: ReactNode
}

export function EmptyState({ 
  message = "No items found",
  icon,
  children,
  ...props 
}: EmptyStateProps) {
  return (
    <Flex
      justify="center"
      align="center"
      direction="column"
      py={8}
      color="gray.500"
      gap={3}
      {...props}
    >
      {icon && <div>{icon}</div>}
      <Text fontSize="md" textAlign="center">
        {message}
      </Text>
      {children}
    </Flex>
  )
}

export function LoadingState({ message = "Loading...", ...props }: Omit<EmptyStateProps, 'icon'>) {
  return (
    <EmptyState
      message={message}
      {...props}
    />
  )
}