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
  Grid,
  GridItem,
  Container,
  IconButton,
} from "@chakra-ui/react";
import { FaSearch, FaFilter, FaTags, FaCaretDown, FaBook, FaCheckSquare, FaUserFriends, FaStar, FaTrash, FaPlus } from "react-icons/fa";
import { useNotes } from "../contexts/note-context";
import { useTasks } from "../contexts/task-context";
import { useTags } from "../contexts/tag-context";
import { TagBadges } from "../components/tag-selector";
import { InputGroup } from "../components/ui/input-group";
import { MenuRoot, MenuTrigger, MenuContent } from "../components/ui/menu";
import TaskCheckbox from "../components/ui/task-checkbox";
import TitlePreview from "../components/ui/title-preview";
import React from 'react';

// Combined type for list items (notes and tasks)
type ListItem = {
  id: string;
  title: string;
  isTask: boolean;
  status?: boolean;
  created: Date;
  updated?: Date;
  dueDate?: Date;
  tags: string[];
  shared: boolean;
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
  const { notes } = useNotes();
  const { tasks, setModalTask } = useTasks();
  const { createNote, setSelectedNote } = useNotes();
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
  }, [titleFilter, typeFilter, statusFilter, selectedTagIds, setSearchParams]);

  // Convert notes and tasks to a unified list item format
  const allItems = useMemo(() => {
    const noteItems: ListItem[] = notes.map((note) => ({
      id: note.id,
      title: note.title || "Untitled Note",
      isTask: false,
      status: note.status,
      created: note.created,
      updated: note.updated,
      tags: note.tags || [],
      shared: note.user?.length > 1 || false,
    }));

    const taskItems: ListItem[] = tasks.map((task) => ({
      id: task.id,
      title: task.name || "Untitled Task",
      isTask: true,
      status: task.status,
      created: task.created,
      dueDate: task.startDate ? new Date(task.startDate) : undefined,
      tags: task.tags || [],
      shared: task.user?.length > 1 || false,
    }));

    return [...noteItems, ...taskItems];
  }, [notes, tasks]);

  // Apply all filters
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Filter by title
      const matchesTitle = !titleFilter || item.title.toLowerCase().includes(titleFilter.toLowerCase());

      // Filter by type (note/task)
      const matchesType =
        typeFilter === "all" || (typeFilter === "notes" && !item.isTask) || (typeFilter === "tasks" && item.isTask);

      // Filter by tags
      const matchesTags = selectedTagIds.length === 0 || selectedTagIds.some((tagId) => item.tags.includes(tagId));

      return matchesTitle && matchesType && matchesTags;
    });
  }, [allItems, titleFilter, typeFilter, selectedTagIds]);

  // Sort by created date (changed from updated date)
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      return b.created.getTime() - a.created.getTime();
    });
  }, [filteredItems]);

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
      name: "New Task",
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
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
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
          <Button colorScheme="red" onClick={() => alert("not implemented")}>
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
              {sortedItems.filter((item) => item.status == false).length}
            </Text>
          </Button>
          <Button
            onClick={() => {
              setStatusFilter("closed");
            }}
          >
            Closed
            <Text color="gray.600" bg="gray.100" px={2} borderRadius="md">
              {sortedItems.filter((item) => item.status == true).length}
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
        {sortedItems.length === 0 ? (
          <Flex justify="center" py={8} color="gray.500">
            No items match your filters
          </Flex>
        ) : (
          sortedItems
            .filter((item) => item.status == (statusFilter == "open" ? false : true))
            .map((item) => <ListItem item={item} key={item.id}></ListItem>)
        )}
      </Box>
    </Container>
  );
}

const ListItem = ({ item }: { item: ListItem }) => {
  const { tasks, setModalTask, updateTask } = useTasks();
  const { notes, setSelectedNote } = useNotes();
  const [isHovered, setIsHovered] = useState(false);

  const handleTaskStatusChange = async (taskId: string, newStatus: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await updateTask(task.id, {
        ...task,
        status: newStatus,
      });
    }
  };

  // Handle item click - open appropriate popup
  const handleItemClick = (item: ListItem) => {
    if (item.isTask) {
      // Find the task object to open in modal
      const task = tasks.find((t) => t.id === item.id);
      if (task) {
        setModalTask(task);
      }
    } else {
      // Open note in dialog
      const note = notes.find((t) => t.id === item.id);
      if (note) {
        setSelectedNote(note);
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
            onChange={(e) => handleTaskStatusChange(item.id, e)}
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
        {item.shared && <Icon as={FaUserFriends} color="green.500" boxSize={5} aria-label="Shared with others" />}
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
