import React, { useState } from "react";
import { Box, Input, Text, Flex, Button, Dialog, Portal } from "@chakra-ui/react";
import { FaSearch, FaPlus, FaTrash } from "react-icons/fa";
import { useTags } from "../contexts/tag-context";
import { ColorInput } from "./ui/color-input";

interface TagManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTagCreated?: (tagId: string) => void;
}

export const TagManagerDialog: React.FC<TagManagerDialogProps> = ({
  isOpen,
  onOpenChange,
  onTagCreated,
}) => {
  const { tags, createTag, deleteTag } = useTags();
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#00ADB5");

  const filteredTags = tags.filter((tag) => {
    const query = searchQuery.toLowerCase();
    return tag.name.toLowerCase().includes(query);
  });

  const sortedTags = [...filteredTags].sort((a, b) => a.name.localeCompare(b.name));
  console.log("isOpen", isOpen);
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await createTag({
        name: newTagName,
        color: newTagColor,
      });
      onTagCreated?.(newTag.id);
      setNewTagName("");
      setNewTagColor("#00ADB5");
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm("Are you sure you want to delete this tag? This will remove it from all notes and tasks.")) {
      return;
    }
    try {
      await deleteTag(tagId);
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const handleClose = () => {
    console.log("handleClose");
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => onOpenChange(details.open)} lazyMount={true} >
    
    <Portal>
    <Dialog.Positioner>
      <Dialog.Content bg="brand.1" color="brand.4" maxW="sm">
        <Dialog.Header borderBottom="1px solid" borderColor="brand.2">
          Manage Tags
        </Dialog.Header>
        <Dialog.CloseTrigger onClick={handleClose} />
        
        <Dialog.Body p={4}>
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

            <Text fontWeight="medium">Existing Tags</Text>
            <Flex maxH="200px" overflowY="auto" direction={"column"} gap={2}>
              {sortedTags.length === 0 ? (
                <Text p={2} color="brand.3">No tags found</Text>
              ) : (
                sortedTags.map((tag) => (
                  <Flex
                    key={tag.id}
                    align="center"
                    justify="space-between"
                    p={2}
                    borderRadius="md"
                    _hover={{ bg: "brand.2" }}
                  >
                    <Flex align="center">
                      <Box bg={tag.color} width="16px" height="16px" borderRadius="full" mr={2} />
                      <Text>{tag.name}</Text>
                    </Flex>
                    <Button
                      aria-label="Delete tag"
                      size="xs"
                      variant="ghost"
                      color="brand.3"
                      _hover={{ color: "red.500", bg: "transparent" }}
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      <FaTrash />
                    </Button>
                  </Flex>
                ))
              )}
            </Flex>

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
        </Dialog.Body>
        <Dialog.Footer borderTop="1px solid" borderColor="brand.2">
          <Button variant="ghost" onClick={handleClose}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
      </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}; 