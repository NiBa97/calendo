import { Box, Text, Flex, Link, Button } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { FaSignOutAlt } from "react-icons/fa";

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
        <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
          <Button leftIcon={<FaSignOutAlt />}>Sign out</Button>
        </Link>
      </Box>
    </Flex>
  );
}
