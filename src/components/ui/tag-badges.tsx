import React from "react";
import { Box, Flex, Badge } from "@chakra-ui/react";
import { FaTimes } from "react-icons/fa";
import { useTags } from "../../contexts/tag-context"; // Adjusted import path
import { getContrastColor } from "../../utils/colors"; // Adjusted import path

// Copied from tag-selector.tsx
export const TagBadges: React.FC<{ 
  tagIds: string[];
  onRemove?: (tagId: string) => void;
  size?: "sm" | "md";
}> = ({ tagIds, onRemove, size = "md" }) => {
  const { tags } = useTags();

  const selectedTags = tags.filter((tag) => tagIds.includes(tag.id));

  return (
    <Flex wrap="wrap" gap={2}>
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
 