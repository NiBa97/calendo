import { Box, Flex, IconButton, Icon, useDisclosure, Text } from "@chakra-ui/react";
import { FiGrid, FiFileText, FiZap, FiUser, FiLoader, FiLogOut } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../pocketbaseUtils";

const SidebarItem = ({ icon: IconComponent, label, isOpen, to, isActive, onClick }) => {
  const content = (
    <IconButton
      aria-label={label}
      variant="ghost"
      w="100%"
      bg={isActive ? "gray.100" : "gray.700"}
      _hover={{ bg: "gray.100" }}
    >
      <Icon as={IconComponent} />
      {isOpen ? <Text ml={2}>{label}</Text> : null}
    </IconButton>
  );

  // If the item has a route, wrap it in Link, otherwise make it clickable with onClick
  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return <Box onClick={onClick}>{content}</Box>;
};

const Sidebar = ({ isOpen, onMouseEnter, onMouseLeave, items }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Box
      w={isOpen ? "200px" : "60px"}
      transition="all 0.2s"
      overflowX="hidden"
      borderRight="1px solid"
      borderColor="gray.200"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Flex direction="column" p={2} gap={2} h="100%" justify="center">
        {items.map((item, index) => (
          <SidebarItem
            key={index}
            {...item}
            isOpen={isOpen}
            isActive={item.to === currentPath || (currentPath === "/" && item.to === "/tasks")}
          />
        ))}
      </Flex>
    </Box>
  );
};

export default function DashboardLayout({ children }) {
  const { open: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultOpen: false });
  const navigate = useNavigate();

  const handlePlaceholderClick = (label) => {
    console.log(`Clicked ${label} - Add your placeholder action here`);
    // You can add popup logic or other actions here
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const sidebarItems = [
    {
      icon: FiGrid,
      label: "Tasks",
      to: "/tasks",
    },
    {
      icon: FiFileText,
      label: "Notes",
      to: "/notes",
    },
    {
      icon: FiZap,
      label: "Pomo",
      onClick: () => handlePlaceholderClick("Pomo"),
    },
    {
      icon: FiUser,
      label: "User",
      onClick: () => handlePlaceholderClick("User"),
    },
    {
      icon: FiLoader,
      label: "Loader",
      onClick: () => handlePlaceholderClick("Loader"),
    },
    {
      icon: FiLogOut,
      label: "Logout",
      onClick: () => handleLogout(),
    },
  ];

  return (
    <Flex h="100vh" w="100vw">
      <Sidebar isOpen={isSidebarOpen} onMouseEnter={toggleSidebar} onMouseLeave={toggleSidebar} items={sidebarItems} />
      <Flex direction="column" flex={1}>
        {children}
      </Flex>
    </Flex>
  );
}
