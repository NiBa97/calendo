import React, { useState } from "react";
import { Box, Flex, IconButton, Tooltip, useDisclosure } from "@chakra-ui/react";
import { Menu, Layout, File, Clock, User, Upload, LogOut } from "lucide-react";

const SidebarButton = ({ icon: Icon, label }) => {
  return (
    <IconButton
      variant="ghost"
      size="lg"
      aria-label={label}
      color="gray.500"
      _hover={{ color: "blue.500", bg: "gray.100" }}
      w="full"
      mb={4}
    >
      <Icon />
    </IconButton>
  );
};

const App = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const { open: isOpen, onToggle } = useDisclosure();

  const handleMouseMove = (e) => {
    if (!isCollapsed) {
      const container = document.getElementById("splitContainer");
      if (container) {
        const rect = container.getBoundingClientRect();
        const position = ((e.clientX - rect.left) / rect.width) * 100;
        if (position > 20 && position < 80) {
          setSplitPosition(position);
        }
      }
    }
  };

  return (
    <Flex h="100vh">
      {/* Left Sidebar */}
      <Flex
        bg="gray.50"
        flexDir="column"
        alignItems="center"
        py={4}
        px={2}
        transition="all 0.2s"
        w={isOpen ? "200px" : "60px"}
        onMouseEnter={() => onToggle()}
        onMouseLeave={() => onToggle()}
      >
        <Box mb={8}>
          <IconButton variant="ghost" size="lg" aria-label="Menu" color="gray.500">
            <Menu />
          </IconButton>
        </Box>
        <SidebarButton icon={Layout} label="Tasks" />
        <SidebarButton icon={File} label="Notes" />
        <SidebarButton icon={Clock} label="Pomodoro" />
        <Box flex={1} />
        <SidebarButton icon={User} label="User" />
        <SidebarButton icon={Upload} label="Loader" />
        <SidebarButton icon={LogOut} label="Exit" />
      </Flex>

      {/* Main Content */}
      <Flex flex={1} flexDir="column">
        {/* Top Bar */}
        <Flex h="60px" bg="white" borderBottom="1px" borderColor="gray.200" p={4} alignItems="center">
          <IconButton onClick={() => setIsCollapsed(!isCollapsed)} mr={4} aria-label="Toggle sidebar">
            <Menu />{" "}
          </IconButton>
          <Flex justifyContent="space-between" flex={1}>
            <Box>DATE</Box>
            <Box>TIME SELECTOR</Box>
            <Box>VIEW SELECTOR</Box>
          </Flex>
        </Flex>

        {/* Split Pane Content */}
        <Flex flex={1} id="splitContainer" position="relative" onMouseMove={(e) => handleMouseMove(e)}>
          {/* Left Column */}
          <Box
            w={`${isCollapsed ? 0 : splitPosition}%`}
            transition={isCollapsed ? "all 0.3s" : "none"}
            overflow="hidden"
            borderRight="1px"
            borderColor="gray.200"
          />

          {/* Resizer */}
          {!isCollapsed && (
            <Box
              position="absolute"
              left={`${splitPosition}%`}
              top={0}
              bottom={0}
              w="4px"
              bg="gray.200"
              cursor="col-resize"
              _hover={{ bg: "blue.500" }}
              transform="translateX(-50%)"
            />
          )}

          {/* Right Column */}
          <Box flex={isCollapsed ? 1 : `${100 - splitPosition}%`} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default App;
