import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Box, Button, ButtonGroup, HStack, Text } from "@chakra-ui/react";
import { type ToolbarProps } from "react-big-calendar";
import { FaChevronLeft, FaChevronRight, FaClock } from "react-icons/fa";
import moment, { Moment } from "moment";
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu";
import { SimpleTimePicker } from "../ui/simple-time-picker";

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
}

const CustomToolbar = ({ label, onNavigate, timeRange, setTimeRange }: EnhancedToolbarProps) => {
  return (
    <Box m={4}>
      <HStack justifyContent="space-between" alignItems="center">
        {/* Main Controls */}
        <ButtonGroup isAttached size="sm">
          <Button onClick={() => onNavigate("PREV")}>
            <FaChevronLeft />
          </Button>
          <Button onClick={() => onNavigate("TODAY")}>Today</Button>
          <Button onClick={() => onNavigate("NEXT")}>
            <FaChevronRight />
          </Button>
        </ButtonGroup>

        {/* Center - Current Range */}
        <Text fontSize="lg" fontWeight="bold">
          {label}
        </Text>

        {/* Time Range - Subtle Menu */}

        <MenuRoot closeOnSelect={false}>
          <MenuTrigger>
            <Button as={Button} size="sm" variant="ghost" opacity={0.7} _hover={{ opacity: 1 }}>
              <FaClock />
              {moment(timeRange.start, "HH:mm").format("HH:mm")} - {moment(timeRange.end, "HH:mm").format("HH:mm")}
            </Button>
          </MenuTrigger>
          <MenuContent bg="brand.1" borderColor="brand.2" p={0}>
            <SimpleTimePicker timeRange={timeRange} setTimeRange={setTimeRange} />
          </MenuContent>
        </MenuRoot>
      </HStack>
    </Box>
  );
};

export default CustomToolbar;
