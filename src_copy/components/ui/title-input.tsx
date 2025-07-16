import React from "react";
import { Input, InputProps } from "@chakra-ui/react";

interface TitleInputProps extends Omit<InputProps, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const TitleInput: React.FC<TitleInputProps> = ({
  value,
  onChange,
  placeholder = "Add title",
  autoFocus = false,
  ...props
}) => {
  return (
    <Input
      placeholder={placeholder}
      bg="brand.1"
      border="none"
      type="text"
      size="lg"
      fontWeight="600"
      fontSize="2xl"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      _focus={{ border: "none", outline: "none", boxShadow: "none" }}
      borderRadius="none"
      autoFocus={autoFocus}
      {...props}
    />
  );
};

export default TitleInput;
