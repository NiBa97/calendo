import React, { useState } from "react";
import { Box, Input, Text, Flex, Button, useDisclosure, Badge } from "@chakra-ui/react";
import { FaSearch, FaPlus, FaTimes, FaTags } from "react-icons/fa";
import { useTags } from "../contexts/tag-context";
import { ColorInput } from "./ui/color-input";
import { DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger } from "./ui/dialog";

interface TagSelectorProps {
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onTagRemove: (tagId: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onTagSelect, onTagRemove }) => {
  const { tags, createTag } = useTags();
  const [searchQuery, setSearchQuery] = useState("");
  const { open, onOpen, onClose } = useDisclosure();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#00ADB5"); // Default color

  const filteredTags = tags.filter((tag) => {
    const query = searchQuery.toLowerCase();
    return tag.name.toLowerCase().includes(query);
  });

  const sortedTags = [...filteredTags].sort((a, b) => {
    const aIsSelected = selectedTags.includes(a.id);
    const bIsSelected = selectedTags.includes(b.id);

    if (aIsSelected && !bIsSelected) return -1;
    if (!aIsSelected && bIsSelected) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag({
        name: newTagName,
        color: newTagColor,
      });

      onTagSelect(newTag.id);
      setNewTagName("");
      setNewTagColor("#00ADB5");
      onClose();
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  return (
    <>
      <Button onClick={onOpen} size="sm" colorScheme="blue" variant="outline">
        <Box as={FaTags} mr={1} /> Manage Tags
      </Button>

      <DialogRoot
        open={open}
        onOpenChange={(e) => {
          if (!e.open) onClose();
        }}
      >
        <DialogContent bg="brand.1" color="brand.4" maxW="sm">
          <DialogHeader borderBottom="1px solid" borderColor="brand.2">
            Tags
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody p={4}>
            <Flex direction="column" gap={4}>
              <Box position="relative">
                <Input
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  pr="2rem"
                  bg="brand.1"
                  color="brand.4"
                  borderColor="brand.3"
                  _hover={{ borderColor: "brand.4" }}
                  _focus={{ borderColor: "brand.4" }}
                />
                <Box position="absolute" right="0.5rem" top="50%" transform="translateY(-50%)">
                  <FaSearch color="var(--chakra-colors-brand-3)" />
                </Box>
              </Box>

              <Box maxH="200px" overflowY="auto">
                {sortedTags.length === 0 ? (
                  <Text p={2}>No tags found</Text>
                ) : (
                  sortedTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <Flex
                        key={tag.id}
                        align="center"
                        justify="space-between"
                        p={2}
                        borderRadius="md"
                        bg={isSelected ? "brand.2" : "transparent"}
                        _hover={{ bg: "brand.2" }}
                        cursor="pointer"
                        onClick={() => (isSelected ? onTagRemove(tag.id) : onTagSelect(tag.id))}
                      >
                        <Flex align="center">
                          <Box bg={tag.color} width="16px" height="16px" borderRadius="full" mr={2} />
                          <Text>{tag.name}</Text>
                        </Flex>
                        {isSelected && (
                          <Box
                            as={FaTimes}
                            color="brand.4"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTagRemove(tag.id);
                            }}
                          />
                        )}
                      </Flex>
                    );
                  })
                )}
              </Box>

              <Box borderTop="1px solid" borderColor="brand.2" pt={3}>
                <Text fontWeight="medium" mb={2}>
                  Create New Tag
                </Text>
                <Flex direction="column" gap={3}>
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    bg="brand.1"
                    color="brand.4"
                    borderColor="brand.3"
                    _hover={{ borderColor: "brand.4" }}
                    _focus={{ borderColor: "brand.4" }}
                  />
                  <Flex align="center">
                    <Text mr={2}>Color:</Text>
                    <ColorInput value={newTagColor} onChange={setNewTagColor} />
                  </Flex>
                  <Button onClick={handleCreateTag} colorScheme="blue" disabled={!newTagName.trim()}>
                    <Box as={FaPlus} mr={1} /> Create Tag
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </DialogBody>
          <DialogFooter borderTop="1px solid" borderColor="brand.2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export const TagBadges: React.FC<{
  tagIds: string[];
  onRemove?: (tagId: string) => void;
  size?: "sm" | "md";
}> = ({ tagIds, onRemove, size = "md" }) => {
  const { tags } = useTags();

  const selectedTags = tags.filter((tag) => tagIds.includes(tag.id));

  if (selectedTags.length === 0) return null;

  return (
    <Flex wrap="wrap" gap={2} mt={2}>
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          borderRadius="full"
          px={size === "sm" ? 2 : 3}
          py={size === "sm" ? 0 : 1}
          bg={tag.color}
          color={getContrastColor(tag.color)}
          fontSize={size === "sm" ? "xs" : "sm"}
        >
          {tag.name}
          {onRemove && (
            <Box as={FaTimes} ml={1} display="inline-block" cursor="pointer" onClick={() => onRemove(tag.id)} />
          )}
        </Badge>
      ))}
    </Flex>
  );
};

// Helper function to determine text color based on background color
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
