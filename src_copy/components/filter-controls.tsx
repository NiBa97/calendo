import React from "react";
import {
  Flex,
  HStack,
  Icon,
  Text,
  Badge,
  Box,
  VStack,
} from "@chakra-ui/react";
import { BrandButton } from "./ui/brand-button";
import { SearchInput } from "./ui/search-input";
import { EmptyState } from "./ui/empty-state";
import { FaFilter, FaTags, FaCaretDown, FaBook, FaCheckSquare } from "react-icons/fa";
import { MenuRoot, MenuTrigger, MenuContent } from "./ui/menu";
import { Menu } from "@chakra-ui/react";
import { TagBadges } from "./ui/tag-badges";
import { useTags } from "../contexts/tag-context";
import { ListItem } from "../hooks/useListFilters";

interface FilterControlsProps {
  titleFilter: string;
  typeFilter: string;
  statusFilter: string;
  selectedTagIds: string[];
  sortedItems: ListItem[];
  onTitleFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTagClick: (tagId: string) => void;
  onClearFilters: () => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  onTagManagerOpen: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  titleFilter,
  typeFilter,
  statusFilter,
  selectedTagIds,
  sortedItems,
  onTitleFilterChange,
  onTypeFilterChange,
  onStatusFilterChange,
  onTagClick,
  onClearFilters,
  onCreateNote,
  onCreateTask,
  onTagManagerOpen,
}) => {
  const { tags } = useTags();

  const hasActiveFilters = titleFilter || typeFilter !== "all" || selectedTagIds.length > 0;

  return (
    <>
      {/* Main Filter Bar */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={6}
        p={3}
        bg="gray.50"
        borderRadius="md"
        flexWrap="wrap"
      >
        <SearchInput
          placeholder="Filter by title..."
          value={titleFilter}
          onChange={onTitleFilterChange}
          flex={{ base: "1", md: "2" }}
        />
        <HStack>
          <BrandButton variant="primary" onClick={onCreateNote}>
            <Icon as={FaBook} mr={2} />
            New Note
          </BrandButton>
          <BrandButton variant="primary" onClick={onCreateTask}>
            <Icon as={FaCheckSquare} mr={2} />
            New Task
          </BrandButton>
          <BrandButton variant="secondary" onClick={onTagManagerOpen}>
            <Icon as={FaTags} mr={2} />
            Tags
          </BrandButton>
        </HStack>
      </Flex>

      {/* Active Filters Display */}
      {hasActiveFilters && (
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

          {selectedTagIds.length > 0 && <TagBadges tagIds={selectedTagIds} onRemove={onTagClick} size="sm" />}

          <BrandButton size="xs" variant="ghost" onClick={onClearFilters}>
            Clear filters
          </BrandButton>
        </Flex>
      )}

      {/* Status and Type Controls */}
      <Flex justifyContent="space-between">
        <Box>
          <BrandButton
            onClick={() => onStatusFilterChange("open")}
            variant={statusFilter === "open" ? "primary" : "secondary"}
          >
            Open
            <Text color="gray.600" bg="gray.100" px={2} borderRadius="md" ml={2}>
              {sortedItems.filter((item) => item.status === false).length}
            </Text>
          </BrandButton>
          <BrandButton
            onClick={() => onStatusFilterChange("closed")}
            variant={statusFilter === "closed" ? "primary" : "secondary"}
            ml={2}
          >
            Closed
            <Text color="gray.600" bg="gray.100" px={2} borderRadius="md" ml={2}>
              {sortedItems.filter((item) => item.status === true).length}
            </Text>
          </BrandButton>
        </Box>
        <Box>
          <MenuRoot>
            <MenuTrigger asChild>
              <BrandButton variant="secondary">
                <Flex align="center">
                  <Icon as={FaFilter} mr={2} />
                  Type: {typeFilter === "all" ? "All" : typeFilter === "notes" ? "Notes" : "Tasks"}
                  <Icon as={FaCaretDown} ml={2} />
                </Flex>
              </BrandButton>
            </MenuTrigger>
            <MenuContent>
              <Menu.RadioItemGroup value={typeFilter} onValueChange={(e) => onTypeFilterChange(e.value)}>
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
              <BrandButton variant="secondary" ml={2}>
                <Flex align="center">
                  <Icon as={FaTags} mr={2} />
                  Tags {selectedTagIds.length > 0 && `(${selectedTagIds.length})`}
                  <Icon as={FaCaretDown} ml={2} />
                </Flex>
              </BrandButton>
            </MenuTrigger>
            <MenuContent minW="250px">
              <Box p={3}>
                <Text fontWeight="medium" mb={2}>
                  Filter by Tags
                </Text>
                <VStack align="stretch" maxH="200px" overflowY="auto">
                  {tags.length === 0 ? (
                    <EmptyState message="No tags found" />
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
                        onClick={() => onTagClick(tag.id)}
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
    </>
  );
};