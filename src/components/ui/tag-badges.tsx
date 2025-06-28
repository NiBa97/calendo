import React from "react";
import { Box, Flex, Badge } from "@chakra-ui/react";
import { FaTimes } from "react-icons/fa";
import { useTags } from "../../contexts/tag-context"; // Adjusted import path
import { getContrastColor } from "../../utils/colors"; // Adjusted import path

// Copied from tag-selector.tsx
export const TagBadges: React.FC<{
  tagIds: string[];
  onRemove?: (tagId: string) => void;
  onClick?: (tagId: string) => void;
  size?: "sm" | "md";
}> = ({ tagIds, onRemove, onClick, size = "md" }) => {
  const { tags } = useTags();

  const selectedTags = tags.filter((tag) => tagIds.includes(tag.id));

  return (
    <Flex gap={2} direction="row" alignItems="flex-start">
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          borderRadius="full"
          px={size === "sm" ? 2 : 3}
          py={size === "sm" ? 0 : 1}
          bg={tag.color}
          color={getContrastColor(tag.color)}
          fontSize={size === "sm" ? "xs" : "sm"}
          cursor={onClick ? "pointer" : "default"}
          _hover={onClick ? { opacity: 0.8 } : {}}
          onClick={() => onClick?.(tag.id)}
        >
          {tag.name}
          {onRemove && (
            <Box
              as={FaTimes}
              ml={1}
              display="inline"
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(tag.id);
              }}
            />
          )}
        </Badge>
      ))}
    </Flex>
  );
};
