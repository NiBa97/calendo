import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "../components/sidebar";
import { useIsMobile } from "../utils/responsive";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Flex h="100vh" w="100vw" direction="column">
        <Sidebar />
        <Box flex={1} overflow="auto">
          {children}
        </Box>
      </Flex>
    );
  }

  return (
    <Flex h="100vh" w="100vw" direction="row">
      <Sidebar />
      <Box flex={1} overflow="auto">
        {children}
      </Box>
    </Flex>
  );
}
