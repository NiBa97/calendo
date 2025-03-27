import React from "react";
import { Box, Input, Flex } from "@chakra-ui/react";

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ value, onChange }) => {
  return (
    <Flex align="center">
      <Box width="24px" height="24px" borderRadius="md" bg={value} border="1px solid" borderColor="gray.300" mr={2} />
      <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} width="auto" p={1} height="32px" />
    </Flex>
  );
};
