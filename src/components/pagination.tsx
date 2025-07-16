import { Text, Flex, IconButton } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  maxPages: number;
  onPageUpdate: (page: number) => void;
}

export const Pagination = ({ page, maxPages, onPageUpdate }: PaginationProps) => {
  const isFirstPage = page === 1;
  const isLastPage = page === maxPages;

  const handlePreviousPage = () => {
    if (!isFirstPage) {
      onPageUpdate(page - 1);
    }
  };

  const handleNextPage = () => {
    if (!isLastPage) {
      onPageUpdate(page + 1);
    }
  };

  return (
    <Flex justify="center" align="center" p={4} gap={4}>
      <IconButton
        aria-label="Previous page"
        onClick={handlePreviousPage}
        disabled={isFirstPage}
        variant="outline"
        size="sm"
      >
        <ChevronLeft size={16} />
      </IconButton>

      <Text fontSize="sm" color="gray.600">
        Page {page} of {maxPages}
      </Text>

      <IconButton aria-label="Next page" onClick={handleNextPage} disabled={isLastPage} variant="outline" size="sm">
        <ChevronRight size={16} />
      </IconButton>
    </Flex>
  );
};
