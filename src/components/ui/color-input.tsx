import React from "react";
import { Input, Flex } from "@chakra-ui/react";

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ value, onChange }) => {
  return (
    <Flex align="center">
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        width="32px"
        height="32px"
        border={"none"}
        p={0}
      />
    </Flex>
  );
};
