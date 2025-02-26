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
    function handleClickOutside(event: Event) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
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
