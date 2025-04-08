import React from "react";
import { Checkbox, CheckboxProps } from "./checkbox";

interface TaskCheckboxProps extends Omit<CheckboxProps, "onChange"> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const TaskCheckbox: React.FC<TaskCheckboxProps> = ({ checked = false, onChange, ...props }) => {
  return (
    <Checkbox
      checked={checked}
      onChange={() => onChange?.(checked !== undefined ? !checked : true)}
      size="lg"
      colorScheme="teal"
      borderColor="brand.4"
      _checked={{
        bg: "brand.3",
        background: "transparent",
        borderColor: "brand.4",
      }}
      _hover={{
        cursor: "pointer",
      }}
      {...props}
    />
  );
};

export default TaskCheckbox;
