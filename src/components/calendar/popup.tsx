import { Popover, Box, IconButton, Icon } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useIsMobile } from "../../utils/responsive";

interface CalendarPopupProps {
  onClose: () => void;
  position: { top: number; left: number };
  children: ReactNode;
}

export default function CalendarPopup({ onClose, position, children }: CalendarPopupProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Box 
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        width="100vw"
        height="100vh"
        zIndex={10000}
        bg="gray.900"
        overflow="hidden"
      >
        <Box 
          position="relative" 
          height="100vh" 
          width="100vw" 
          p={4}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <Box position="absolute" top={4} right={4} zIndex={1}>
            <IconButton
              aria-label="Close"
              variant="ghost"
              size="lg"
              onClick={onClose}
              color="white"
            >
              <Icon as={FiX} />
            </IconButton>
          </Box>
          <Box flex={1} mt={12} overflow="auto" width="100%" height="100%">
            {children}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Popover.Root
      open={true}
      portalled={true}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
    >
      <Popover.Content position="absolute" top={position.top} left={position.left} zIndex={999} p={0}>
        <Popover.Body p={0}>{children}</Popover.Body>
      </Popover.Content>
    </Popover.Root>
  );
}
