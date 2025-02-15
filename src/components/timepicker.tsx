import React, { Dispatch, SetStateAction, useState } from "react";
import { VStack, HStack, Button, Text, Input, IconButton, Divider, Box } from "@chakra-ui/react";
import { FaMinus, FaPlus } from "react-icons/fa";
import moment, { Moment } from "moment";
import { time } from "console";

interface TimeInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, label }) => {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    const num = parseInt(newValue);
    if (!isNaN(num) && num >= 0 && num <= 23) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    setInputValue(value.toString());
  };

  const increment = () => {
    const newValue = (value + 1) % 24;
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = (value - 1 + 24) % 24;
    setInputValue(newValue.toString());
    onChange(newValue);
  };

  return (
    <HStack spacing={4} width="full" position="relative" zIndex={1}>
      <Text fontSize="sm" minWidth="80px">
        {label}:
      </Text>
      <HStack spacing={2} flex={1}>
        <Box position="relative" zIndex={2}>
          <IconButton
            aria-label="Decrease hour"
            icon={<FaMinus />}
            size="md"
            variant="ghost"
            onClick={decrement}
            height="40px"
            width="40px"
            _hover={{ bg: "gray.100" }}
            position="relative"
            zIndex={2}
          />
        </Box>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          size="md"
          width="60px"
          textAlign="center"
          padding={2}
          position="relative"
          zIndex={1}
        />
        <Box position="relative" zIndex={2}>
          <IconButton
            aria-label="Increase hour"
            icon={<FaPlus />}
            size="md"
            variant="ghost"
            onClick={increment}
            height="40px"
            width="40px"
            _hover={{ bg: "gray.100" }}
            position="relative"
            zIndex={2}
          />
        </Box>
      </HStack>
    </HStack>
  );
};
interface TimePickerProps {
  setTimeRange: Dispatch<
    SetStateAction<{
      start: Moment;
      end: Moment;
    }>
  >;
  timeRange: {
    start: Moment;
    end: Moment;
  };
}

export const TimePicker: React.FC<TimePickerProps> = ({ timeRange, setTimeRange }) => {
  const presets = [
    { label: "Workday (9-17)", start: moment("09:00", "HH:mm"), end: moment("17:00", "HH:mm") },
    { label: "Extended (7-22)", start: moment("07:00", "HH:mm"), end: moment("22:00", "HH:mm") },
    { label: "Full Day", start: moment("00:00", "HH:mm"), end: moment("23:59", "HH:mm") },
  ];

  return (
    <VStack spacing={3} p={3} align="stretch" minWidth="250px">
      {/* Time Inputs */}
      <VStack spacing={2} align="stretch">
        <TimeInput
          label="Start Time"
          value={parseInt(timeRange.start.format("HH"))}
          onChange={(val) => setTimeRange({ start: timeRange.start.set("hour", val), end: timeRange.end })}
        />
        <TimeInput
          label="End Time"
          value={parseInt(timeRange.end.format("HH"))}
          onChange={(val) => setTimeRange({ start: timeRange.start, end: timeRange.end.set("hour", val) })}
        />
      </VStack>

      <Divider />

      {/* Presets */}
      <VStack spacing={2}>
        {presets.map((preset) => (
          <Button
            key={preset.label}
            size="sm"
            width="full"
            variant="outline"
            onClick={() => {
              setTimeRange({ start: preset.start, end: preset.end });
            }}
          >
            {preset.label}
          </Button>
        ))}
      </VStack>
    </VStack>
  );
};
