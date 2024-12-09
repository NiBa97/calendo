import React, { useRef } from "react";
import {
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaClone } from "react-icons/fa";
import { api } from "~/trpc/react";
import { useTasks } from "~/contexts/task-context";

interface DuplicateTaskManagerProps {
  variant?: "outline" | "solid" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg";
  width?: string;
}

export const DuplicateTaskManager: React.FC<DuplicateTaskManagerProps> = ({
  variant = "solid",
  size = "md",
  width = "full",
}) => {
  // Hooks
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteDuplicatesMutation = api.task.deleteDuplicates.useMutation();

  const handleDeleteDuplicates = async () => {
    try {
      const result = await deleteDuplicatesMutation.mutateAsync();

      if (result.deletedCount === 0) {
        toast({
          title: "No duplicates found",
          description: "There are no duplicate tasks to delete.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: "Success",
        description: `Successfully deleted ${result.deletedCount} duplicate task${
          result.deletedCount === 1 ? "" : "s"
        }.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Refresh the page to update the task list
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete duplicate tasks. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Button
        leftIcon={<FaClone />}
        onClick={onOpen}
        width={width}
        variant={variant}
        size={size}
        bg="brand.2"
        _hover={{ bg: "brand.3" }}
        isLoading={deleteDuplicatesMutation.isPending}
      >
        Delete Duplicate Tasks
      </Button>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent bg="brand.1" color="brand.4">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Duplicate Tasks
            </AlertDialogHeader>

            <AlertDialogBody>
              This will delete all duplicate tasks, keeping only the oldest version of each task. Tasks are considered
              duplicates if they have the same: • Title • Description • Start date • Due date This action cannot be
              undone. Are you sure you want to continue?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  void handleDeleteDuplicates();
                  onClose();
                }}
                ml={3}
              >
                Delete Duplicates
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
