import { Badge, Button, Flex, Text } from "@chakra-ui/react"
import { Filter } from "../../../lib/filters"
import { TagBadges } from "../../../components/ui/tag-badges";

export const FilterDisplay = ({ filter, onChange }: { filter: Filter, onChange: (filter: Filter) => void }) => {
    if (filter.tags.length === 0 && filter.title === "" && filter.type === "all") {
        // If the filter is only default, don't show anything
        return <></>;
    }

    const handleTagClick = (tagId: string) => {
        onChange(new Filter({ ...filter, tags: filter.tags.filter(t => t !== tagId) }));
    }



    return (
        <Flex>
            <Text color="gray.600" fontWeight="medium">
                Active filters:
            </Text>

            {filter.title && (
                <Badge colorScheme="blue" borderRadius="full" px={2} display="flex" alignItems="center">
                    Title: {filter.title}
                </Badge>
            )}

            {filter.type !== "all" && (
                <Badge colorScheme="purple" borderRadius="full" px={2} display="flex" alignItems="center">
                    Type: {filter.type}
                </Badge>
            )}

            {filter.tags.length > 0 && <TagBadges tagIds={filter.tags} onRemove={handleTagClick} size="sm" />}

            <Button
                size="xs"
                onClick={() => {
                    onChange(new Filter());
                }}
            >
                Clear filters
            </Button>
        </Flex>
    )
}