import { Box } from "@chakra-ui/react";
import { type Task } from "@prisma/client";
import React from "react";
import { useEffect, useRef, ReactNode } from "react";

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
    <Box
      ref={ref}
      position="absolute"
      top={position.top}
      left={position.left}
      bg="white"
      boxShadow="md"
      zIndex={1}
      border="1px solid gray"
      borderRadius="md"
    >
      {children}
    </Box>
  );
}
