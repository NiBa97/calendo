import React from "react";
import { Box, Flex, Text, useDisclosure, Portal, HStack, Menu } from "@chakra-ui/react";
import { FaTags, FaCheck, FaChevronRight, FaPlusCircle } from "react-icons/fa";
import { useTags } from "../contexts/tag-context";
import { TagManagerDialog } from "./tag-manager-dialog";

interface TagMenuProps {
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  contentDialogRef?: React.MutableRefObject<HTMLDivElement | null> | null;
}

export const TagMenu: React.FC<TagMenuProps> = ({
  selectedTagIds,
  onTagToggle,
  contentDialogRef = null,
}) => {
  const { tags } = useTags();
  const { open: isManagerOpen, onOpen: onManagerOpen, onClose: onManagerClose } = useDisclosure();

  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));
  const handleManagerOpenChange = (open: boolean) => {
    console.log("handleManagerOpenChange", open);
    if (open) {
      onManagerOpen();
    } else {
      onManagerClose();
    }
  };
  const handleMenuOpenChange = (open: boolean) => {
    console.log("handleMenuOpenChange", open);
    
  };
  return (
    <>
      <Menu.Root positioning={{ placement: "right-start", gutter: 2 }} onOpenChange={(details) => handleMenuOpenChange(details.open)}>
        <Menu.TriggerItem asChild>
          <Flex justifyContent="space-between" >
            <HStack>
              <FaTags style={{ marginRight: "8px" }} /> Tags{" "}
            </HStack>
            <FaChevronRight />
          </Flex>
        </Menu.TriggerItem>

        <Portal container={contentDialogRef ?? undefined}>
          <Menu.Positioner>
            <Menu.Content>
              {sortedTags.length === 0 && (
                <Menu.Item value="no-tags" disabled>
                  <Text p={2} color="gray.500">No tags available</Text>
                </Menu.Item>
              )}
              {sortedTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <Menu.Item key={tag.id} value={tag.id} onClick={() => onTagToggle(tag.id)}>
                    <Flex align="center" justify="space-between" >
                      <Flex align="center">
                        <Box bg={tag.color} width="12px" height="12px" borderRadius="full" mr={2} />
                        <Text fontSize="sm">{tag.name}</Text>
                      </Flex>
                      {isSelected && <FaCheck color="green" />}
                    </Flex>
                  </Menu.Item>
                );
              })}
              <Menu.Separator />
              <Menu.Item value="manage-tags" onClick={onManagerOpen} closeOnSelect={false}>
                <Flex align="center" >
                  <FaPlusCircle style={{ marginRight: "8px" }} />
                  <Text fontSize="sm">Manage Tags</Text>
                </Flex>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <TagManagerDialog isOpen={isManagerOpen} onOpenChange={handleManagerOpenChange} />
    </>
  );
}; 