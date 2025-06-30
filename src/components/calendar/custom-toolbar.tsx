import { Dispatch, SetStateAction } from "react";
import { Box, Button, ButtonGroup, HStack, IconButton, Text } from "@chakra-ui/react";
import { View, type ToolbarProps } from "react-big-calendar";
import { FaChevronLeft, FaChevronRight, FaClock, FaCalendarAlt } from "react-icons/fa";
import moment, { Moment } from "moment";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";
import { SimpleTimePicker } from "../ui/simple-time-picker";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useIsMobile } from "../../utils/responsive";

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
  const isMobile = useIsMobile();
  return (
    <Box m={isMobile ? 2 : 4} px={isMobile ? 1 : 0}>
      <HStack justifyContent="space-between" alignItems="center" gap={isMobile ? 1 : 2} wrap={isMobile ? "wrap" : "nowrap"}>
        <IconButton aria-label="Toggle Sidebar" onClick={() => toggleTasklist()}>
          {isTaskListOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </IconButton>

        <Button onClick={() => onNavigate("TODAY")} size={isMobile ? "xs" : "md"}>Today</Button>
        {/* Main Controls */}
        <ButtonGroup size={isMobile ? "xs" : "sm"} gap={isMobile ? 2 : 5}>
          <Button onClick={() => onNavigate("PREV")}>
            <FaChevronLeft />
          </Button>
          <Text fontSize={isMobile ? "md" : "lg"} fontWeight="bold" noOfLines={1}>
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
              <Button size={isMobile ? "xs" : "sm"}>
              <FaCalendarAlt />
                {isMobile ? "" : (viewOptions[view as string] || view)}
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

        {/* Time Range - Subtle Menu - Hidden on Mobile */}
        {!isMobile && (
          <MenuRoot closeOnSelect={false}>
            <MenuTrigger display={"flex"} gap={2} alignItems={"center"}>
              <FaClock />
              {moment(timeRange.start, "HH:mm").format("HH:mm")} - {moment(timeRange.end, "HH:mm").format("HH:mm")}
            </MenuTrigger>
            <MenuContent p={0}>
              <SimpleTimePicker timeRange={timeRange} setTimeRange={setTimeRange} />
            </MenuContent>
          </MenuRoot>
        )}
      </HStack>
    </Box>
  );
};

export default CustomToolbar;
