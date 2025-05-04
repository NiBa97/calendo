import { Text, Button, HStack } from "@chakra-ui/react";
import React from "react";

interface ListPaginationProps {
    currentPage: number;
    maxPage: number;
    onChange: (page: number) => void;
}

export const ListPagination: React.FC<ListPaginationProps> = ({ currentPage, maxPage, onChange }) => {
    return (
        <HStack>
            <Button
                onClick={() => onChange(currentPage - 1)}
                disabled={currentPage <= 1}
                size="sm"
            >
                Previous
            </Button>
            <Text fontSize="sm">
                Page {currentPage} of {maxPage}
            </Text>
            <Button
                onClick={() => onChange(currentPage + 1)}
                disabled={currentPage >= maxPage}
                size="sm"
            >
                Next
            </Button>
        </HStack>
    );
};