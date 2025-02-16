import { Dispatch, SetStateAction } from "react";
import { Box, Button, ButtonGroup, HStack, IconButton, Text } from "@chakra-ui/react";
import { type ToolbarProps } from "react-big-calendar";
import { FaChevronLeft, FaChevronRight, FaClock } from "react-icons/fa";
import moment, { Moment } from "moment";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";
import { SimpleTimePicker } from "../ui/simple-time-picker";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface EnhancedToolbarProps extends ToolbarProps {
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
  isTaskListOpen: boolean;
  toggleTasklist: () => void;
}

const CustomToolbar = ({
  label,
  onNavigate,
  timeRange,
  setTimeRange,
  isTaskListOpen,
  toggleTasklist,
}: EnhancedToolbarProps) => {
  return (
    <Box m={4}>
      <HStack justifyContent="space-between" alignItems="center">
        <IconButton aria-label="Toggle Sidebar" onClick={() => toggleTasklist()}>
          {isTaskListOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </IconButton>

        <Button onClick={() => onNavigate("TODAY")}>Today</Button>
        {/* Main Controls */}
        <ButtonGroup size="sm" gap={5}>
          <Button onClick={() => onNavigate("PREV")}>
            <FaChevronLeft />
          </Button>
          <Text fontSize="lg" fontWeight="bold">
            {label}
          </Text>
          <Button onClick={() => onNavigate("NEXT")}>
            <FaChevronRight />
          </Button>
        </ButtonGroup>

        {/* Center - Current Range */}

        {/* Time Range - Subtle Menu */}

        <MenuRoot closeOnSelect={false}>
          <MenuTrigger display={"flex"} gap={2} alignItems={"center"}>
            <FaClock />
            {moment(timeRange.start, "HH:mm").format("HH:mm")} - {moment(timeRange.end, "HH:mm").format("HH:mm")}
          </MenuTrigger>
          <MenuContent p={0}>
            <SimpleTimePicker timeRange={timeRange} setTimeRange={setTimeRange} />
          </MenuContent>
        </MenuRoot>
      </HStack>
    </Box>
  );
};

export default CustomToolbar;
