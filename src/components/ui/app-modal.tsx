import { Dialog } from "@chakra-ui/react"
import { ReactNode, RefObject } from "react"

interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  contentRef?: RefObject<HTMLDivElement>
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function AppModal({ 
  isOpen, 
  onClose, 
  children, 
  contentRef,
  size = 'lg'
}: AppModalProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { height: "60vh", width: "60vw", maxH: "60vh", maxW: "60vw" }
      case 'md':
        return { height: "75vh", width: "75vw", maxH: "75vh", maxW: "75vw" }
      case 'xl':
        return { height: "95vh", width: "95vw", maxH: "95vh", maxW: "95vw" }
      case 'full':
        return { height: "100vh", width: "100vw", maxH: "100vh", maxW: "100vw" }
      case 'lg':
      default:
        return { height: "90vh", width: "90vw", maxH: "90vh", maxW: "90vw" }
    }
  }

  const sizeStyles = getSizeStyles()

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => {
        if (!e.open) onClose()
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          bg="transparent"
          color="brand.4"
          {...sizeStyles}
          ref={contentRef}
        >
          <Dialog.Body {...sizeStyles} p={0}>
            {children}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}