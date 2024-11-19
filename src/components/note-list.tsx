"use client";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
  Text,
  Grid,
  VStack,
  HStack,
  Button,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { FaSearch, FaHashtag, FaPlus } from "react-icons/fa";
import { useNotes } from "~/contexts/note-context";
import { useRouter } from "next/navigation";

export const NoteList = () => {
  const { filteredNotes, tags, searchTerm, selectedTags, setSearchTerm, setSelectedTags, createNote } = useNotes();

  const router = useRouter();
  const toast = useToast();

  const handleCreateNote = async () => {
    try {
      const data = {
        title: "New Note",
        content: "",
      };
      const newNote = await createNote(data);
      if (newNote?.id) {
        router.push(`/notes/${newNote.id}`);
      }
    } catch (error) {
      toast({
        title: "Error creating note",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack height="100%" p={4} spacing={4} align="stretch">
      <Button
        leftIcon={<Icon as={FaPlus} />}
        onClick={handleCreateNote}
        width="full"
        bg="brand.2"
        _hover={{ bg: "brand.3" }}
      >
        New Note
      </Button>

      <InputGroup>
        <InputLeftElement>
          <Icon as={FaSearch} />
        </InputLeftElement>
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          bg="brand.2"
          _hover={{ bg: "brand.2" }}
          _focus={{ bg: "brand.2", borderColor: "brand.3" }}
        />
      </InputGroup>

      <VStack align="stretch">
        <HStack>
          <Icon as={FaHashtag} />
          <Text>Tags</Text>
        </HStack>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {tags.map((tag) => (
            <Tag
              key={tag.id}
              onClick={() =>
                setSelectedTags(
                  selectedTags.includes(tag.name)
                    ? selectedTags.filter((t) => t !== tag.name)
                    : [...selectedTags, tag.name]
                )
              }
              bg={selectedTags.includes(tag.name) ? "brand.3" : "brand.2"}
              color="brand.4"
              cursor="pointer"
              _hover={{ bg: "brand.3" }}
            >
              {tag.name}
            </Tag>
          ))}
        </Box>
      </VStack>

      <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4} overflowY="auto" flex={1}>
        {filteredNotes.map((note) => (
          <Box
            key={note.id}
            bg="brand.2"
            p={4}
            borderRadius="md"
            cursor="pointer"
            onClick={() => router.push(`/notes/${note.id}`)}
            _hover={{ bg: "brand.3", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              {note.title}
            </Text>
            <Text fontSize="sm" mb={3} noOfLines={2}>
              {note.content?.substring(0, 100) ?? "No content"}
            </Text>
            <HStack justify="space-between">
              <Box>
                {note.tags.map((tag) => (
                  <Tag key={tag.id} size="sm" mr={1} bg="brand.1" color="brand.4">
                    {tag.name}
                  </Tag>
                ))}
              </Box>
              <Text fontSize="xs" color="gray.400">
                {new Date(note.updatedAt).toLocaleDateString()}
              </Text>
            </HStack>
          </Box>
        ))}
      </Grid>
    </VStack>
  );
};
