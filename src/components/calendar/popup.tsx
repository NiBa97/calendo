import { Popover } from "@chakra-ui/react";
import { type ReactNode } from "react";

interface CalendarPopupProps {
  onClose: () => void;
  position: { top: number; left: number };
  children: ReactNode;
}

export default function CalendarPopup({ onClose, position, children }: CalendarPopupProps) {
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
