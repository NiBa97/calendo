import { Input, Text, VStack, HStack, Button, Flex, Icon, Table } from "@chakra-ui/react";
import { FaSearch, FaPlus, FaFileAlt, FaFile, FaBook, FaBookOpen } from "react-icons/fa";
import { useNotes } from "../contexts/note-context";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Note } from "../types";
import { InputGroup } from "./ui/input-group";

export const NoteList = () => {
  const { notes, searchTerm, setSearchTerm, createNote } = useNotes();
  const navigate = useNavigate();

  const sortedAndFilteredNotes = useMemo(() => {
    const filtered = notes.filter((note) => {
      const matchesSearch = searchTerm === "" || note.title?.toLowerCase().includes(searchTerm.toLowerCase()); //||
      // note.content?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const dateA = a.updated ? new Date(a.updated).getTime() : 0;
      const dateB = b.updated ? new Date(b.updated).getTime() : 0;
      return dateB - dateA;
    });
  }, [notes, searchTerm]);

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
    }
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "No date";

    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return `today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffInDays === 1) {
      return "yesterday";
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return `on ${date.toLocaleDateString()}`;
    }
  };

  const getContentSizeIndicator = (content: string = "") => {
    const cleanContent = content
      .replace(/<[^>]*>/g, "")
      .replace(/import\s+.*?from\s+['"].*?['"]/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .trim();

    const wordCount = cleanContent.split(/\s+/).filter(Boolean).length;

    if (wordCount === 0) return { icon: FaFile, tooltip: "Empty note" };
    if (wordCount < 50) return { icon: FaFileAlt, tooltip: "Short note" };
    if (wordCount < 200) return { icon: FaBook, tooltip: "Medium note" };
    return { icon: FaBookOpen, tooltip: "Long note" };
  };

  return (
    <VStack p={4} gap={4} align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="2xl" fontWeight="bold">
          Notes
        </Text>
        <Button onClick={handleCreateNote} bg="brand.2" _hover={{ bg: "brand.3" }}>
          <HStack>
            <FaPlus />
            <Text>New Note</Text>
          </HStack>
        </Button>
      </Flex>

      <Flex gap={4}>
        <InputGroup endElement={<FaSearch />} flex={1}>
          <Input
            placeholder="Search notes by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="brand.2"
            _hover={{ bg: "brand.2" }}
            _focus={{ bg: "brand.2", borderColor: "brand.3" }}
          />
        </InputGroup>
      </Flex>

      <Table.Root interactive>
        <Table.ColumnGroup>
          <Table.Column w="1" />
          <Table.Column />
          <Table.Column />
          <Table.Column />
        </Table.ColumnGroup>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader>Title</Table.ColumnHeader>
            <Table.ColumnHeader>Created</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedAndFilteredNotes.map((note: Note) => {
            const sizeIndicator = getContentSizeIndicator(note.content);
            return (
              <Table.Row key={note.id} onClick={() => navigate(`/notes/${note.id}`)} cursor="pointer">
                <Table.Cell>
                  <Icon as={sizeIndicator.icon} boxSize={5} aria-label={sizeIndicator.tooltip} color="brand.1" />
                </Table.Cell>
                <Table.Cell>
                  <Text color="brand.1" fontWeight="bold" fontSize="lg">
                    {note.title}
                  </Text>
                  <Text color="brand.1" fontSize="sm">
                    Updated {formatDate(note.updated)}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text color="brand.1">{formatDate(note.created)}</Text>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </VStack>
  );
};
