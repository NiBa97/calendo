import { useState, useEffect } from "react";
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
  Icon,
  Grid,
  GridItem,
  Container,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { FaSearch, FaFilter, FaTags, FaCaretDown, FaBook, FaCheckSquare, FaUserFriends } from "react-icons/fa";
import { getPb } from "../pocketbaseUtils";
import { TagBadges } from "../components/tag-selector";
import { InputGroup } from "../components/ui/input-group";
import { MenuRoot, MenuTrigger, MenuContent, MenuRadioItem, MenuRadioItemGroup } from "../components/ui/menu";
import TaskCheckbox from "../components/ui/task-checkbox";
import TitlePreview from "../components/ui/title-preview";
import { useTags } from "../contexts/tag-context";
import { toaster } from "./ui/toaster";

type TaskAndNoteItem = {
  id: string;
  type: "task" | "note";
  title: string;
  content: string;
  tags: string[];
  user: string[];
  created: string;
  updated: string;
  status: boolean;
  collectionId: string;
  collectionName: string;
};

export default function CombinedList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pb = getPb();
  const { tags } = useTags();

  // Pagination state
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [perPage, setPerPage] = useState(parseInt(searchParams.get("perPage") || "20"));
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Items state
  const [items, setItems] = useState<TaskAndNoteItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [titleFilter, setTitleFilter] = useState(searchParams.get("title") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "open");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    searchParams.get("tags") ? searchParams.get("tags")!.split(",") : []
  );
  const [sortField, setSortField] = useState(searchParams.get("sort") || "-created");

  // Build filter string for PocketBase
  const buildFilterString = () => {
    const filters = [];

    // Title filter
    if (titleFilter) {
      filters.push(`title ~ "${titleFilter}"`);
    }

    // Type filter - handle the case mapping properly
    if (typeFilter !== "all") {
      // Map "notes" to "note" and "tasks" to "task" to match the DB values
      const dbTypeValue = typeFilter === "notes" ? "note" : typeFilter === "tasks" ? "task" : typeFilter;
      filters.push(`type = "${dbTypeValue}"`);
    }

    // Status filter
    filters.push(`status = ${statusFilter === "closed"}`);

    // Tags filter (if there are multiple tags, we connect them with OR)
    if (selectedTagIds.length > 0) {
      const tagFilters = selectedTagIds.map((tagId) => `tags ~ "${tagId}"`).join(" || ");
      filters.push(`(${tagFilters})`);
    }

    return filters.length > 0 ? filters.join(" && ") : "";
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (page !== 1) params.set("page", page.toString());
    if (perPage !== 20) params.set("perPage", perPage.toString());
    if (titleFilter) params.set("title", titleFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    params.set("status", statusFilter);
    if (selectedTagIds.length > 0) params.set("tags", selectedTagIds.join(","));
    if (sortField !== "-created") params.set("sort", sortField);

    setSearchParams(params, { replace: true });
  }, [page, perPage, titleFilter, typeFilter, statusFilter, selectedTagIds, sortField, setSearchParams]);

  // Fetch data from PocketBase
  const fetchData = async () => {
    try {
      setLoading(true);
      const filter = buildFilterString();

      const resultList = await pb.collection("taskandnotes").getList(page, perPage, {
        filter: filter,
        sort: sortField,
      });

      setItems(resultList.items as unknown as TaskAndNoteItem[]);
      setTotalItems(resultList.totalItems);
      setTotalPages(resultList.totalPages);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toaster.create({
        title: "Error fetching items",
        description: "Failed to load items from database",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters, pagination, or sort changes
  useEffect(() => {
    fetchData();
  }, [page, perPage, titleFilter, typeFilter, statusFilter, selectedTagIds, sortField]);

  const handleTagClick = (tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
    // Reset to first page when filters change
    setPage(1);
  };

  // Navigate to edit page based on item type
  const handleItemClick = (item: TaskAndNoteItem) => {
    if (item.type === "task") {
      window.location.href = `/task/${item.id}`;
    } else {
      window.location.href = `/note/${item.id}`;
    }
  };

  // Create new item based on type
  const handleCreateItem = (type: "note" | "task") => {
    if (type === "note") {
      window.location.href = "/note/new";
    } else {
      window.location.href = "/task/new";
    }
  };

  // Calculate counts for open and closed status
  const openItemsCount = items.filter((item) => !item.status).length;
  const closedItemsCount = items.filter((item) => item.status).length;

  return (
    <Container p={4} maxW="3xl" mx="auto" w="3xl">
      <Heading size="lg">All Items</Heading>

      {/* Search and Filter Bar */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        p={3}
        bg="gray.50"
        borderRadius="md"
        flexWrap="wrap"
        mb={4}
      >
        <InputGroup startElement={<FaSearch />} flex={{ base: "1", md: "2" }}>
          <Input
            placeholder="Filter by title..."
            value={titleFilter}
            onChange={(e) => {
              setTitleFilter(e.target.value);
              setPage(1); // Reset to first page when search changes
            }}
            bg="white"
          />
        </InputGroup>
        <HStack>
          <Button colorScheme="blue" onClick={() => handleCreateItem("note")}>
            <Icon as={FaBook} mr={2} />
            New Note
          </Button>
          <Button colorScheme="green" onClick={() => handleCreateItem("task")}>
            <Icon as={FaCheckSquare} mr={2} />
            New Task
          </Button>
          <Button colorScheme="red" onClick={() => alert("not implemented")}>
            <Icon as={FaTags} mr={2} />
            Tags
          </Button>
        </HStack>
      </Flex>

      {/* Active Filters */}
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
              Type: {typeFilter === "notes" ? "Notes" : typeFilter === "tasks" ? "Tasks" : typeFilter}
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

      {/* Status and Type Filters */}
      <Flex justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box>
          <Button
            onClick={() => {
              setStatusFilter("open");
            }}
            variant={statusFilter === "open" ? "solid" : "outline"}
            size="sm"
            mr={1}
          >
            Open
            <Text color="gray.600" bg="gray.100" px={2} ml={2} borderRadius="md">
              {openItemsCount}
            </Text>
          </Button>
          <Button
            onClick={() => {
              setStatusFilter("closed");
            }}
            variant={statusFilter === "closed" ? "solid" : "outline"}
            size="sm"
          >
            Closed
            <Text color="gray.600" bg="gray.100" px={2} ml={2} borderRadius="md">
              {closedItemsCount}
            </Text>
          </Button>
        </Box>
        <HStack gap={1}>
          <MenuRoot>
            <MenuTrigger asChild>
              <Button size="sm">
                <Flex align="center">
                  <Icon as={FaFilter} mr={2} />
                  Type: {typeFilter === "all" ? "All" : typeFilter === "notes" ? "Notes" : "Tasks"}
                  <Icon as={FaCaretDown} ml={2} />
                </Flex>
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuRadioItemGroup value={typeFilter} onValueChange={(e: { value: string }) => setTypeFilter(e.value)}>
                <MenuRadioItem value="all" key="all" _checked={{ fontWeight: "bold" }}>
                  All Items
                </MenuRadioItem>
                <MenuRadioItem value="notes" key="notes" _checked={{ fontWeight: "bold" }}>
                  Notes
                </MenuRadioItem>
                <MenuRadioItem value="tasks" key="tasks" _checked={{ fontWeight: "bold" }}>
                  Tasks
                </MenuRadioItem>
              </MenuRadioItemGroup>
            </MenuContent>
          </MenuRoot>

          <MenuRoot>
            <MenuTrigger asChild>
              <Button size="sm">
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

          <MenuRoot>
            <MenuTrigger asChild>
              <Button size="sm">
                <Flex align="center">
                  <Icon as={FaFilter} mr={2} />
                  Sort:{" "}
                  {sortField === "-created"
                    ? "Newest"
                    : sortField === "created"
                    ? "Oldest"
                    : sortField === "-updated"
                    ? "Updated"
                    : sortField === "title"
                    ? "A-Z"
                    : "Z-A"}
                  <Icon as={FaCaretDown} ml={2} />
                </Flex>
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuRadioItemGroup
                value={sortField}
                onValueChange={(e: { value: string }) => {
                  setSortField(e.value);
                  setPage(1);
                }}
              >
                <MenuRadioItem value="-created" key="newest" _checked={{ fontWeight: "bold" }}>
                  Newest First
                </MenuRadioItem>
                <MenuRadioItem value="created" key="oldest" _checked={{ fontWeight: "bold" }}>
                  Oldest First
                </MenuRadioItem>
                <MenuRadioItem value="-updated" key="updated" _checked={{ fontWeight: "bold" }}>
                  Last Updated
                </MenuRadioItem>
                <MenuRadioItem value="title" key="asc" _checked={{ fontWeight: "bold" }}>
                  Title (A-Z)
                </MenuRadioItem>
                <MenuRadioItem value="-title" key="desc" _checked={{ fontWeight: "bold" }}>
                  Title (Z-A)
                </MenuRadioItem>
              </MenuRadioItemGroup>
            </MenuContent>
          </MenuRoot>
        </HStack>
      </Flex>

      {/* Remove the standalone Sort Control and go straight to Items List */}
      <Box borderWidth="1px" borderRadius="md" overflow="hidden" borderTopRadius={0}>
        {loading ? (
          <Flex justify="center" align="center" p={8}>
            <Spinner size="xl" />
          </Flex>
        ) : items.length === 0 ? (
          <Flex justify="center" py={8} color="gray.500">
            No items match your filters
          </Flex>
        ) : (
          items.map((item) => (
            <ListItem key={item.id} item={item} onClick={() => handleItemClick(item)} onRefresh={fetchData} />
          ))
        )}
      </Box>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={4}>
          <Box>
            <Text fontSize="sm" color="gray.600">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, totalItems)} of {totalItems} items
            </Text>
          </Box>
          <HStack>
            <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to show 5 pages around current page
              let pageNum = page;
              if (page < 3) {
                pageNum = i + 1;
              } else if (page > totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              // Only show valid page numbers
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    colorScheme={page === pageNum ? "blue" : "gray"}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}

            <Button
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>

            {/* Items per page selector */}
            <select
              value={perPage.toString()}
              onChange={(e) => {
                setPerPage(parseInt(e.target.value));
                setPage(1); // Reset to first page when items per page changes
              }}
              style={{
                padding: "0.5rem",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                backgroundColor: "white",
                border: "1px solid #E2E8F0",
              }}
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </HStack>
        </Flex>
      )}
    </Container>
  );
}

// Individual list item component
const ListItem = ({
  item,
  onClick,
  onRefresh,
}: {
  item: TaskAndNoteItem;
  onClick: () => void;
  onRefresh: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const pb = getPb();

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
      onClick={onClick}
      cursor="pointer"
    >
      <GridItem>
        {item.type === "task" ? (
          <TaskCheckbox
            checked={item.status}
            onChange={() => void pb.collection("task").update(item.id, { status: !item.status }).then(onRefresh)}
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
            title={item.title || (item.type === "task" ? "Untitled Task" : "Untitled Note")}
            lineThrough={item.status}
            contrast={isHovered ? "dark" : "bright"}
            mr={2}
            _hover={{ textDecoration: "underline", cursor: "pointer" }}
          />
          {item.tags && item.tags.length > 0 && (
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
        {item.user && item.user.length > 1 && (
          <Icon as={FaUserFriends} color="green.500" boxSize={5} aria-label="Shared with others" />
        )}
      </GridItem>
      <GridItem color="gray.600">{}</GridItem>
    </Grid>
  );
};
