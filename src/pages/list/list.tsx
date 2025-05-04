import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  HStack,
  Icon,
  Container,
  useDisclosure,
  InputGroup,
} from "@chakra-ui/react";
import { FaSearch, FaTags, FaBook, FaCheckSquare } from "react-icons/fa";
import { useNotes } from "../../contexts/note-context";
import { useTasks } from "../../contexts/task-context";
import { TagManagerDialog } from "../../components/tag-manager-dialog";
import { Filter } from "../../lib/filters"; // Import Filter class and types
import { CountButton } from "./components/countButton";
import { TagFilterButton } from "./components/tag-filter-button";
import { TypeFilterButton } from "./components/type-filter-button";
import { PinnedQueries } from "./components/pinned-queries";
import { FilterDisplay } from "./components/filter-display";
import GlobalList from "./components/global-list";
import { ListPagination } from "./components/list-pagination";




// --- List Component ---

export default function List() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Get context data
  const { setModalTask } = useTasks();
  const { createNote, setSelectedNote } = useNotes();


  const [activeFilter, setActiveFilter] = useState<Filter>(Filter.fromSearchParams(searchParams));


  // State for Tag Manager Dialog
  const { open: isTagManagerOpen, onOpen: onTagManagerOpen, onClose: onTagManagerClose } = useDisclosure();




  // Update URL when filter controls change (debounced or direct)
  useEffect(() => {
    const params = activeFilter.toSearchParams();
    // Only update if params actually changed
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
    // Reset selection when filter changes that affect the list content
    //setSelectedListIds([]); // This might clear selection too often, consider moving
  }, [activeFilter, setSearchParams, searchParams]); // Added searchParams dependency



  // Create Task/Note Handlers
  const handleCreateTask = () => {
    setModalTask({
      id: "",
      title: "New Task", // Use title
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      created: new Date(),
      isAllDay: false,
      status: false,
      user: [],
      tags: activeFilter.tags, // Pre-fill tags based on current filter
    });
  };

  const handleCreateNote = async () => {
    try {
      const data = {
        title: "New Note",
        content: "",
        tags: activeFilter.tags, // Pre-fill tags
      };
      const newNote = await createNote(data);
      if (newNote?.id) {
        setSelectedNote(newNote);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Tag Manager Dialog Handler
  const handleTagManagerOpenChange = (open: boolean) => {
    if (open) onTagManagerOpen(); else onTagManagerClose();
  };



  return (
    <>
      <Container p={4} maxW="3xl" mx="auto" w="3xl">
        <Heading size="lg" mb={4}>All Items</Heading>
        <PinnedQueries currentFilter={activeFilter} setCurrentFilter={setActiveFilter} />

        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          mb={6}
          p={3}
          bg="gray.50"
          borderRadius="md"
          flexWrap="wrap"
        >
          <InputGroup startElement={<FaSearch />} flex={{ base: "1", md: "2" }}>
            <Input
              placeholder="Filter by title..."
              value={activeFilter.title}
              onChange={(e) => setActiveFilter(new Filter({ ...activeFilter, title: e.target.value }))}
              bg="white"
            />
          </InputGroup>
          <HStack>
            <Button colorScheme="blue" onClick={handleCreateNote}>
              <Icon as={FaBook} mr={2} />
              New Note
            </Button>
            <Button colorScheme="green" onClick={handleCreateTask}>
              <Icon as={FaCheckSquare} mr={2} />
              New Task
            </Button>
            <Button colorScheme="red" onClick={onTagManagerOpen}>
              <Icon as={FaTags} mr={2} />
              Tags
            </Button>
          </HStack>
        </Flex>

        <FilterDisplay filter={activeFilter} onChange={setActiveFilter} />

        <Flex justifyContent="space-between">
          <Box>
            <CountButton collection="taskandnotes" title="Open" filter={new Filter({ ...activeFilter, status: "open" })} onClick={() => {
              setActiveFilter(new Filter({ ...activeFilter, status: "open" }));
            }} />
            <CountButton collection="taskandnotes" title="Closed" filter={new Filter({ ...activeFilter, status: "closed" })} onClick={() => {
              setActiveFilter(new Filter({ ...activeFilter, status: "closed" }));
            }} />
          </Box>
          <Box>
            <TypeFilterButton selectedType={activeFilter.type} handleSelectionChange={(type) => {
              setActiveFilter(new Filter({ ...activeFilter, type: type }));
            }} />
            <TagFilterButton selectedTagIds={activeFilter.tags} handleSelectionChange={(tags) => {
              setActiveFilter(new Filter({ ...activeFilter, tags: tags }));
            }} />

          </Box>
        </Flex>
        <GlobalList
          filter={activeFilter}
          onSelectionChange={() => { }}
        />
        <ListPagination
          currentPage={activeFilter.pageNumber}
          maxPage={50}
          onChange={(pageNumber) => {
            setActiveFilter(new Filter({
              ...activeFilter,
              pageNumber: pageNumber,
            }));
          }}
        />
      </Container>

      {/* Render Tag Manager Dialog */}
      <TagManagerDialog isOpen={isTagManagerOpen} onOpenChange={handleTagManagerOpenChange} />
    </>
  );
}
