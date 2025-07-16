import {
  Flex,
  useDisclosure,
  Menu,
  Box,
  Text,
  Dialog,
  Portal,
  Input,
  Button,
} from "@chakra-ui/react";
import { FaTags, FaPlusCircle } from "react-icons/fa";
import { useTags } from "../features/tags/useTags";
import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

interface TagMenuProps {
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  contentDialogRef?: React.MutableRefObject<HTMLDivElement | null> | null;
}

export const TagMenuButton: React.FC<TagMenuProps> = ({
  selectedTagIds,
  onTagToggle,
}) => {
  const { tags } = useTags();

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm">
          <FaTags />
          <Text>Tags ({selectedTagIds.length})</Text>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup title="Tags">
              {tags.map((tag) => (
                <Menu.CheckboxItem
                  key={tag.id}
                  checked={selectedTagIds.includes(tag.id)}
                  onClick={() => onTagToggle(tag.id)}
                  value={tag.id}
                >
                  <Menu.ItemIndicator />
                  <Flex align="center">
                    <Box
                      bg={tag.color}
                      width="12px"
                      height="12px"
                      borderRadius="full"
                      mr={2}
                    />
                    <Text fontSize="sm">{tag.name}</Text>
                  </Flex>
                </Menu.CheckboxItem>
              ))}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

interface TagListMenuProps {
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
}

export const TagListMenu: React.FC<TagListMenuProps> = ({
  selectedTagIds,
  onTagToggle,
}) => {
  const { tags } = useTags();
  const {
    open: isManagerOpen,
    onOpen: onManagerOpen,
    onClose: onManagerClose,
  } = useDisclosure();

  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));
  const handleManagerOpenChange = (open: boolean) => {
    if (open) {
      onManagerOpen();
    } else {
      onManagerClose();
    }
  };

  return (
    <Menu.Item minW="180px" value="tags-section">
      <Text fontWeight="bold">Tags</Text>
      {sortedTags.length === 0 ? (
        <Menu.Item p={2} color="gray.500" value="">
          No tags available
        </Menu.Item>
      ) : (
        sortedTags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <Menu.CheckboxItem
              key={tag.id}
              checked={isSelected}
              onClick={() => onTagToggle(tag.id)}
              value={tag.id}
            >
              <Menu.ItemIndicator />
              <Flex align="center">
                <Box
                  bg={tag.color}
                  width="12px"
                  height="12px"
                  borderRadius="full"
                  mr={2}
                />
                <Text fontSize="sm">{tag.name}</Text>
              </Flex>
            </Menu.CheckboxItem>
          );
        })
      )}
      <Box mt={2} borderTop="1px solid" borderColor="gray.200" pt={2}>
        <Flex
          align="center"
          cursor="pointer"
          p={2}
          borderRadius="md"
          _hover={{ bg: "gray.50" }}
          onClick={onManagerOpen}
        >
          <FaPlusCircle style={{ marginRight: "8px" }} />
          <Text fontSize="sm">Manage Tags</Text>
        </Flex>
      </Box>
      <TagManagerDialog
        isOpen={isManagerOpen}
        onOpenChange={handleManagerOpenChange}
      />
    </Menu.Item>
  );
};

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
  const { tags } = useTags();
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#00ADB5");
  function createTag(tag: { name: string; color: string }) {
    // Simulate API call to create a new tag
    alert("Not implemented: createTag function");
    console.log("Creating tag:", tag);
    return { id: Math.random().toString(36).substring(2, 15), ...tag };
  }
  function deleteTag(tagId: string) {
    // Simulate API call to delete a tag
    alert("Not implemented: deleteTag function");
    console.log("Deleting tag with ID:", tagId);
  }
  const filteredTags = tags.filter((tag) => {
    const query = searchQuery.toLowerCase();
    return tag.name.toLowerCase().includes(query);
  });

  const sortedTags = [...filteredTags].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
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
    if (
      !window.confirm(
        "Are you sure you want to delete this tag? This will remove it from all notes and tasks."
      )
    ) {
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
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => onOpenChange(details.open)}
      lazyMount={true}
    >
      <Portal>
        <Dialog.Positioner>
          <Dialog.Content bg="brand.1" color="brand.4" maxW="sm">
            <Dialog.Header borderBottom="1px solid" borderColor="brand.2">
              Manage Tags
            </Dialog.Header>
            <Dialog.CloseTrigger onClick={handleClose} />

            <Dialog.Body p={4}>
              <Flex direction="column" gap={4}>
                <Input
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="flushed"
                />

                <Text fontWeight="medium">Existing Tags</Text>
                <Flex
                  maxH="200px"
                  overflowY="auto"
                  direction={"column"}
                  gap={2}
                >
                  {sortedTags.length === 0 ? (
                    <Text>No tags found</Text>
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
                          <Box
                            bg={tag.color}
                            width="16px"
                            height="16px"
                            borderRadius="full"
                            mr={2}
                          />
                          <Text>{tag.name}</Text>
                        </Flex>
                        <Button
                          size="sm"
                          aria-label="Delete tag"
                          variant="solid"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <FaTrash />
                          Delete Tag
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
                      variant="flushed"
                    />
                    <Flex align="center">
                      <Text mr={2}>Color:</Text>
                      <Flex align="center">
                        <Input
                          type="color"
                          value={newTagColor}
                          onChange={(e) => setNewTagColor(e.target.value)}
                          width="32px"
                          height="32px"
                          border={"none"}
                          p={0}
                        />
                      </Flex>
                    </Flex>
                    <Button
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                    >
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
