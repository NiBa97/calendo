import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Flex, Heading, Input, Button, HStack, VStack, Text, Badge, Icon, Table, Menu } from "@chakra-ui/react";
import {
  FaSearch,
  FaFilter,
  FaTags,
  FaCaretDown,
  FaCircle,
  FaCheckCircle,
  FaBook,
  FaCheckSquare,
  FaUserFriends,
  FaLock,
} from "react-icons/fa";
import { useNotes } from "../contexts/note-context";
import { useTasks } from "../contexts/task-context";
import { useTags } from "../contexts/tag-context";
import { TagBadges } from "../components/tag-selector";
import { InputGroup } from "../components/ui/input-group";
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItemGroup,
  MenuRadioItem,
  MenuRadioItemGroup,
} from "../components/ui/menu";

// Combined type for list items (notes and tasks)
type ListItem = {
  id: string;
  title: string;
  isTask: boolean;
  status?: boolean;
  created: Date;
  updated?: Date;
  tags: string[];
  shared: boolean;
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
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    searchParams.get("tags") ? searchParams.get("tags")!.split(",") : []
  );

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
    console.log(tasks);
    const noteItems: ListItem[] = notes.map((note) => ({
      id: note.id,
      title: note.title || "Untitled Note",
      isTask: false,
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
      created: task.startDate ? new Date(task.startDate) : new Date(),
      updated: task.endDate ? new Date(task.endDate) : undefined,
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

      // Filter by status (for tasks only)
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && (!item.isTask || !item.status)) ||
        (statusFilter === "closed" && item.isTask && item.status);

      // Filter by tags
      const matchesTags = selectedTagIds.length === 0 || selectedTagIds.some((tagId) => item.tags.includes(tagId));

      return matchesTitle && matchesType && matchesStatus && matchesTags;
    });
  }, [allItems, titleFilter, typeFilter, statusFilter, selectedTagIds]);

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

  // Handle creating new task from list page
  const handleCreateTask = () => {
    // Create an empty task in modal
    setModalTask({
      id: "",
      name: "New Task",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      isAllDay: false,
      status: false,
      user: [],
      tags: [],
    });
  };

  // Handle creating new note from list page
  const handleCreateNote = async () => {
    try {
      const data = {
        title: "New Note",
        content: "",
      };
      const newNote = await createNote(data);
      if (newNote?.id) {
        setSelectedNote(newNote);
      }
    } catch (error) {
      console.log(error);
    }
    // Create an empty note and open in dialog
  };

  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="lg">All Items</Heading>
        <HStack>
          <Button colorScheme="blue" onClick={handleCreateNote}>
            <Icon as={FaBook} mr={2} />
            New Note
          </Button>
          <Button colorScheme="green" onClick={handleCreateTask}>
            <Icon as={FaCheckSquare} mr={2} />
            New Task
          </Button>
        </HStack>
      </Flex>

      {/* Filters */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={6}
        p={3}
        bg="gray.50"
        borderRadius="md"
        flexWrap="wrap"
      >
        <InputGroup endElement={<FaSearch />} flex={{ base: "1", md: "2" }}>
          <Input
            placeholder="Filter by title..."
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            bg="white"
          />
        </InputGroup>

        <MenuRoot>
          <MenuTrigger asChild>
            <Button variant="outline">
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
            <Button variant="outline">
              <Flex align="center">
                <Icon as={statusFilter === "closed" ? FaCheckCircle : FaCircle} mr={2} />
                {statusFilter === "all" ? "All Status" : statusFilter === "open" ? "Open" : "Closed"}
                <Icon as={FaCaretDown} ml={2} />
              </Flex>
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItemGroup title="Status">
              <MenuRadioItemGroup value={statusFilter} onValueChange={(e) => setStatusFilter(e.value)}>
                <MenuRadioItem value="all" _checked={{ fontWeight: "bold" }}>
                  All Status
                </MenuRadioItem>
                <MenuRadioItem value="open" _checked={{ fontWeight: "bold" }}>
                  Open
                </MenuRadioItem>
                <MenuRadioItem value="closed" _checked={{ fontWeight: "bold" }}>
                  Closed
                </MenuRadioItem>
              </MenuRadioItemGroup>
            </MenuItemGroup>
          </MenuContent>
        </MenuRoot>

        <MenuRoot>
          <MenuTrigger asChild>
            <Button variant="outline">
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
      </Flex>

      {/* Active filters display */}
      {(titleFilter || typeFilter !== "all" || statusFilter !== "all" || selectedTagIds.length > 0) && (
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

          {statusFilter !== "all" && (
            <Badge
              colorScheme={statusFilter === "closed" ? "green" : "yellow"}
              borderRadius="full"
              px={2}
              display="flex"
              alignItems="center"
            >
              Status: {statusFilter === "closed" ? "Closed" : "Open"}
            </Badge>
          )}

          {selectedTagIds.length > 0 && <TagBadges tagIds={selectedTagIds} onRemove={handleTagClick} size="sm" />}

          <Button
            size="xs"
            onClick={() => {
              setTitleFilter("");
              setTypeFilter("all");
              setStatusFilter("all");
              setSelectedTagIds([]);
            }}
          >
            Clear filters
          </Button>
        </Flex>
      )}

      {/* Results count */}
      <Text mb={4} color="gray.600">
        {sortedItems.length} item{sortedItems.length !== 1 ? "s" : ""} found
      </Text>

      {/* List */}
      <Box borderWidth="1px" borderRadius="md" overflow="hidden">
        <Table.Root interactive>
          <Table.ColumnGroup>
            <Table.Column w="1" />
            <Table.Column />
            <Table.Column w="80px" />
            <Table.Column w="200px" />
          </Table.ColumnGroup>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader>Title</Table.ColumnHeader>
              <Table.ColumnHeader>Shared</Table.ColumnHeader>
              <Table.ColumnHeader>Created</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedItems.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <Flex justify="center" py={8} color="gray.500">
                    No items match your filters
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ) : (
              sortedItems.map((item) => (
                <Table.Row
                  key={item.id}
                  _hover={{ bg: "gray.50" }}
                  cursor="pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <Table.Cell>
                    {item.isTask ? (
                      <Icon
                        as={item.status ? FaCheckCircle : FaCircle}
                        color={item.status ? "green.500" : "yellow.500"}
                        boxSize={5}
                      />
                    ) : (
                      <Icon as={FaBook} color="blue.500" boxSize={5} />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex direction="column">
                      <Text fontWeight="medium" color="black">
                        {item.title}
                      </Text>
                      {item.tags.length > 0 && (
                        <Box mt={1}>
                          <TagBadges tagIds={item.tags} size="sm" />
                        </Box>
                      )}
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    {item.shared ? (
                      <Icon as={FaUserFriends} color="green.500" boxSize={5} aria-label="Shared with others" />
                    ) : (
                      <Icon as={FaLock} color="gray.400" boxSize={5} aria-label="Not shared" />
                    )}
                  </Table.Cell>
                  <Table.Cell color="gray.600">{formatDate(item.created)}</Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}
