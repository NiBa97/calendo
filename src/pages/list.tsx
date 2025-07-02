import {
  Container,
  Flex,
  Heading,
  Spacer,
  useDisclosure,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Badge,
  Icon,
  Center,
  Grid,
  GridItem,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { useNotes } from "../contexts/note-context";
import { useTasks } from "../contexts/task-context";
import { TagManagerDialog } from "../components/tag-manager-dialog";
import { useListFilters } from "../hooks/useListFilters";
import { usePinnedQueries } from "../hooks/usePinnedQueries";
import { PinnedQueriesSection } from "../components/pinned-queries-section";
import { FilterControls } from "../components/filter-controls";
import { ListItem } from "../components/list-item";
import { useIsMobile } from "../utils/responsive";
import { useState, useEffect } from "react";
import React from "react";
import {
  MdAdd,
  MdMoreHoriz,
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdSchedule,
  MdWarning,
  MdTask,
  MdNote,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
  MdLocalOffer,
} from "react-icons/md";
import { Task, Note } from "../types";
import TaskContextMenu from "../components/task-contextmenu";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { TagBadges } from "../components/ui/tag-badges";
import { useTags } from "../contexts/tag-context";

type ListItem = (Task | Note) & { itemType: "task" | "note" };

const priorityColors = {
  high: "red",
  medium: "yellow",
  low: "green",
};

const statusColors = {
  pending: "gray",
  "in-progress": "blue",
  completed: "green",
};

export default function List() {
  const { notes, createNote, setSelectedNote, updateNote } = useNotes();
  const { tasks, setModalTask, updateTask, setContextInformation } = useTasks();
  const isMobile = useIsMobile();

  // Custom hooks for state management
  const filterHook = useListFilters(notes, tasks);
  const {
    titleFilter,
    typeFilter,
    statusFilter,
    selectedTagIds,
    sortedItems,
    handleTagClick,
    clearFilters,
    getCurrentFilters,
    applyFilters,
    setTitleFilter,
    setTypeFilter,
    setStatusFilter,
  } = filterHook;

  const { pinnedQueries, addPinnedQuery, deletePinnedQuery } = usePinnedQueries();

  // State for Tag Manager Dialog
  const { open: isTagManagerOpen, onOpen: onTagManagerOpen, onClose: onTagManagerClose } = useDisclosure();

  // New state for enhanced list view
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"enhanced" | "legacy">("enhanced");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Enhanced list data preparation
  const allItems: ListItem[] = [
    ...tasks.map(task => ({ ...task, itemType: "task" as const })),
    ...notes.map(note => ({ ...note, itemType: "note" as const }))
  ];

  // Enhanced filtering logic
  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && item.status) ||
      (filter === "pending" && !item.status) ||
      (filter === "tasks" && item.itemType === "task") ||
      (filter === "notes" && item.itemType === "note");

    // Apply legacy status filter logic (open/closed) if statusFilter is set
    const matchesStatusFilter = 
      statusFilter === "all" || 
      (statusFilter === "open" && !item.status) ||
      (statusFilter === "closed" && item.status);

    // Apply tag filter from legacy view
    const matchesTagFilter = 
      selectedTagIds.length === 0 || 
      selectedTagIds.some(tagId => item.tags.includes(tagId));

    return matchesSearch && matchesFilter && matchesStatusFilter && matchesTagFilter;
  }).sort((a, b) => {
    // Sort by creation date, newest first
    const dateA = new Date(a.created).getTime();
    const dateB = new Date(b.created).getTime();
    return dateB - dateA;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter, statusFilter, selectedTagIds]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));

  // Bulk selection handlers
  const handleItemCheck = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Batch operations
  const handleBulkComplete = async () => {
    const promises = selectedItems.map(async (itemId) => {
      const item = allItems.find(i => i.id === itemId);
      if (!item) return;

      if (item.itemType === "task") {
        return updateTask(itemId, { status: true });
      } else {
        return updateNote(itemId, { status: true });
      }
    });

    await Promise.all(promises);
    setSelectedItems([]);
  };

  const handleBulkDelete = async () => {
    // Implementation would depend on your delete functions
    setSelectedItems([]);
  };

  // Delete single item
  const handleDeleteItem = async (item: ListItem) => {
    // Implementation would depend on your delete functions
    console.log("Delete item:", item.id);
  };

  // Date formatting
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `In ${diffDays} days`;
  };

  const isOverdue = (item: ListItem) => {
    if (item.itemType === "note") return false;
    const task = item as Task;
    if (!task.endDate) return false;
    const date = new Date(task.endDate);
    const now = new Date();
    return date < now && !task.status;
  };

  const getItemPriority = (item: ListItem): "high" | "medium" | "low" => {
    if (item.itemType === "note") return "low";
    // For tasks, you might want to add priority field to Task type
    // For now, using a simple heuristic based on due date
    if (isOverdue(item)) return "high";
    const task = item as Task;
    if (task.endDate) {
      const daysUntilDue = Math.ceil((new Date(task.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) return "high";
      if (daysUntilDue <= 7) return "medium";
    }
    return "low";
  };

  const getItemStatus = (item: ListItem): "pending" | "completed" => {
    return item.status ? "completed" : "pending";
  };

  // Simple visual priority for tasks
  const getVisualPriority = (item: ListItem) => {
    if (item.itemType === "task") {
      const task = item as Task;
      
      if (task.status) return null; // Don't show priority for completed tasks

      if (!task.endDate) return null; // No priority for unscheduled tasks

      const now = new Date();
      const dueDate = new Date(task.endDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "red.500"; // Overdue
      if (diffDays === 0) return "orange.500"; // Due today
      if (diffDays === 1) return "yellow.500"; // Due tomorrow

      return null; // Future tasks don't need visual priority
    }

    return null; // Notes don't have priority
  };

  // Apple-style time display
  const getAppleTimeDisplay = (item: ListItem) => {
    if (item.itemType === "task") {
      const task = item as Task;
      
      if (task.status) return null;
      if (!task.endDate) return null;

      const now = new Date();
      const dueDate = new Date(task.endDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        const overdueDays = Math.abs(diffDays);
        return `${overdueDays}d overdue`;
      }

      if (diffDays === 0) return "today";
      if (diffDays === 1) return "tomorrow";
      if (diffDays <= 7) return `${diffDays}d`;
      
      return dueDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } else {
      // For notes - show last activity
      const note = item as Note;
      const lastUpdate = note.updated || note.created;
      const now = new Date();
      const diffTime = now.getTime() - new Date(lastUpdate).getTime();
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffHours < 1) return "now";
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays === 1) return "1d";
      if (diffDays < 7) return `${diffDays}d`;
      
      return new Date(lastUpdate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Context menu handler
  const onContextMenu = (item: ListItem, event: React.MouseEvent) => {
    event.preventDefault();
    if (item.itemType === "task") {
      setContextInformation({ x: event.clientX, y: event.clientY, task: item as Task });
    }
    // For notes, you might want to implement a similar context menu system
  };

  // Handle creating new task from list page
  const handleCreateTask = () => {
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

  // Handler for applying pinned queries
  const handleApplyPinnedQuery = (query: typeof pinnedQueries[0]) => {
    applyFilters(query.filters);
  };

  const cardBg = "white";
  const textColor = "gray.900";
  const mutedColor = "gray.600";
  const borderColor = "gray.200";

  if (viewMode === "legacy") {
    return (
      <>
        <Container
          p={isMobile ? 2 : 4}
          maxW={isMobile ? "100vw" : "3xl"}
          mx={isMobile ? 0 : "auto"}
          w={isMobile ? "100vw" : "3xl"}
        >
          <HStack justify="space-between" mb={4}>
            <Heading size={isMobile ? "md" : "lg"}>All Items</Heading>
            <Button size="sm" onClick={() => setViewMode("enhanced")}>
              Enhanced View
            </Button>
          </HStack>

          <PinnedQueriesSection
            pinnedQueries={pinnedQueries}
            onAddQuery={addPinnedQuery}
            onDeleteQuery={deletePinnedQuery}
            onApplyQuery={handleApplyPinnedQuery}
            currentFilters={getCurrentFilters()}
          />

          <FilterControls
            titleFilter={titleFilter}
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            selectedTagIds={selectedTagIds}
            sortedItems={sortedItems}
            onTitleFilterChange={setTitleFilter}
            onTypeFilterChange={setTypeFilter}
            onStatusFilterChange={setStatusFilter}
            onTagClick={handleTagClick}
            onClearFilters={clearFilters}
            onCreateNote={handleCreateNote}
            onCreateTask={handleCreateTask}
            onTagManagerOpen={onTagManagerOpen}
          />
          <Spacer h={2} />
          <Flex gap={2} direction="column" overflow="hidden" >
            {sortedItems.length === 0 ? (
              <Flex justify="center" py={8} color="gray.500">
                No items match your filters
              </Flex>
            ) : (
              sortedItems
                .filter((item) => item.status === (statusFilter === "open" ? false : true))
                .map((item) => <ListItem item={item} key={item.id} onTagClick={handleTagClick} />)
            )}
          </Flex>
        </Container>

        {/* Render Tag Manager Dialog */}
        <TagManagerDialog isOpen={isTagManagerOpen} onOpenChange={handleTagManagerOpenChange} />
      </>
    );
  }

  return (
    <>
      <Container
        p={isMobile ? 2 : 4}
        maxW={isMobile ? "100vw" : "6xl"}
        mx={isMobile ? 0 : "auto"}
        w={isMobile ? "100vw" : "6xl"}
      >
        <VStack gap={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                All Items
              </Text>
              <Text color={mutedColor}>
                Manage your tasks and notes efficiently
              </Text>
            </Box>
            <HStack>
              <Button size="sm" variant="outline" onClick={() => setViewMode("legacy")}>
                Legacy View
              </Button>
              <Button
                bg="linear-gradient(135deg, #8b5cf6, #a855f7)"
                color="white"
                _hover={{
                  bg: "linear-gradient(135deg, #7c3aed, #9333ea)",
                }}
                onClick={handleCreateTask}
              >
                <Icon as={MdAdd} />
                New Task
              </Button>
              <Button
                bg="linear-gradient(135deg, #059669, #10b981)"
                color="white"
                _hover={{
                  bg: "linear-gradient(135deg, #047857, #059669)",
                }}
                onClick={handleCreateNote}
              >
                <Icon as={MdAdd} />
                New Note
              </Button>
            </HStack>
          </HStack>

          {/* Pinned Queries from Legacy View */}
          <PinnedQueriesSection
            pinnedQueries={pinnedQueries}
            onAddQuery={addPinnedQuery}
            onDeleteQuery={deletePinnedQuery}
            onApplyQuery={handleApplyPinnedQuery}
            currentFilters={getCurrentFilters()}
          />

          {/* Filters and Search */}
          <Card bg={cardBg}>
            <HStack justify="space-between" align="center">
              <HStack gap={4} flex="1">
                <Input
                  placeholder="🔍 Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  maxW="64"
                  flex="1"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Items</option>
                  <option value="tasks">Tasks Only</option>
                  <option value="notes">Notes Only</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>

              </HStack>

              <HStack gap={2}>
                {/* Tag Manager and Clear Filters */}
                <Button size="sm" variant="outline" onClick={onTagManagerOpen}>
                  <Icon as={MdLocalOffer} />
                  Tags
                </Button>
                {(selectedTagIds.length > 0 || searchTerm || filter !== "all" || statusFilter !== "all") && (
                  <Button size="sm" variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                
                {selectedItems.length > 0 && (
                  <>
                    <Text fontSize="sm" color={mutedColor}>
                      {selectedItems.length} selected
                    </Text>
                    <Button size="sm" variant="outline" onClick={handleBulkComplete}>
                      Mark Complete
                    </Button>
                    <Button size="sm" variant="outline" colorScheme="red" onClick={handleBulkDelete}>
                      Delete
                    </Button>
                  </>
                )}
              </HStack>
            </HStack>
          </Card>

          {/* Active Filters Display */}
          {selectedTagIds.length > 0 && (
            <Card bg={cardBg}>
              <Box px={4} py={3}>
                <HStack gap={2} wrap="wrap">
                  <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                    Filtered by tags:
                  </Text>
                  <TagBadges 
                    tagIds={selectedTagIds} 
                    size="sm" 
                    onClick={handleTagClick}
                  />
                </HStack>
              </Box>
            </Card>
          )}

          {/* Items List */}
          <Card bg={cardBg}>
            {/* Header */}
            <Box px={6} py={4} borderBottom="1px" borderColor={borderColor}>
              <HStack>
                <Checkbox
                  checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  mr={4}
                />
                <Grid
                  templateColumns={isMobile ? "1fr" : "1fr auto"}
                  gap={4}
                  flex="1"
                  fontSize="sm"
                  fontWeight="medium"
                  color={mutedColor}
                >
                  {!isMobile && (
                    <>
                      <GridItem>Items</GridItem>
                      <GridItem></GridItem>
                    </>
                  )}
                  {isMobile && <GridItem>Items</GridItem>}
                </Grid>
              </HStack>
            </Box>

            {/* Items */}
            <VStack gap={0} align="stretch">
              {paginatedItems.map((item) => (
                <EnhancedListItem
                  key={item.id}
                  item={item}
                  isSelected={selectedItems.includes(item.id)}
                  onCheck={handleItemCheck}
                  onEdit={(item) => {
                    if (item.itemType === "task") {
                      setModalTask(item as Task);
                    } else {
                      setSelectedNote(item as Note);
                    }
                  }}
                  onDelete={handleDeleteItem}
                  onContextMenu={onContextMenu}
                  textColor={textColor}
                  mutedColor={mutedColor}
                  borderColor={borderColor}
                  getItemPriority={getItemPriority}
                  getVisualPriority={getVisualPriority}
                  getAppleTimeDisplay={getAppleTimeDisplay}
                  isMobile={isMobile}
                />
              ))}
            </VStack>

            {/* Pagination */}
            {filteredItems.length > itemsPerPage && (
              <Box px={6} py={4} borderTop="1px" borderColor={borderColor}>
                <HStack justify="space-between" align="center">
                  <HStack gap={2}>
                    <Text fontSize="sm" color={mutedColor}>
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
                    </Text>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <Text fontSize="sm" color={mutedColor}>per page</Text>
                  </HStack>

                  <HStack gap={1}>
                    <IconButton
                      aria-label="First page"
                      variant="ghost"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                    >
                      <Icon as={MdFirstPage} />
                    </IconButton>
                    <IconButton
                      aria-label="Previous page"
                      variant="ghost"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <Icon as={MdChevronLeft} />
                    </IconButton>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "solid" : "ghost"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          colorScheme={currentPage === pageNum ? "blue" : undefined}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <IconButton
                      aria-label="Next page"
                      variant="ghost"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <Icon as={MdChevronRight} />
                    </IconButton>
                    <IconButton
                      aria-label="Last page"
                      variant="ghost"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                    >
                      <Icon as={MdLastPage} />
                    </IconButton>
                  </HStack>
                </HStack>
              </Box>
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <Center py={12}>
                <VStack gap={4}>
                  <Box
                    w={16}
                    h={16}
                    bg="gray.100"
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={MdCalendarToday} boxSize={8} color={mutedColor} />
                  </Box>
                  <VStack gap={2}>
                    <Text fontSize="lg" fontWeight="medium" color={textColor}>
                      No items found
                    </Text>
                    <Text color={mutedColor} textAlign="center">
                      {searchTerm
                        ? "Try adjusting your search criteria"
                        : "Get started by creating your first task or note"}
                    </Text>
                  </VStack>
                  <HStack>
                    <Button
                      bg="linear-gradient(135deg, #8b5cf6, #a855f7)"
                      color="white"
                      _hover={{
                        bg: "linear-gradient(135deg, #7c3aed, #9333ea)",
                      }}
                      onClick={handleCreateTask}
                    >
                      <Icon as={MdAdd} />
                      Create Task
                    </Button>
                    <Button
                      bg="linear-gradient(135deg, #059669, #10b981)"
                      color="white"
                      _hover={{
                        bg: "linear-gradient(135deg, #047857, #059669)",
                      }}
                      onClick={handleCreateNote}
                    >
                      <Icon as={MdAdd} />
                      Create Note
                    </Button>
                  </HStack>
                </VStack>
              </Center>
            )}
          </Card>
        </VStack>
      </Container>

      {/* Render Tag Manager Dialog */}
      <TagManagerDialog isOpen={isTagManagerOpen} onOpenChange={handleTagManagerOpenChange} />

      {/* Context Menu */}
      <TaskContextMenu />
    </>
  );
}

const EnhancedListItem = ({
  item,
  isSelected,
  onCheck,
  onEdit,
  onDelete,
  onContextMenu,
  textColor,
  mutedColor,
  borderColor,
  getItemPriority,
  getVisualPriority,
  getAppleTimeDisplay,
  isMobile,
}: {
  item: ListItem;
  isSelected: boolean;
  onCheck: (itemId: string, checked: boolean) => void;
  onEdit: (item: ListItem) => void;
  onDelete: (item: ListItem) => void;
  onContextMenu: (item: ListItem, event: React.MouseEvent) => void;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  getItemPriority: (item: ListItem) => "high" | "medium" | "low";
  getVisualPriority: (item: ListItem) => string | null;
  getAppleTimeDisplay: (item: ListItem) => string | null;
  isMobile: boolean;
}) => {
  const priority = getItemPriority(item);

  return (
    <Box
      px={6}
      py={4}
      borderBottom="1px"
      borderColor={borderColor}
      _hover={{
        bg: "gray.25",
      }}
      _last={{ borderBottom: "none" }}
      cursor="pointer"
      onClick={() => onEdit(item)}
      onContextMenu={(event) => onContextMenu(item, event)}
      role="group"
      transition="all 0.2s ease"
    >
      <HStack>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => {
            onCheck(item.id, !!checked);
          }}
          mr={4}
        />

        {isMobile ? (
          <VStack align="stretch" flex="1" gap={3}>
            {/* Simple Mobile Layout */}
            <HStack gap={3} align="center" w="full">
              {/* Type Icon + Title */}
              <HStack gap={2} flex="1" align="center">
                <Icon
                  as={item.itemType === "task" ? MdTask : MdNote}
                  color={item.itemType === "task" ? "blue.500" : "green.500"}
                  boxSize={4}
                  flexShrink={0}
                />

                <Text
                  fontWeight="medium"
                  color={textColor}
                  fontSize="md"
                  opacity={item.status ? 0.6 : 1}
                  textDecoration={item.status ? "line-through" : "none"}
                  flex="1"
                  lineClamp={1}
                >
                  {item.title}
                </Text>

                {/* Completed checkmark */}
                {item.status && (
                  <Icon as={MdCheckCircle} color="green.500" boxSize={4} />
                )}

                {/* Mobile Actions */}
                <HStack gap={1} opacity={0.6}>
                  <IconButton
                    aria-label="Edit item"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    <Icon as={MdEdit} boxSize={4} />
                  </IconButton>
                  <IconButton
                    aria-label="Delete item"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item);
                    }}
                  >
                    <Icon as={MdDelete} boxSize={4} color="red.500" />
                  </IconButton>
                </HStack>
              </HStack>

              {/* Time */}
              {(() => {
                const timeDisplay = getAppleTimeDisplay(item);
                return timeDisplay ? (
                  <Text
                    fontSize="sm"
                    color={
                      timeDisplay.includes("overdue") ? "red.500" :
                      timeDisplay === "today" ? "orange.500" :
                      timeDisplay === "tomorrow" ? "yellow.600" :
                      "gray.500"
                    }
                    fontWeight={
                      timeDisplay.includes("overdue") || timeDisplay === "today" 
                        ? "medium" 
                        : "normal"
                    }
                    flexShrink={0}
                  >
                    {timeDisplay}
                  </Text>
                ) : null;
              })()}
            </HStack>

            {/* Description */}
            {((item.itemType === "task" && (item as Task).description) ||
              (item.itemType === "note" && (item as Note).content)) && (
              <Text
                fontSize="sm"
                color="gray.600"
                lineClamp={2}
                pl={6} // Align with title
              >
                {item.itemType === "task"
                  ? (item as Task).description
                  : (item as Note).content?.substring(0, 100)}
              </Text>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <Box pl={6}>
                <TagBadges tagIds={item.tags.slice(0, 4)} size="sm" />
                {item.tags.length > 4 && (
                  <Badge variant="subtle" colorScheme="gray" fontSize="xs" ml={2}>
                    +{item.tags.length - 4}
                  </Badge>
                )}
              </Box>
            )}
          </VStack>
        ) : (
          <Grid
            templateColumns="1fr auto"
            gap={6}
            flex="1"
            alignItems="center"
          >
            {/* Main Content - Simple & Clean */}
            <GridItem>
              <VStack align="start" gap={2}>
                {/* Title Row */}
                <HStack gap={3} align="center" w="full">
                  {/* Type Icon */}
                  <Icon
                    as={item.itemType === "task" ? MdTask : MdNote}
                    color={item.itemType === "task" ? "blue.500" : "green.500"}
                    boxSize={4}
                    flexShrink={0}
                  />

                  {/* Title */}
                  <Text
                    fontWeight="medium"
                    color={textColor}
                    fontSize="md"
                    opacity={item.status ? 0.6 : 1}
                    textDecoration={item.status ? "line-through" : "none"}
                    flex="1"
                  >
                    {item.title}
                  </Text>

                  {/* Completed checkmark */}
                  {item.status && (
                    <Icon as={MdCheckCircle} color="green.500" boxSize={4} />
                  )}

                  {/* Time */}
                  {(() => {
                    const timeDisplay = getAppleTimeDisplay(item);
                    return timeDisplay ? (
                      <Text
                        fontSize="sm"
                        color={
                          timeDisplay.includes("overdue") ? "red.500" :
                          timeDisplay === "today" ? "orange.500" :
                          timeDisplay === "tomorrow" ? "yellow.600" :
                          "gray.500"
                        }
                        fontWeight={
                          timeDisplay.includes("overdue") || timeDisplay === "today" 
                            ? "medium" 
                            : "normal"
                        }
                        flexShrink={0}
                      >
                        {timeDisplay}
                      </Text>
                    ) : null;
                  })()}
                </HStack>

                {/* Description */}
                {((item.itemType === "task" && (item as Task).description) ||
                  (item.itemType === "note" && (item as Note).content)) && (
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    lineClamp={1}
                    pl={7} // Align with title (icon width + gap)
                  >
                    {item.itemType === "task"
                      ? (item as Task).description
                      : (item as Note).content?.substring(0, 120)}
                  </Text>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <Box pl={7}>
                    <TagBadges tagIds={item.tags} size="sm" />
                  </Box>
                )}
              </VStack>
            </GridItem>

            {/* Actions */}
            <GridItem>
              <HStack gap={0} opacity={0.4} _groupHover={{ opacity: 1 }}>
                <IconButton
                  aria-label="Edit item"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                >
                  <Icon as={MdEdit} boxSize={4} />
                </IconButton>
                <IconButton
                  aria-label="Delete item"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item);
                  }}
                >
                  <Icon as={MdDelete} boxSize={4} color="red.500" />
                </IconButton>
              </HStack>
            </GridItem>
          </Grid>
        )}
      </HStack>
    </Box>
  );
};
