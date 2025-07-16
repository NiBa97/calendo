import React, { useState } from "react";
import { Box, Flex, Text, Button, Input, IconButton, Icon } from "@chakra-ui/react";
import { FaPlus, FaStar, FaTrash } from "react-icons/fa";
import { PinnedQuery } from "../hooks/usePinnedQueries";

interface PinnedQueriesSectionProps {
  pinnedQueries: PinnedQuery[];
  onAddQuery: (name: string, filters: PinnedQuery["filters"]) => void;
  onDeleteQuery: (queryId: string) => void;
  onApplyQuery: (query: PinnedQuery) => void;
  currentFilters: PinnedQuery["filters"];
}

export const PinnedQueriesSection: React.FC<PinnedQueriesSectionProps> = ({
  pinnedQueries,
  onAddQuery,
  onDeleteQuery,
  onApplyQuery,
  currentFilters,
}) => {
  const [showPinnedQueryInput, setShowPinnedQueryInput] = useState(false);
  const [newQueryName, setNewQueryName] = useState("");

  const handlePinCurrentQuery = () => {
    if (!newQueryName.trim()) return;

    onAddQuery(newQueryName.trim(), currentFilters);
    setNewQueryName("");
    setShowPinnedQueryInput(false);
  };

  return (
    <Box mb={6}>
      <Flex align="center" justify="space-between" mb={2}>
        <Text fontSize="md" fontWeight="medium" color="gray.700">
          Pinned Filters
        </Text>
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowPinnedQueryInput(false);
              setNewQueryName("");
            }}
          >
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
            onClick={() => onApplyQuery(query)}
          >
            <Icon as={FaStar} color="yellow.500" mr={2} />
            <Text fontSize="sm" fontWeight="medium">
              {query.name}
            </Text>
            <Box>
              <IconButton
                aria-label="Delete pinned query"
                size="xs"
                variant="ghost"
                ml={2}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onDeleteQuery(query.id);
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
  );
};