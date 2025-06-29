import { Box, Flex, IconButton, Icon, useDisclosure, Text } from "@chakra-ui/react";
import { FiGrid, FiFileText, FiZap, FiUser, FiLoader, FiLogOut, FiList, FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../pocketbaseUtils";
import { OperationStatusIndicator } from "../components/operation-status-indicator";
import { IconType } from "react-icons";
import ProfileDialog from "../components/settings/mainDialog";
import { useIsMobile } from "../utils/responsive";

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
  isMobile?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ isOpen, onMouseEnter, onMouseLeave, items, isMobile, onMobileClose }: SidebarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleItemClick = (item: SidebarItem) => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
    if (item.onClick) {
      item.onClick({} as React.MouseEvent<HTMLDivElement>);
    }
  };

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <Box className="mobile-nav-overlay" onClick={onMobileClose} />
        )}
        <Box className={`mobile-nav-sidebar ${isOpen ? 'open' : ''}`}>
          <Flex direction="column" p={4} gap={2} h="100%">
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="lg" fontWeight="bold">Menu</Text>
              <IconButton
                aria-label="Close menu"
                variant="ghost"
                onClick={onMobileClose}
              >
                <Icon as={FiX} />
              </IconButton>
            </Flex>
            <Box flex="1">
              {items.map((item, index) => (
                <Box key={index} mb={2}>
                  {item.to ? (
                    <Link to={item.to} onClick={() => handleItemClick(item)}>
                      <IconButton
                        aria-label={item.label}
                        variant="ghost"
                        w="100%"
                        justifyContent="flex-start"
                        bg={item.to === currentPath || (currentPath === "/" && item.to === "/tasks") ? "gray.100" : "transparent"}
                        _hover={{ bg: "gray.100" }}
                      >
                        <Icon as={item.icon} mr={3} />
                        <Text>{item.label}</Text>
                      </IconButton>
                    </Link>
                  ) : (
                    <IconButton
                      aria-label={item.label}
                      variant="ghost"
                      w="100%"
                      justifyContent="flex-start"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleItemClick(item)}
                    >
                      <Icon as={item.icon} mr={3} />
                      <Text>{item.label}</Text>
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
            <Box>
              <OperationStatusIndicator />
            </Box>
          </Flex>
        </Box>
      </>
    );
  }

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
  const { open: isSidebarOpen, onToggle: toggleSidebar, onClose: closeSidebar } = useDisclosure({ defaultOpen: false });
  const profileDisclosure = useDisclosure();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
      icon: FiList,
      label: "List View",
      to: "/list",
    },
    {
      icon: FiZap,
      label: "Pomo",
      to: "/pomo",
      onClick: () => handlePlaceholderClick("Pomo"),
    },
    {
      icon: FiUser,
      label: "Profile",
      to: "",
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        profileDisclosure.onOpen();
      },
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
    <Flex h="100vh" w="100vw" direction="column">
      {isMobile && (
        <Flex
          p={0}
          borderBottom="1px solid"
          borderColor="gray.200"
          justify="space-between"
          align="center"
          bg="brand.2"
        >
          <IconButton
            aria-label="Open menu"
            variant="ghost"
            onClick={toggleSidebar}
            color="brand.4"
          >
            <Icon as={FiMenu} />
          </IconButton>
          <Text fontSize="lg" fontWeight="bold">Calendo</Text>
          <Box w="40px" /> {/* Spacer for alignment */}
        </Flex>
      )}

      <Flex flex={1}>
        {!isMobile && (
          <Sidebar
            isOpen={isSidebarOpen}
            onMouseEnter={toggleSidebar}
            onMouseLeave={toggleSidebar}
            items={sidebarItems}
          />
        )}

        {isMobile && (
          <Sidebar
            isOpen={isSidebarOpen}
            onMouseEnter={() => { }}
            onMouseLeave={() => { }}
            items={sidebarItems}
            isMobile={true}
            onMobileClose={closeSidebar}
          />
        )}

        <Flex direction="column" flex={1}>
          {children}
        </Flex>
      </Flex>

      <ProfileDialog isOpen={profileDisclosure.open} onClose={profileDisclosure.onClose} />
    </Flex>
  );
}
