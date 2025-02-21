import {
  Box,
  Input,
  Text,
  Grid,
  VStack,
  HStack,
  Button,
  //   useToast,
} from "@chakra-ui/react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { useNotes } from "../contexts/note-context";
import { useNavigate } from "react-router-dom";
import { Note } from "../types";
import { InputGroup } from "./ui/input-group";

export const NoteList = () => {
  const { filteredNotes, searchTerm, setSearchTerm, createNote } = useNotes();
  const navigate = useNavigate();

  const handleCreateNote = async () => {
    try {
      const data = {
        title: "New Note",
        content: "",
      };
      const newNote = await createNote(data);
      if (newNote?.id) {
        navigate(`/notes/${newNote.id}`);
      }
    } catch (error) {
      console.log(error);
      //   toast({
      //     title: "Error creating note",
      //     status: "error",
      //     duration: 3000,
      //     isClosable: true,
      //   });
    }
  };

  return (
    <VStack height="100%" p={4} gap={4} align="stretch">
      <Button onClick={handleCreateNote} width="full" bg="brand.2" _hover={{ bg: "brand.3" }}>
        <FaPlus /> New Note
      </Button>
      <InputGroup startElement={<FaSearch />}>
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          bg="brand.2"
          _hover={{ bg: "brand.2" }}
          _focus={{ bg: "brand.2", borderColor: "brand.3" }}
        />
      </InputGroup>

      <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4} overflowY="auto" flex={1}>
        {filteredNotes.map((note: Note) => (
          <Box
            key={note.id}
            bg="brand.2"
            p={4}
            borderRadius="md"
            cursor="pointer"
            onClick={() => navigate(`/notes/${note.id}`)}
            _hover={{ bg: "brand.3", transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              {note.title}
            </Text>
            <Text fontSize="sm" mb={3}>
              {note.content?.substring(0, 100) ?? "No content"}
            </Text>
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.400">
                {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : "No date"}
              </Text>
            </HStack>
          </Box>
        ))}
      </Grid>
    </VStack>
  );
};
