import { Box } from "@chakra-ui/react";
import { useEffect, useRef, type ReactNode } from "react";

interface CalendarPopupProps {
  onClose: () => void;
  position: { top: number; left: number };
  children: ReactNode;
}

export default function CalendarPopup({ onClose, position, children }: CalendarPopupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        // Ignore clicks if they are in a portal/dialog
        const target = event.target as HTMLElement;
        // Check if the click is inside a portal or dialog
        if (target.closest('[role="dialog"]') || target.closest("[data-chakra-portal]")) {
          return;
        }

        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <Box ref={ref} position="absolute" top={position.top} left={position.left} zIndex={999}>
      {children}
    </Box>
  );
}
