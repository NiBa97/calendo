import { Dispatch, SetStateAction } from "react";
import { Box, Button, ButtonGroup, HStack, IconButton, Text } from "@chakra-ui/react";
import { View, type ToolbarProps } from "react-big-calendar";
import { FaChevronLeft, FaChevronRight, FaClock, FaCalendarAlt } from "react-icons/fa";
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
  viewOptions: Record<string, string>;
}

const CustomToolbar = ({
  label,
  onNavigate,
  onView,
  view,
  timeRange,
  setTimeRange,
  isTaskListOpen,
  toggleTasklist,
  viewOptions,
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

        {/* View Selection */}
        {Object.keys(viewOptions).length > 1 && (
          <MenuRoot>
            <MenuTrigger>
              <Button  size="sm" >
              <FaCalendarAlt />
                {viewOptions[view as string] || view}
              </Button>
            </MenuTrigger>
            <MenuContent minWidth="120px">
              {Object.keys(viewOptions).map((viewKey) => (
                <Button
                  key={viewKey}
                  variant={viewKey === view ? "solid" : "ghost"}
                  size="sm"
                  width="100%"
                  justifyContent="flex-start"
                  onClick={() => onView && onView(viewKey as View)}
                >
                  {viewOptions[viewKey]}
                </Button>
              ))}
            </MenuContent>
          </MenuRoot>
        )}

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
