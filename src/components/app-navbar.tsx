import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  Icon,
  useBreakpointValue,
  Divider,
} from "@chakra-ui/react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FaCalendarAlt, FaBook, FaUser, FaSignOutAlt } from "react-icons/fa";

export default function AdvancedNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const navigationItems = [
    {
      name: "Calendar",
      path: "/webapp",
      icon: FaCalendarAlt,
    },
    {
      name: "Notes",
      path: "/notes",
      icon: FaBook,
    },
  ];

  return (
    <Box width="100%" bg="brand.1" color="brand.4" position="relative">
      <Flex
        height="14"
        px={4}
        alignItems="center"
        justifyContent="space-between"
        borderBottom="1px solid"
        borderColor="brand.2"
      >
        {/* Logo and Navigation */}
        <Text fontSize="lg" fontWeight="bold">
          Calendo
        </Text>

        <HStack spacing={0} display={{ base: "none", md: "flex" }} height="100%">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.path);

            return (
              <Link key={item.path} href={item.path} passHref>
                <Button
                  as="a"
                  height="55px"
                  px={6}
                  variant="unstyled"
                  display="flex"
                  alignItems="center"
                  position="relative"
                  color={isActive ? "brand.4" : "whiteAlpha.700"}
                  transition="all 0.2s ease"
                  _before={{
                    content: '""',
                    position: "absolute",
                    bottom: "-1px",
                    left: "0",
                    right: "0",
                    height: "1px",
                    bg: "brand.2",
                    transition: "all 0.2s ease",
                  }}
                  _after={{
                    content: '""',
                    position: "absolute",
                    bottom: "-1px",
                    left: "0",
                    width: "100%",
                    height: "2px",
                    bg: "brand.3",
                    transform: isActive ? "scaleX(0.8)" : "scaleX(0)",
                    transition: "transform 0.2s ease",
                  }}
                  _hover={{
                    color: "brand.4",
                    bg: "brand.2",
                    _after: {
                      transform: "scaleX(0.8)",
                    },
                    _before: {
                      opacity: 0,
                    },
                  }}
                >
                  <HStack spacing={2}>
                    <Icon as={item.icon} boxSize="4" />
                    <Text>{item.name}</Text>
                  </HStack>
                </Button>
              </Link>
            );
          })}
        </HStack>

        {/* User Menu */}
        {session?.user && (
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              height="10"
              px={3}
              _hover={{ bg: "brand.2" }}
              _active={{ bg: "brand.2" }}
            >
              <HStack spacing={2}>
                <Avatar size="sm" name={session.user.name ?? undefined} src={session.user.image ?? undefined} />
                <Text display={{ base: "none", md: "block" }}>{session.user.name}</Text>
              </HStack>
            </MenuButton>
            <MenuList bg="brand.1" borderColor="brand.2">
              <MenuItem icon={<Icon as={FaUser} />} _hover={{ bg: "brand.2" }}>
                Profile
              </MenuItem>
              <Divider borderColor="brand.2" />
              <MenuItem
                icon={<Icon as={FaSignOutAlt} />}
                onClick={() => void signOut()}
                color="red.400"
                _hover={{ bg: "brand.2" }}
              >
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

      {/* Mobile Navigation */}
      <Flex display={{ base: "flex", md: "none" }}>
        <HStack width="100%" justify="space-around" p={2} borderTop="1px" borderColor="brand.2" bg="brand.1">
          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.path);

            return (
              <Link key={item.path} href={item.path} passHref style={{ flex: 1 }}>
                <Button
                  as="a"
                  variant="unstyled"
                  width="100%"
                  height="10"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  color={isActive ? "brand.4" : "whiteAlpha.700"}
                  position="relative"
                  _after={{
                    content: '""',
                    position: "absolute",
                    bottom: "-2px",
                    left: "30%",
                    width: "40%",
                    height: "2px",
                    bg: "brand.3",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 0.2s ease",
                  }}
                  _hover={{
                    color: "brand.4",
                    _after: {
                      transform: "scaleX(1)",
                    },
                  }}
                >
                  <Icon as={item.icon} boxSize="4" />
                </Button>
              </Link>
            );
          })}
        </HStack>
      </Flex>
    </Box>
  );
}
