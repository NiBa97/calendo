import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  Menu,
  Container,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { FaSearch, FaFilter, FaTags, FaCaretDown, FaBook, FaCheckSquare, FaStar, FaTrash, FaPlus } from "react-icons/fa";
import { useNotes } from "../contexts/note-context";
import { useTasks } from "../contexts/task-context";
import { useTags } from "../contexts/tag-context";
import { TagBadges } from "../components/ui/tag-badges";
import { InputGroup } from "../components/ui/input-group";
import { MenuRoot, MenuTrigger, MenuContent } from "../components/ui/menu";
import React from 'react';
import { TagManagerDialog } from "../components/tag-manager-dialog";
import { pb } from "../pocketbaseUtils"; // Use named export
import { Filter, FilterType, FilterStatus, FilterSortBy } from "../lib/filters"; // Import Filter class and types
import GlobalList from "../components/global-list"; // Import GlobalList
import { ListPagination } from "../components/list-pagination";
import { CountButton } from "../components/list/countButton";

// Type for pinned queries
type PinnedQuery = {
  id: string;
  name: string;
  filters: {
    title: string;
    type: FilterType; // Use FilterType
    status: FilterStatus; // Use FilterStatus
    tags: string[];
    // Add sort properties if pinned queries should save them
    sortBy?: FilterSortBy;
    sortDirection?: "asc" | "desc";
  };
};


// --- List Component ---

export default function List() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Get context data
  const { setModalTask } = useTasks();
  const { createNote, setSelectedNote } = useNotes();
  const { tags } = useTags();

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

  // State for pinned queries
  const [pinnedQueries, setPinnedQueries] = useState<PinnedQuery[]>([]);
  const [showPinnedQueryInput, setShowPinnedQueryInput] = useState(false);
  const [newQueryName, setNewQueryName] = useState("");

  // State for Tag Manager Dialog
  const { open: isTagManagerOpen, onOpen: onTagManagerOpen, onClose: onTagManagerClose } = useDisclosure();


  
  pb.collection("taskandnotes").getList(1, 50, {
  }).then((records) => {
    console.log("records", records);
  });

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
        // Note: pageNumber/itemsPerPage are managed by GlobalList or kept default here
    ) {
        setActiveFilter(new Filter({
            title: titleFilter,
            type: typeFilter,
            status: statusFilter,
            tags: selectedTagIds,
            sortBy: sortBy,
            sortDirection: sortDirection,
            pageNumber: 1, // Reset page number when filters change
            itemsPerPage: activeFilter.itemsPerPage, // Keep current itemsPerPage
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

  // Load/Save pinned queries effects
  useEffect(() => {
    try {
      const savedQueries = localStorage.getItem("pinnedQueries");
      if (savedQueries) {
        const queries = JSON.parse(savedQueries);
        setPinnedQueries(queries);
      }
    } catch (error) {
      console.error("Error loading pinned queries:", error);
      localStorage.removeItem("pinnedQueries");
      setPinnedQueries([]);
    }
  }, []);

  useEffect(() => {
    try {
      if (pinnedQueries.length > 0) {
        localStorage.setItem("pinnedQueries", JSON.stringify(pinnedQueries));
      } else {
        localStorage.removeItem("pinnedQueries"); // Clear if empty
      }
    } catch (error) {
      console.error("Error saving pinned queries:", error);
    }
  }, [pinnedQueries]);

  // Pinned Query Handlers
  const handlePinCurrentQuery = () => {
    if (!newQueryName.trim()) return;
    const newQuery: PinnedQuery = {
      id: Date.now().toString(),
      name: newQueryName.trim(),
      filters: { // Use properties from activeFilter
        title: activeFilter.title,
        type: activeFilter.type,
        status: activeFilter.status,
        tags: [...activeFilter.tags],
        sortBy: activeFilter.sortBy,
        sortDirection: activeFilter.sortDirection,
      },
    };
    setPinnedQueries((prev) => [...prev, newQuery]);
    setNewQueryName("");
    setShowPinnedQueryInput(false);
  };

  const handleApplyPinnedQuery = (query: PinnedQuery) => {
    // Update individual filter states from pinned query
    setTitleFilter(query.filters.title);
    setTypeFilter(query.filters.type);
    setStatusFilter(query.filters.status);
    setSelectedTagIds(query.filters.tags);
    setSortBy(query.filters.sortBy || 'created'); // Handle optional sort props
    setSortDirection(query.filters.sortDirection || 'desc');
    // The useEffect watching these states will update activeFilter
  };

  const handleDeletePinnedQuery = (queryId: string) => {
    setPinnedQueries((prev) => prev.filter((q) => q.id !== queryId));
  };

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
        
        {/* Pinned Queries Section */}
        <Box mb={6}>
          <Flex align="center" justify="space-between" mb={2}>
            <Text fontSize="md" fontWeight="medium" color="gray.700">Pinned Filters</Text>
            <Button
              size="sm"
              onClick={() => setShowPinnedQueryInput(true)}
              colorScheme="blue"
              variant="ghost"
            >
              <Icon as={FaPlus} mr={2} />
              Add Filter
            </Button>
          </Flex>
          
          {showPinnedQueryInput && (
            <Flex gap={2} mb={3}>
              <Input
                placeholder="Enter name for pinned filters..."
                value={newQueryName}
                onChange={(e) => setNewQueryName(e.target.value)}
                size="sm"
                autoFocus
              />
              <Button size="sm" colorScheme="blue" onClick={handlePinCurrentQuery}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setShowPinnedQueryInput(false);
                setNewQueryName("");
              }}>
                Cancel
              </Button>
            </Flex>
          )}

          <Flex gap={2} flexWrap="wrap">
            {pinnedQueries.map((query) => (
              <Flex
                key={query.id}
                bg="gray.100"
                p={2}
                borderRadius="md"
                align="center"
                _hover={{ bg: "gray.200" }}
                cursor="pointer"
                onClick={() => handleApplyPinnedQuery(query)}
              >
                <Icon as={FaStar} color="yellow.500" mr={2} />
                <Text fontSize="sm" fontWeight="medium">{query.name}</Text>
                <Box>
                  <IconButton
                    aria-label="Delete pinned query"
                    size="xs"
                    variant="ghost"
                    ml={2}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleDeletePinnedQuery(query.id);
                    }}
                    _hover={{ color: "red.500" }}
                  >
                    <FaTrash />
                  </IconButton>
                </Box>
              </Flex>
            ))}
          </Flex>
        </Box>

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
            <CountButton collection="taskandnotes" title="Open" filter={new Filter({...activeFilter, status: "open"})} onClick={() => {
              setStatusFilter("open");
            }} />
            <CountButton collection="taskandnotes" title="Closed" filter={new Filter({...activeFilter, status: "closed"})} onClick={() => {
              setStatusFilter("closed");
            }} />
          </Box>
          <Box>
            <MenuRoot>
              <MenuTrigger asChild>
                <Button>
                  <Flex align="center">
                    <Icon as={FaFilter} mr={2} />
                    Type: {typeFilter === "all" ? "All" : typeFilter === "notes" ? "Notes" : "Tasks"}
                    <Icon as={FaCaretDown} ml={2} />
                  </Flex>
                </Button>
              </MenuTrigger>
              <MenuContent>
                <Menu.RadioItemGroup value={typeFilter} onValueChange={(details) => setTypeFilter(details.value as FilterType)}>
                  <Menu.RadioItem value="all">All Items</Menu.RadioItem>
                  <Menu.RadioItem value="notes">Notes</Menu.RadioItem>
                  <Menu.RadioItem value="tasks">Tasks</Menu.RadioItem>
                </Menu.RadioItemGroup>
              </MenuContent>
            </MenuRoot>

            <MenuRoot>
              <MenuTrigger asChild>
                <Button>
                  <Flex align="center">
                    <Icon as={FaTags} mr={2} />
                    Tags {selectedTagIds.length > 0 && `(${selectedTagIds.length})`}
                    <Icon as={FaCaretDown} ml={2} />
                  </Flex>
                </Button>
              </MenuTrigger>
              <MenuContent minW="250px">
                <Box p={3}>
                  <Text fontWeight="medium" mb={2}>
                    Filter by Tags
                  </Text>
                  <VStack align="stretch" maxH="200px" overflowY="auto">
                    {tags.length === 0 ? (
                      <Text color="gray.500">No tags found</Text>
                    ) : (
                      tags.map((tag) => (
                        <Flex
                          key={tag.id}
                          align="center"
                          p={2}
                          borderRadius="md"
                          cursor="pointer"
                          bg={selectedTagIds.includes(tag.id) ? "gray.100" : "transparent"}
                          _hover={{ bg: "gray.50" }}
                          onClick={() => handleTagClick(tag.id)}
                        >
                          <Box w="12px" h="12px" borderRadius="full" bg={tag.color} mr={2} />
                          <Text>{tag.name}</Text>
                        </Flex>
                      ))
                    )}
                  </VStack>
                </Box>
              </MenuContent>
            </MenuRoot>
          </Box>
        </Flex>
        <GlobalList
          filter={activeFilter}
          onSelectionChange={() => {}}
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
