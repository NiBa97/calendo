import React from "react";
import { Flex, useDisclosure, Portal, HStack, Menu } from "@chakra-ui/react";
import { FaTags, FaChevronRight } from "react-icons/fa";
import { TagManagerDialog } from "./tag-manager-dialog";
import { TagListMenu } from "./tag-list-menu";

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
  const { open: isManagerOpen, onOpen: onManagerOpen, onClose: onManagerClose } = useDisclosure();

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
              <TagListMenu
                selectedTagIds={selectedTagIds}
                onTagToggle={onTagToggle}
              />
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <TagManagerDialog isOpen={isManagerOpen} onOpenChange={handleManagerOpenChange} />
    </>
  );
}; 