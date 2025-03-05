import { Box, Flex, IconButton, Icon, useDisclosure, Text } from "@chakra-ui/react";
import { FiGrid, FiFileText, FiZap, FiUser, FiLoader, FiLogOut } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../pocketbaseUtils";
import { OperationStatusIndicator } from "../components/operation-status-indicator";
import { IconType } from "react-icons";

interface SidebarItemProps {
  icon: IconType;
  label: string;
  isOpen: boolean;
  to: string;
  isActive: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const SidebarItem = ({ icon: IconComponent, label, isOpen, to, isActive, onClick }: SidebarItemProps) => {
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
  return <Box onClick={(e) => onClick?.(e)}>{content}</Box>;
};

interface SidebarProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  items: SidebarItem[];
}

const Sidebar = ({ isOpen, onMouseEnter, onMouseLeave, items }: SidebarProps) => {
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
      <Flex direction="column" p={2} gap={2} h="100%">
        <Box flex="1">
          {items.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              isOpen={isOpen}
              to={item.to || ""}
              isActive={item.to === currentPath || (currentPath === "/" && item.to === "/tasks")}
              onClick={item.onClick}
            />
          ))}
        </Box>
        <Box>
          <OperationStatusIndicator />
        </Box>
      </Flex>
    </Box>
  );
};

interface SidebarItem {
  icon: IconType;
  label: string;
  to: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { open: isSidebarOpen, onToggle: toggleSidebar } = useDisclosure({ defaultOpen: false });
  const navigate = useNavigate();

  const handlePlaceholderClick = (label: string) => {
    console.log(`Clicked ${label} - Add your placeholder action here`);
    // You can add popup logic or other actions here
  };

  const handleLogout = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("test");
    e.preventDefault();
    e.stopPropagation();

    logout();
    navigate("/login");
  };
  const sidebarItems: SidebarItem[] = [
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
      to: "/pomo",
      onClick: () => handlePlaceholderClick("Pomo"),
    },
    {
      icon: FiUser,
      label: "User",
      to: "/user",
      onClick: () => handlePlaceholderClick("User"),
    },
    {
      icon: FiLoader,
      label: "Loader",
      to: "/loader",
      onClick: () => handlePlaceholderClick("Loader"),
    },
    {
      icon: FiLogOut,
      label: "Logout",
      to: "",
      onClick: (e) => handleLogout(e),
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
