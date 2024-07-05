import { Box, Button, HStack, Menu, MenuButton, MenuList, MenuItem, ButtonGroup } from "@chakra-ui/react";
import { ToolbarProps } from "react-big-calendar";
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
        <ButtonGroup isAttached variant="outline">
          <Button onClick={() => onNavigate("PREV")}>
            <FaChevronLeft color="white" />
          </Button>
          <Button color="white" onClick={() => onNavigate("TODAY")}>
            Today
          </Button>
          <Button onClick={() => onNavigate("NEXT")}>
            <FaChevronRight color="white" />
          </Button>
        </ButtonGroup>
        <Box fontWeight="bold" fontSize="lg">
          {label}
        </Box>
        <Menu>
          <MenuButton as={Button} rightIcon={<FaChevronDown />} variant={"outline"} color={"white"}>
            {getMenuItemLabel(currentView)}
          </MenuButton>
          <MenuList zIndex={999}>
            {views.includes("day") && (
              <MenuItem color="black" fontWeight={isCurrentView(currentView, "day")} onClick={() => onView("day")}>
                Day
              </MenuItem>
            )}
            {views.includes("week") && (
              <MenuItem color="black" fontWeight={isCurrentView(currentView, "week")} onClick={() => onView("week")}>
                Week
              </MenuItem>
            )}
            {views.includes("month") && (
              <MenuItem color="black" fontWeight={isCurrentView(currentView, "month")} onClick={() => onView("month")}>
                Month
              </MenuItem>
            )}
            {views.includes("customDayView") && (
              <MenuItem
                color="black"
                fontWeight={isCurrentView(currentView, "customDayView")}
                onClick={() => onView("customDayView")}
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
