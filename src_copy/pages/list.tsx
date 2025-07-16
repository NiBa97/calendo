import {
  Container,
  Flex,
  Heading,
  Spacer,
  useDisclosure,
} from "@chakra-ui/react";
import { useNotes } from "../contexts/note-context";
import { TagManagerDialog } from "../components/tag-manager-dialog";
import { useListFilters } from "../hooks/useListFilters";
import { usePinnedQueries } from "../hooks/usePinnedQueries";
import { PinnedQueriesSection } from "../components/pinned-queries-section";
import { FilterControls } from "../components/filter-controls";
import { ListItem } from "../components/list-item";
import { useIsMobile } from "../utils/responsive";
import { useTasks } from "../features/tasks/contexts/task-context";

export default function List() {
  const { notes, createNote, setSelectedNote } = useNotes();
  const { tasks, setModalTask } = useTasks();
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

  return (
    <>
      <Container
        p={isMobile ? 2 : 4}
        maxW={isMobile ? "100vw" : "3xl"}
        mx={isMobile ? 0 : "auto"}
        w={isMobile ? "100vw" : "3xl"}
      >
        <Heading size={isMobile ? "md" : "lg"} mb={4}>All Items</Heading>

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
