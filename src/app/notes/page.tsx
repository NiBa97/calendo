import { Box, Text, VStack } from "@chakra-ui/react";

export default function DefaultNoteContent() {
  return (
    <VStack height="100%" justify="center" align="center" spacing={4} p={8} color="brand.4" opacity={0.7}>
      <Text fontSize="2xl">Select a note to view or edit</Text>
      <Text>Or create a new note to get started</Text>
    </VStack>
  );
}
