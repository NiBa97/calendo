import React, { useState } from "react";
import { Box, Text, Flex, Dialog, Portal } from "@chakra-ui/react";
import { BrandInput } from "./ui/brand-input";
import { BrandButton } from "./ui/brand-button";
import { SearchInput } from "./ui/search-input";
import { EmptyState } from "./ui/empty-state";
import { IconActionButton } from "./ui/icon-action-button";
import { FaPlus, FaTrash } from "react-icons/fa";
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
                <SearchInput
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  brandVariant="dark"
                />

                <Text fontWeight="medium">Existing Tags</Text>
                <Flex maxH="200px" overflowY="auto" direction={"column"} gap={2}>
                  {sortedTags.length === 0 ? (
                    <EmptyState message="No tags found" />
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
                        <IconActionButton
                          aria-label="Delete tag"
                          variant="danger"
                          onClick={() => handleDeleteTag(tag.id)}
                          icon={<FaTrash />}
                        />
                      </Flex>
                    ))
                  )}
                </Flex>

                <Box borderTop="1px solid" borderColor="brand.2" pt={3}>
                  <Text fontWeight="medium" mb={2}>
                    Create New Tag
                  </Text>
                  <Flex direction="column" gap={3}>
                    <BrandInput
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      brandVariant="dark"
                    />
                    <Flex align="center">
                      <Text mr={2}>Color:</Text>
                      <ColorInput value={newTagColor} onChange={setNewTagColor} />
                    </Flex>
                    <BrandButton onClick={handleCreateTag} variant="primary" disabled={!newTagName.trim()}>
                      <Box as={FaPlus} mr={1} /> Create Tag
                    </BrandButton>
                  </Flex>
                </Box>
              </Flex>
            </Dialog.Body>
            <Dialog.Footer borderTop="1px solid" borderColor="brand.2">
              <BrandButton variant="ghost" onClick={handleClose}>
                Close
              </BrandButton>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}; 