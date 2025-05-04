import { Box, Button, Flex, Icon, Menu, Text, VStack } from "@chakra-ui/react"
import { FaTags, FaCaretDown } from "react-icons/fa"
import { getTags } from "../services/pocketBaseService";
import { Tag } from "../types";
import { useEffect, useState } from "react";
export const TagFilterButton = ({ selectedTagIds, handleSelectionChange }: { selectedTagIds: string[], handleSelectionChange: (selectedTagIds: string[]) => void }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  useEffect(() => {
    getTags().then((tags) => {
      setTags(tags);
    });
  }, []);
  const handleTagClick = (tagId: string) => {
    handleSelectionChange(selectedTagIds.includes(tagId) ? selectedTagIds.filter((id) => id !== tagId) : [...selectedTagIds, tagId]);
  }
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button>
          <Flex align="center">
            <Icon as={FaTags} mr={2} />
            Tags {selectedTagIds.length > 0 && `(${selectedTagIds.length})`}
            <Icon as={FaCaretDown} ml={2} />
          </Flex>
        </Button>
      </Menu.Trigger>

      <Menu.Positioner>
        <Menu.Content minW="250px">
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
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}