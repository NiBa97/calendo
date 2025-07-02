import { Box, Flex, IconButton, Icon, useDisclosure, Text, Badge, Avatar } from "@chakra-ui/react";
import { FiGrid, FiFileText, FiZap, FiList, FiMenu, FiX, FiEdit2, FiTag } from "react-icons/fi";
import { RiExpandRightFill } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OperationStatusIndicator } from "./operation-status-indicator";
import { IconType } from "react-icons";
import ProfileDialog from "./settings/mainDialog";
import { useIsMobile } from "../utils/responsive";
import CalendoIcon from "./CalendoIcon";
import { useTags } from "../contexts/tag-context";
import { getContrastColor } from "../utils/colors";

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
      justifyContent={isOpen ? "flex-start" : "center"}
      px={isOpen ? 4 : 0}
    >
      <Icon as={IconComponent} />
      {isOpen ? <Text ml={2}>{label}</Text> : null}
    </IconButton>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return <Box onClick={(e) => onClick?.(e)}>{content}</Box>;
};

const TagsSection = ({ isOpen }: { isOpen: boolean }) => {
  const { tags } = useTags();
  const navigate = useNavigate();
  const location = useLocation();

  const handleTagClick = (tagId: string) => {
    // Always navigate to list with the selected tag, using replace to update URL
    if (location.pathname === '/list') {
      // If already on list page, replace the URL
      navigate(`/list?tags=${tagId}`, { replace: true });
    } else {
      // If on different page, navigate normally
      navigate(`/list?tags=${tagId}`);
    }
  };

  if (!isOpen) {
    return (
      <Box p={2}>
        <Icon as={FiTag} color="gray.500" mx="auto" display="block" />
      </Box>
    );
  }

  return (
    <Box px={2} py={1}>
      <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={2} textTransform="uppercase">
        Tags
      </Text>
      <Box maxH="120px" overflowY="auto">
        {tags.length === 0 ? (
          <Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
            No tags yet
          </Text>
        ) : (
          <Flex wrap="wrap" gap={1}>
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                bg={tag.color}
                color={getContrastColor(tag.color)}
                cursor="pointer"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
                _hover={{ opacity: 0.8 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTagClick(tag.id);
                }}
                width="fit-content"
                whiteSpace="nowrap"
              >
                {tag.name}
              </Badge>
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
};

const PersonalSection = ({ isOpen, onEditClick }: { isOpen: boolean; onEditClick: () => void }) => {
  const userName = "John Doe";
  const isPremium = true;
  if (!isOpen) {
    return (
      <Flex align="center" justify="center" p={2}>
        <Avatar.Root>
          <Avatar.Fallback name={userName} />
          <Avatar.Image src="https://bit.ly/tioluwani-kola-1" />
        </Avatar.Root>
      </Flex>
    );
  }

  return (
    <Flex align="center" mx={1} borderTop="1px solid" borderColor="gray.200" pt={2} gap={2}>
      <Avatar.Root size="xs">
        <Avatar.Fallback name={userName} />
        <Avatar.Image src="https://bit.ly/tioluwani-kola-1" />
      </Avatar.Root>
      <Box flex="1" minWidth={0}>
        <Text fontWeight="bold" fontSize="sm" maxLines={1}>
          {userName}
        </Text>
        <Text fontSize="xs" color="gray.600">
          {isPremium ? "Premium" : "Free"}
        </Text>
      </Box>
      <IconButton
        aria-label="Edit profile"
        size="xs"
        onClick={onEditClick}
        _hover={{ bg: "gray.200" }}
      >
        <Icon as={FiEdit2} />
      </IconButton>
    </Flex>
  );
};

interface SidebarItem {
  icon: IconType;
  label: string;
  to: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Sidebar = () => {
  const { open: isSidebarOpen, onToggle: toggleSidebar, onClose: closeSidebar } = useDisclosure({ defaultOpen: false });
  const { open: isCollapsed, onToggle: toggleCollapse } = useDisclosure({ defaultOpen: false });
  const profileDisclosure = useDisclosure();
  const isMobile = useIsMobile();
  const location = useLocation();
  const currentPath = location.pathname;

  const handlePlaceholderClick = (label: string) => {
    console.log(`Clicked ${label} - Add your placeholder action here`);
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

  ];


  const isOpen = isMobile ? isSidebarOpen : !isCollapsed;

  return (
    <>
      {/* Mobile Top Bar */}
      {isMobile && (
        <Flex
          p={0}
          borderBottom="1px solid"
          borderColor="gray.200"
          justify="space-between"
          align="center"
          bg="brand.2"
          h="56px"
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
          <Box w="40px" />
        </Flex>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <Box className="mobile-nav-overlay" onClick={closeSidebar} />
      )}

      {/* Unified Sidebar */}
      <Box
        className={isMobile ? `mobile-nav-sidebar ${isOpen ? 'open' : ''}` : undefined}
        w={isMobile ? "280px" : (isOpen ? "200px" : "60px")}
        transition="all 0.2s"
        overflowX="hidden"
        borderRight="1px solid"
        borderColor="gray.200"
        h={isMobile ? "100dvh" : "100vh"}
        flexShrink={0}
        bg={"brand.2"}
        position={isMobile ? "fixed" : "static"}
        top={0}
        left={0}
        zIndex={isMobile ? 9999 : "auto"}
      >
        <Flex direction="column" p={isMobile ? 4 : 2} gap={2} h="100%" overflowY="hidden">
          {/* Header Section */}
          <Flex align="center" justify="space-between" mb={4} px={0} py={2}>
            {/* Mobile Close Button or Logo */}
            {isMobile ? (
              <>
                <Text fontSize="lg" fontWeight="bold">Menu</Text>
                <IconButton
                  aria-label="Close menu"
                  variant="ghost"
                  onClick={closeSidebar}
                >
                  <Icon as={FiX} />
                </IconButton>
              </>
            ) : (
              <>
                {isOpen && (
                  <Flex align="center">
                    <CalendoIcon boxSize={6} color="brand.4" />
                    <Text ml={3} fontSize="lg" fontWeight="bold" color="brand.4">Calendo</Text>
                  </Flex>
                )}
                <IconButton
                  aria-label="Toggle sidebar"
                  variant="ghost"
                  onClick={toggleCollapse}
                  size="sm"
                  bg="gray.100"
                  _hover={{ bg: "gray.200" }}
                  borderRadius="md"
                >
                  <Icon
                    as={RiExpandRightFill}
                    transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                    transition="transform 0.2s"
                  />
                </IconButton>
              </>
            )}
          </Flex>

          {/* Navigation Items */}
          <Box flex="1" gap={2} display="flex" flexDirection="column" overflowY="auto" minH={0}>
            {sidebarItems.map((item, index) => (
              <SidebarItem
                key={index}
                icon={item.icon}
                label={item.label}
                isOpen={isOpen}
                to={item.to || ""}
                isActive={item.to === currentPath || (currentPath === "/" && item.to === "/tasks")}
                onClick={() => {
                  if (item.onClick) item.onClick({} as React.MouseEvent<HTMLDivElement>);
                  if (isMobile) closeSidebar();
                }}
              />
            ))}

            <Box borderTop="1px solid" borderColor="gray.200" pt={2} mt={2}>
              <TagsSection isOpen={isOpen} />
            </Box>
          </Box>

          {/* Footer */}
          <Box>
            <OperationStatusIndicator />
          </Box>
          {!isMobile && (
            <PersonalSection
              isOpen={isOpen}
              onEditClick={() => profileDisclosure.onOpen()}
            />
          )}
        </Flex>
      </Box>

      <ProfileDialog isOpen={profileDisclosure.open} onClose={profileDisclosure.onClose} />
    </>
  );
};

export default Sidebar;