import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  HStack,
  Text,
  Badge,
  Icon,
  Container,
  useDisclosure,
} from "@chakra-ui/react";
import { FaSearch, FaTags, FaBook, FaCheckSquare } from "react-icons/fa";
import { useNotes } from "../contexts/note-context";
import { useTasks } from "../contexts/task-context";
import { TagBadges } from "../components/ui/tag-badges";
import { InputGroup } from "../components/ui/input-group";
import { TagManagerDialog } from "../components/tag-manager-dialog";
import { Filter, FilterType, FilterStatus, FilterSortBy } from "../lib/filters"; // Import Filter class and types
import GlobalList from "../components/global-list"; // Import GlobalList
import { ListPagination } from "../components/list-pagination";
import { CountButton } from "../components/list/countButton";
import { TagFilterButton } from "../components/tag-filter-button";
import { TypeFilterButton } from "../components/type-filter-button";
import { PinnedQueries } from "../components/pinned-queries";




// --- List Component ---

export default function List() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Get context data
  const { setModalTask } = useTasks();
  const { createNote, setSelectedNote } = useNotes();

  // Initialize the master Filter object from search params first
  const initialFilter = useMemo(() => Filter.fromSearchParams(searchParams), [searchParams]);

  // Initialize individual filter controls state from the initial Filter object
  const [titleFilter, setTitleFilter] = useState(initialFilter.title);
  const [typeFilter, setTypeFilter] = useState<FilterType>(initialFilter.type);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(initialFilter.status);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialFilter.tags);
  const [sortBy, setSortBy] = useState<FilterSortBy>(initialFilter.sortBy);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialFilter.sortDirection);

  // State for the Filter object passed to GlobalList - initial value is now derived
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter);


  // State for Tag Manager Dialog
  const { open: isTagManagerOpen, onOpen: onTagManagerOpen, onClose: onTagManagerClose } = useDisclosure();
  // Effect to update the activeFilter state when individual controls change
  useEffect(() => {
    // Update activeFilter only if individual controls differ from the current activeFilter
    // This prevents loops if activeFilter itself triggers changes elsewhere that sync back
    if (
      titleFilter !== activeFilter.title ||
      typeFilter !== activeFilter.type ||
      statusFilter !== activeFilter.status ||
      JSON.stringify(selectedTagIds) !== JSON.stringify(activeFilter.tags) || // Deep compare for tags
      sortBy !== activeFilter.sortBy ||
      sortDirection !== activeFilter.sortDirection
    ) {
      setActiveFilter(new Filter({
        title: titleFilter,
        type: typeFilter,
        status: statusFilter,
        tags: selectedTagIds,
        sortBy: sortBy,
        sortDirection: sortDirection,
        pageNumber: 1, // Reset page number when filters change
        itemsPerPage: 10, // Keep current itemsPerPage
      }));
    }
  }, [titleFilter, typeFilter, statusFilter, selectedTagIds, sortBy, sortDirection, activeFilter]); // Add activeFilter to deps

  // Effect to update individual filter controls IF the initialFilter changes (e.g., browser back/forward)
  useEffect(() => {
    setTitleFilter(initialFilter.title);
    setTypeFilter(initialFilter.type);
    setStatusFilter(initialFilter.status);
    setSelectedTagIds(initialFilter.tags);
    setSortBy(initialFilter.sortBy);
    setSortDirection(initialFilter.sortDirection);
    setActiveFilter(initialFilter); // Also reset active filter to match URL
  }, [initialFilter]);



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

  // Tag Click Handler
  const handleTagClick = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const newSelectedIds = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId];
      return newSelectedIds;
    });
  };

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
      tags: selectedTagIds, // Pre-fill tags based on current filter
    });
    // Potentially trigger count refetch after modal save
  };

  const handleCreateNote = async () => {
    try {
      const data = {
        title: "New Note",
        content: "",
        tags: selectedTagIds, // Pre-fill tags
      };
      const newNote = await createNote(data);
      if (newNote?.id) {
        setSelectedNote(newNote);
        // TODO: Refetch counts if needed, or rely on GlobalList re-render?
        // Consider triggering count refetch explicitly
        // fetchItemCounts(activeFilter).then(counts => { ... });
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
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
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

        {(titleFilter || typeFilter !== "all" || selectedTagIds.length > 0 || statusFilter !== "open") && (
          <Flex wrap="wrap" gap={2} mb={4}>
            <Text color="gray.600" fontWeight="medium">
              Active filters:
            </Text>

            {titleFilter && (
              <Badge colorScheme="blue" borderRadius="full" px={2} display="flex" alignItems="center">
                Title: {titleFilter}
              </Badge>
            )}

            {typeFilter !== "all" && (
              <Badge colorScheme="purple" borderRadius="full" px={2} display="flex" alignItems="center">
                Type: {typeFilter}
              </Badge>
            )}

            {statusFilter !== "open" && (
              <Badge colorScheme="orange" borderRadius="full" px={2} display="flex" alignItems="center">
                Status: {statusFilter}
              </Badge>
            )}

            {selectedTagIds.length > 0 && <TagBadges tagIds={selectedTagIds} onRemove={handleTagClick} size="sm" />}

            <Button
              size="xs"
              onClick={() => {
                setTitleFilter("");
                setTypeFilter("all");
                setSelectedTagIds([]);
                setStatusFilter("open");
                setSortBy('created');
                setSortDirection('desc');
              }}
            >
              Clear filters
            </Button>
          </Flex>
        )}

        <Flex justifyContent="space-between">
          <Box>
            <CountButton collection="taskandnotes" title="Open" filter={new Filter({ ...activeFilter, status: "open" })} onClick={() => {
              setStatusFilter("open");
            }} />
            <CountButton collection="taskandnotes" title="Closed" filter={new Filter({ ...activeFilter, status: "closed" })} onClick={() => {
              setStatusFilter("closed");
            }} />
          </Box>
          <Box>
            <TypeFilterButton selectedType={typeFilter} handleSelectionChange={setTypeFilter} />
            <TagFilterButton selectedTagIds={selectedTagIds} handleSelectionChange={setSelectedTagIds} />

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
