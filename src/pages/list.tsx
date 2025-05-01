import { useState, useEffect, useMemo, useCallback } from "react";
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
  Grid,
  GridItem,
  Container,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { FaSearch, FaFilter, FaTags, FaCaretDown, FaBook, FaCheckSquare, FaUserFriends, FaStar, FaTrash, FaPlus } from "react-icons/fa";
import { useNotes } from "../contexts/note-context";
import { useTasks } from "../contexts/task-context";
import { useTags } from "../contexts/tag-context";
import { TagBadges } from "../components/ui/tag-badges";
import { InputGroup } from "../components/ui/input-group";
import { MenuRoot, MenuTrigger, MenuContent } from "../components/ui/menu";
import TaskCheckbox from "../components/ui/task-checkbox";
import TitlePreview from "../components/ui/title-preview";
import React from 'react';
import { TagManagerDialog } from "../components/tag-manager-dialog";
import { pb } from "../pocketbaseUtils"; // Use named export
import { RecordModel } from "pocketbase"; // Import PocketBase types
import { Task, Note, convertTaskRecordToTask, convertNoteRecordToNote } from "../types"; // Import app types and converters

// Revert ListItem type to use isTask and Date objects for client-side processing
type ListItem = {
  id: string;
  title: string;
  isTask: boolean; 
  status: boolean;
  created: Date; // Use Date object for client-side sorting
  updated?: Date;
  dueDate?: Date; // Specific to tasks
  tags: string[];
  user: string[]; // Keep user array for shared status
};

// Type for pinned queries
type PinnedQuery = {
  id: string;
  name: string;
  filters: {
    title: string;
    type: string;
    status: string;
    tags: string[];
  };
};

export default function List() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get context data
  const { tasks, setModalTask, updateTask } = useTasks();
  const { notes, createNote, setSelectedNote } = useNotes();
  const { tags } = useTags();

  // Local state for filters
  const [titleFilter, setTitleFilter] = useState(searchParams.get("title") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "open");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    searchParams.get("tags") ? searchParams.get("tags")!.split(",") : []
  );

  // State for pinned queries
  const [pinnedQueries, setPinnedQueries] = useState<PinnedQuery[]>([]);
  const [showPinnedQueryInput, setShowPinnedQueryInput] = useState(false);
  const [newQueryName, setNewQueryName] = useState("");

  // State for Tag Manager Dialog
  const { open: isTagManagerOpen, onOpen: onTagManagerOpen, onClose: onTagManagerClose } = useDisclosure();

  // NEW STATE: For API data, pagination, counts, loading
  const [items, setItems] = useState<ListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 30; // Define how many items per page

  // Define fetch function using useCallback to keep reference stable
  const fetchItemsAndCounts = useCallback(async () => {
    setIsLoading(true);
    try {
      // --- Build Base Filter String (title, tags) ---
      let baseFilterParts: string[] = [];

      // Title filter (adjust field name for notes vs tasks)
      if (titleFilter) {
        const escapedTitle = titleFilter.replace(/"/g, '\"'); 
        // Apply to 'name' for tasks and 'title' for notes
        baseFilterParts.push(`(title ~ "${escapedTitle}" || name ~ "${escapedTitle}")`); 
      }

      // Tag filter (same field name 'tags' for both)
      if (selectedTagIds.length > 0) {
        const tagFilters = selectedTagIds.map(id => `tags ~ "${id.replace(/"/g, '\"')}"`);
        baseFilterParts.push(`(${tagFilters.join(" || ")})`);
      }

      const baseFilterString = baseFilterParts.join(" && ");

      // --- Fetch Item Counts (querying tasks and notes separately) ---
      const openStatusFilter = 'status = false';
      const closedStatusFilter = 'status = true';

      const finalOpenFilter = baseFilterString ? `${baseFilterString} && ${openStatusFilter}` : openStatusFilter;
      const finalClosedFilter = baseFilterString ? `${baseFilterString} && ${closedStatusFilter}` : closedStatusFilter;

      const countPromises = [];
      // Add task counts if type is 'all' or 'tasks'
      if (typeFilter === 'all' || typeFilter === 'tasks') {
         countPromises.push(pb.collection('task').getList(1, 1, { filter: finalOpenFilter, requestKey: 'task_open_count' }));
         countPromises.push(pb.collection('task').getList(1, 1, { filter: finalClosedFilter, requestKey: 'task_closed_count' }));
      } else {
         countPromises.push(Promise.resolve({ totalItems: 0 })); // Placeholder if not fetching tasks
         countPromises.push(Promise.resolve({ totalItems: 0 })); // Placeholder
      }
      // Add note counts if type is 'all' or 'notes'
       if (typeFilter === 'all' || typeFilter === 'notes') {
         countPromises.push(pb.collection('note').getList(1, 1, { filter: finalOpenFilter, requestKey: 'note_open_count' }));
         countPromises.push(pb.collection('note').getList(1, 1, { filter: finalClosedFilter, requestKey: 'note_closed_count' }));
      } else {
         countPromises.push(Promise.resolve({ totalItems: 0 })); // Placeholder if not fetching notes
         countPromises.push(Promise.resolve({ totalItems: 0 })); // Placeholder
      }

      const [taskOpenResult, taskClosedResult, noteOpenResult, noteClosedResult] = await Promise.all(countPromises);
      
      setOpenCount(taskOpenResult.totalItems + noteOpenResult.totalItems);
      setClosedCount(taskClosedResult.totalItems + noteClosedResult.totalItems);

      // --- Fetch All Items for Current View (Tasks and/or Notes) ---
      const currentStatusFilter = statusFilter === 'open' ? openStatusFilter : closedStatusFilter;
      const finalItemsFilter = baseFilterString ? `${baseFilterString} && ${currentStatusFilter}` : currentStatusFilter;

      let taskItems: ListItem[] = [];
      let noteItems: ListItem[] = [];
      const fetchPromises = [];

      if (typeFilter === 'all' || typeFilter === 'tasks') {
          fetchPromises.push(
              pb.collection('task').getFullList(200, {
                  filter: finalItemsFilter,
                  sort: '-created', // Sort server-side initially
                  requestKey: 'tasks_list'
              }).then(records => {
                  taskItems = records.map(rec => ({
                      ...convertTaskRecordToTask(rec),
                      isTask: true,
                      // Ensure title field is consistent
                      title: convertTaskRecordToTask(rec).name, 
                  }));
              })
          );
      }

      if (typeFilter === 'all' || typeFilter === 'notes') {
          fetchPromises.push(
              pb.collection('note').getFullList(200, {
                  filter: finalItemsFilter,
                  sort: '-created', // Sort server-side initially
                  requestKey: 'notes_list' 
              }).then(records => {
                  noteItems = records.map(rec => ({
                      ...convertNoteRecordToNote(rec),
                      isTask: false,
                  }));
              })
          );
      }

      await Promise.all(fetchPromises);

      // Combine, Sort Client-Side
      const combinedItems = [...taskItems, ...noteItems];
      combinedItems.sort((a, b) => b.created.getTime() - a.created.getTime());

      // Update totals based on combined results
      setTotalItems(combinedItems.length);
      setTotalPages(Math.ceil(combinedItems.length / itemsPerPage));

      // Apply Client-Side Pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setItems(combinedItems.slice(startIndex, endIndex));

    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error appropriately (e.g., show a toast message)
      setItems([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, titleFilter, typeFilter, statusFilter, selectedTagIds]); // Add dependencies

  // Load pinned queries from localStorage on mount
  useEffect(() => {
    try {
      const savedQueries = localStorage.getItem("pinnedQueries");
      if (savedQueries) {
        const queries = JSON.parse(savedQueries);
        setPinnedQueries(queries);
      }
    } catch (error) {
      console.error("Error loading pinned queries:", error);
      // If there's an error, clear the corrupted data

      localStorage.removeItem("pinnedQueries");
      setPinnedQueries([]);
    }
  }, []);

  // Save pinned queries to localStorage whenever they change
  useEffect(() => {
    try {
      if (pinnedQueries.length > 0) {
        localStorage.setItem("pinnedQueries", JSON.stringify(pinnedQueries));
      }
    } catch (error) {
      console.error("Error saving pinned queries:", error);
    }
  }, [pinnedQueries]);

  // Handle pinning current query
  const handlePinCurrentQuery = () => {
    if (!newQueryName.trim()) return;

    const newQuery: PinnedQuery = {
      id: Date.now().toString(),
      name: newQueryName.trim(),
      filters: {
        title: titleFilter,
        type: typeFilter,
        status: statusFilter,
        tags: [...selectedTagIds], // Create a new array to ensure proper serialization
      },
    };

    setPinnedQueries((prev) => [...prev, newQuery]);
    setNewQueryName("");
    setShowPinnedQueryInput(false);
  };

  // Handle applying a pinned query
  const handleApplyPinnedQuery = (query: PinnedQuery) => {
    setTitleFilter(query.filters.title);
    setTypeFilter(query.filters.type);
    setStatusFilter(query.filters.status);
    setSelectedTagIds(query.filters.tags);
  };

  // Handle deleting a pinned query
  const handleDeletePinnedQuery = (queryId: string) => {
    setPinnedQueries((prev) => prev.filter((q) => q.id !== queryId));
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (titleFilter) params.set("title", titleFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (selectedTagIds.length > 0) params.set("tags", selectedTagIds.join(","));

    setSearchParams(params, { replace: true });
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [titleFilter, typeFilter, statusFilter, selectedTagIds, setSearchParams]);

  // NEW EFFECT: Fetch data when fetch function reference or its dependencies change
  useEffect(() => {
    fetchItemsAndCounts();
  }, [fetchItemsAndCounts]);

  const handleTagClick = (tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  // Handle creating new task from list page
  const handleCreateTask = () => {
    // Create an empty task in modal
    setModalTask({
      id: "",
      title: "New Task",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      created: new Date(),
      isAllDay: false,
      status: false,
      user: [],
      tags: selectedTagIds,
    });
  };

  // Handle creating new note from list page
  const handleCreateNote = async () => {
    try {
      const data = {
        title: "New Note",
        content: "",
        tags: selectedTagIds,
      };
      const newNote = await createNote(data);
      if (newNote?.id) {
        setSelectedNote(newNote);
        fetchItemsAndCounts(); // Refetch list after creating note
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handler for Tag Manager Dialog open state change
  const handleTagManagerOpenChange = (open: boolean) => {
    if (open) {
      onTagManagerOpen();
    } else {
      onTagManagerClose();
    }
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

        {(titleFilter || typeFilter !== "all" || selectedTagIds.length > 0) && (
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
                Type: {typeFilter === "notes" ? "Notes" : "Tasks"}
              </Badge>
            )}

            {selectedTagIds.length > 0 && <TagBadges tagIds={selectedTagIds} onRemove={handleTagClick} size="sm" />}

            <Button
              size="xs"
              onClick={() => {
                setTitleFilter("");
                setTypeFilter("all");
                setSelectedTagIds([]);
              }}
            >
              Clear filters
            </Button>
          </Flex>
        )}

        <Flex justifyContent="space-between">
          <Box>
            <Button
              onClick={() => {
                setStatusFilter("open");
              }}
            >
              Open
              <Text color="gray.600" bg="gray.100" px={2} borderRadius="md">
                {openCount}
              </Text>
            </Button>
            <Button
              onClick={() => {
                setStatusFilter("closed");
              }}
            >
              Closed
              <Text color="gray.600" bg="gray.100" px={2} borderRadius="md">
                {closedCount}
              </Text>
            </Button>
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
                <Menu.RadioItemGroup value={typeFilter} onValueChange={(e) => setTypeFilter(e.value)}>
                  <Menu.RadioItem value="all" key="all" _checked={{ fontWeight: "bold" }}>
                    All Items
                  </Menu.RadioItem>
                  <Menu.RadioItem value="notes" key="notes" _checked={{ fontWeight: "bold" }}>
                    Notes
                  </Menu.RadioItem>
                  <Menu.RadioItem value="tasks" key="tasks" _checked={{ fontWeight: "bold" }}>
                    Tasks
                  </Menu.RadioItem>
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
        <Box borderWidth="1px" borderRadius="md" overflow="hidden" borderTopRadius={0}>
          {isLoading ? (
            <Flex justify="center" py={8} color="gray.500">Loading...</Flex>
          ) : items.length === 0 ? (
            <Flex justify="center" py={8} color="gray.500">
              No items match your filters
            </Flex>
          ) : (
            items.map((item) => (
              <ListItem 
                item={item} 
                key={item.id} 
                refetchList={fetchItemsAndCounts} // Pass refetch function
              />
            ))
          )}
        </Box>

        {/* Pagination Controls */} 
        <Flex justify="space-between" align="center" mt={4} mb={8}>
          <Button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </Flex>

      </Container>

      {/* Render Tag Manager Dialog */}
      <TagManagerDialog isOpen={isTagManagerOpen} onOpenChange={handleTagManagerOpenChange} />
    </>
  );
}

const ListItem = ({ item, refetchList }: { item: ListItem; refetchList: () => void }) => {
  const { tasks, setModalTask, updateTask } = useTasks();
  const { notes, setSelectedNote } = useNotes();
  const [isHovered, setIsHovered] = useState(false);

  // Needs adjustment based on how updates should trigger list refresh
  const handleTaskStatusChange = async (taskId: string, newStatus: boolean, refetch: () => void) => {
    // Find original task data (if needed for update payload)
    // This might require fetching task details if not available in ListItem
    // For now, assume we only need ID and new status for the update
    try {
      // Option 1: Update the specific task collection
      await pb.collection('task').update(taskId, { status: newStatus });
      refetch(); // Call the passed refetch function
    } catch (error) {
      console.error("Error updating task status:", error);
      // Handle error
    }

    // Old logic using context (might still be relevant if context drives other UI)
    // const task = tasks.find((t) => t.id === taskId);
    // if (task) {
    //   await updateTask(task.id, {
    //     ...task,
    //     status: newStatus,
    //   });
    // }
  };

  // Handle item click - open appropriate popup
  const handleItemClick = async (item: ListItem) => { // Make async
    if (item.isTask) { // Use isTask flag again
      // Try finding task in context cache first
      let task = tasks.find((t) => t.id === item.id);
      if (task) {
        setModalTask(task);
      } else {
        // If not in cache, fetch full task details from API
        console.warn("Task details not found in context cache for ID:", item.id, "Fetching from API...");
        try {
          const fetchedRecord = await pb.collection('task').getOne(item.id); // Fetch raw record
          if (fetchedRecord) {
             const fetchedTask = convertTaskRecordToTask(fetchedRecord); // Convert to Task type
             setModalTask(fetchedTask);
          }
        } catch (error) {
          console.error("Error fetching task details:", error);
          // Handle error (e.g., show toast)
          // Optionally setModalTask(null) if needed
        }
      }
    } else { // Assuming type is 'note'
      // Try finding note in context cache first
      let note = notes.find((n) => n.id === item.id);
      if (note) {
        setSelectedNote(note);
      } else {
        // If not in cache, fetch full note details from API
        console.warn("Note details not found in context cache for ID:", item.id, "Fetching from API...");
        try {
          const fetchedRecord = await pb.collection('note').getOne(item.id); // Fetch raw record
          if (fetchedRecord) {
            const fetchedNote = convertNoteRecordToNote(fetchedRecord); // Convert to Note type
            setSelectedNote(fetchedNote);
          }
        } catch (error) {
          console.error("Error fetching note details:", error);
          // Handle error (e.g., show toast)
          // Optionally setSelectedNote(null) if needed
        }
      }
    }
  };

  return (
    <Grid
      templateColumns="20px 1fr 80px 150px"
      gap={4}
      px={4}
      py={2}
      borderBottom="1px solid"
      borderColor="gray.200"
      _hover={{ bg: "gray.50" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      alignItems="center"
    >
      <GridItem>
        {item.isTask ? (
          <TaskCheckbox
            checked={item.status}
            onChange={(e) => handleTaskStatusChange(item.id, e, refetchList)} // Pass refetch
            onClick={(e) => e.stopPropagation()}
            colorScheme={item.status ? "green" : "gray"}
          />
        ) : (
          <Icon as={FaBook} color="blue.500" boxSize={5} />
        )}
      </GridItem>
      <GridItem>
        <Flex>
          <TitlePreview
            title={item.title}
            onClick={() => handleItemClick(item)}
            lineThrough={item.status}
            contrast={isHovered ? "dark" : "bright"}
            mr={2}
            _hover={{ textDecoration: "underline", cursor: "pointer" }}
          />
          {item.tags.length > 0 && (
            <Box mt={1}>
              <TagBadges tagIds={item.tags} size="sm" />
            </Box>
          )}
        </Flex>
        <Text color="gray.600" fontSize="xs">
          Created {formatDate(item.created)}
        </Text>
      </GridItem>
      <GridItem>
        {item.user?.length > 1 && <Icon as={FaUserFriends} color="green.500" boxSize={5} aria-label="Shared with others" />}
      </GridItem>
      <GridItem color="gray.600">{}</GridItem>
    </Grid>
  );
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return `today`;
  } else if (diffInDays === 1) {
    return `yesterday`;
  } else if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};
