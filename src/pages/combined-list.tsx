import { Box, Flex } from "@chakra-ui/react";
import CombinedList from "../components/combined-list";

export default function CombinedListPage() {
  return (
    <Flex direction="column" flex={1} h="100vh" overflow="hidden">
      <Box h="100%" overflow="auto">
        <CombinedList />
      </Box>
    </Flex>
  );
}
