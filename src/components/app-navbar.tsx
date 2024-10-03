import { Box, Text, Flex, Link, Button, MenuList, MenuItem, MenuButton, Avatar, Menu } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { FaSignOutAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";

export default function AppNavbar() {
  const { data: session } = useSession();
  console.log(session);
  if (!session?.user) return <>Loading</>;
  return (
    <Flex
      width={"100"}
      height={"50px"}
      bg={"brand.2"}
      color={"brand.4"}
      justifyContent={"space-between"}
      alignItems={"center"}
      px={4}
    >
      <Box>
        <Text fontSize={"lg"} fontWeight={"bold"}>
          Welcome, {session.user?.name}!
        </Text>
      </Box>
      <Box>
        <Menu>
          <MenuButton as={Box} cursor="pointer">
            <Flex alignItems={"center"} gap={2}>
              <Avatar size="sm" name={session.user?.name ?? ""} src={session.user?.image ?? ""} />
              <Text fontSize={"md"} fontWeight={"bold"}>
                {session.user?.name ?? ""}
              </Text>
              <FaChevronDown />
            </Flex>
          </MenuButton>
          <MenuList>
            <MenuItem as={Link} href="/api/auth/signout">
              <Button leftIcon={<FaSignOutAlt />} variant="link">
                Sign out
              </Button>
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
}
