/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Box, Button, HStack, Menu, MenuButton, MenuList, MenuItem, ButtonGroup } from "@chakra-ui/react";
import { type ToolbarProps, type View } from "react-big-calendar";
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa6";

// Custom Toolbar Component
const CustomToolbar = ({ label, onNavigate, onView, views, view }: ToolbarProps) => {
  const [currentView, setCurrentView] = useState(view);

  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  const getMenuItemLabel = (view: string) => {
    switch (view) {
      case "day":
        return "Day";
      case "week":
        return "Week";
      case "month":
        return "Month";
      case "customDayView":
        return "Custom Day View";
      default:
        return view;
    }
  };

  const isCurrentView = (currentView: string, view: string) => (currentView === view ? "bold" : "normal");

  return (
    <Box m={4} textAlign="center">
      <HStack justifyContent="space-between">
        <ButtonGroup isAttached>
          <Button onClick={() => onNavigate("PREV")}>
            <FaChevronLeft color="brand.4" />
          </Button>
          <Button onClick={() => onNavigate("TODAY")}>Today</Button>
          <Button onClick={() => onNavigate("NEXT")}>
            <FaChevronRight color="brand.4" />
          </Button>
        </ButtonGroup>
        <Box fontWeight="bold" fontSize="lg">
          {label}
        </Box>
        <Menu>
          <MenuButton as={Button} rightIcon={<FaChevronDown />}>
            {getMenuItemLabel(currentView)}
          </MenuButton>
          <MenuList zIndex={999}>
            {(views as []).toString().includes("day") && (
              <MenuItem fontWeight={isCurrentView(currentView, "day")} onClick={() => onView("day")}>
                Day
              </MenuItem>
            )}
            {(views as []).toString().includes("week") && (
              <MenuItem fontWeight={isCurrentView(currentView, "week")} onClick={() => onView("week")}>
                Week
              </MenuItem>
            )}
            {(views as []).toString().includes("month") && (
              <MenuItem fontWeight={isCurrentView(currentView, "month")} onClick={() => onView("month")}>
                Month
              </MenuItem>
            )}
            {(views as []).toString().includes("customDayView") && (
              <MenuItem
                fontWeight={isCurrentView(currentView, "customDayView")}
                onClick={() => onView("customDayView" as View)}
              >
                Custom Day View
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </HStack>
    </Box>
  );
};

export default CustomToolbar;
