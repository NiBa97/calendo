import React from "react";
import { Box, Flex, Text, useDisclosure, VStack } from "@chakra-ui/react";
import { FaCheck, FaPlusCircle } from "react-icons/fa";
import { useTags } from "../contexts/tag-context";
import { TagManagerDialog } from "./tag-manager-dialog";

interface TagListMenuProps {
    selectedTagIds: string[];
    onTagToggle: (tagId: string) => void;
}

export const TagListMenu: React.FC<TagListMenuProps> = ({
    selectedTagIds,
    onTagToggle,
}) => {
    const { tags } = useTags();
    const { open: isManagerOpen, onOpen: onManagerOpen, onClose: onManagerClose } = useDisclosure();

    const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));
    const handleManagerOpenChange = (open: boolean) => {
        if (open) {
            onManagerOpen();
        } else {
            onManagerClose();
        }
    };

    return (
        <>
            <Box minW="180px">
                <VStack align="stretch" gap={1} maxH="200px" overflowY="auto">
                    {sortedTags.length === 0 ? (
                        <Text p={2} color="gray.500">No tags available</Text>
                    ) : (
                        sortedTags.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                                <Flex
                                    key={tag.id}
                                    align="center"
                                    p={2}
                                    borderRadius="md"
                                    cursor="pointer"
                                    bg={isSelected ? "gray.100" : "transparent"}
                                    _hover={{ bg: "gray.50" }}
                                    onClick={() => onTagToggle(tag.id)}
                                    justifyContent="space-between"
                                >
                                    <Flex align="center">
                                        <Box bg={tag.color} width="12px" height="12px" borderRadius="full" mr={2} />
                                        <Text fontSize="sm">{tag.name}</Text>
                                    </Flex>
                                    {isSelected && <FaCheck color="green" />}
                                </Flex>
                            );
                        })
                    )}
                </VStack>
                <Box mt={2} borderTop="1px solid" borderColor="gray.200" pt={2}>
                    <Flex align="center" cursor="pointer" p={2} borderRadius="md" _hover={{ bg: "gray.50" }} onClick={onManagerOpen}>
                        <FaPlusCircle style={{ marginRight: "8px" }} />
                        <Text fontSize="sm">Manage Tags</Text>
                    </Flex>
                </Box>
            </Box>
            <TagManagerDialog isOpen={isManagerOpen} onOpenChange={handleManagerOpenChange} />
        </>
    );
}; 