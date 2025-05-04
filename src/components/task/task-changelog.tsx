import { useState, useEffect } from "react";
import { useTasks } from "../../contexts/task-context";
import { DialogBody, DialogContent, DialogRoot } from "../ui/dialog";


import { FaHistory } from "react-icons/fa";
import moment from "moment";
import { Badge, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { VStack } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { getPb } from "../../pocketbaseUtils";
import { TaskHistoryRecord } from "../../pocketbase-types";

interface TaskChangelogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

const TaskChangelog: React.FC<TaskChangelogProps> = ({ isOpen, onClose, taskId }) => {
  const [versions, setVersions] = useState<
    {
      title: string;
      description: string;
      status: boolean;
      startDate?: Date;
      endDate?: Date;
      isAllDay: boolean;
      date: Date;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { updateTask } = useTasks();
  const pb = getPb();

  useEffect(() => {
    if (isOpen && taskId) {
      loadChangeHistory();
    }
  }, [isOpen, taskId]);

  const loadChangeHistory = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection("taskHistory").getFullList<TaskHistoryRecord>({
        filter: `task="${taskId}"`,
        sort: "-created",
      });
      const versionHistory: {
        title: string;
        description: string;
        status: boolean;
        startDate?: Date;
        endDate?: Date;
        isAllDay: boolean;
        date: Date;
      }[] = [];

      records.forEach((record) => {
        versionHistory.push({
          title: record.title ?? "",
          description: record.description ?? "",
          status: record.status ?? false,
          startDate: record.startDate ? new Date(record.startDate) : undefined,
          endDate: record.endDate ? new Date(record.endDate) : undefined,
          isAllDay: record.isAllDay ?? false,
          date: new Date(record.created ?? ""),
        });
      });

      setVersions(versionHistory);
    } catch (error) {
      console.error("Error loading change history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertToVersion = async (index: number) => {
    try {
      console.log("Reverting to version:", index);
      const versionToRevert = versions[index];
      console.log("Reverting to version:", versionToRevert);

      await updateTask(taskId, {
        title: versionToRevert.title,
        description: versionToRevert.description,
        status: versionToRevert.status,
        startDate: versionToRevert.startDate,
        endDate: versionToRevert.endDate,
        isAllDay: versionToRevert.isAllDay,
      });

      onClose();
    } catch (error) {
      console.error("Error reverting task:", error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  const formatDateTime = (date?: Date) => {
    if (!date) return "Not set";
    return moment(date).format("YYYY-MM-DD HH:mm");
  };

  // Helper function to determine if a field has changed between versions
  const hasFieldChanged = (
    field: string,
    currentVersion: Record<string, unknown>,
    previousVersion: Record<string, unknown>
  ) => {
    // Special handling for dates
    if (field === "startDate" || field === "endDate") {
      const currentDate = currentVersion[field] ? new Date(currentVersion[field] as string).getTime() : null;
      const prevDate = previousVersion[field] ? new Date(previousVersion[field] as string).getTime() : null;
      return currentDate !== prevDate;
    }

    // For other fields, simple comparison
    return JSON.stringify(currentVersion[field]) !== JSON.stringify(previousVersion[field]);
  };

  // Get a list of changed fields between two versions
  const getChangedFields = (currentVersion: Record<string, unknown>, previousVersion: Record<string, unknown>) => {
    const fields = ["title", "description", "status", "startDate", "endDate", "isAllDay"];
    return fields.filter((field) => hasFieldChanged(field, currentVersion, previousVersion));
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  // Use Portal to ensure the dialog is rendered at the root level
  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
        }
      }}
    >
      <DialogContent
        bg={"transparent"}
        color={"brand.4"}
        height={"90vh"}
        width={"90vw"}
        maxH={"90vh"}
        maxW={"90vw"}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogBody
          height={"90vh"}
          width={"90vw"}
          p={0}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Box
            bg={"#0d1117"}
            color={"#e6edf3"}
            height={"90vh"}
            width={"90vw"}
            p={6}
            overflowY="auto"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              mb={6}
              pb={2}
              borderBottomWidth="1px"
              borderColor="gray.700"
            >
              <Flex alignItems="center">
                <FaHistory size={20} />
                <Heading size="lg" ml={2}>
                  Task Change History
                </Heading>
              </Flex>
              <Button
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                size="sm"
                borderRadius="md"
              >
                Close
              </Button>
            </Flex>

            {isLoading ? (
              <Text>Loading change history...</Text>
            ) : versions.length <= 1 ? (
              <Flex direction="column" alignItems="center" justifyContent="center" h="50vh" color="gray.400">
                <FaHistory size={40} />
                <Text mt={4} fontSize="lg">
                  No changes recorded for this task
                </Text>
              </Flex>
            ) : (
              <VStack gap={6} align="stretch">
                {versions.map((version, index) => {
                  // For each version, we want to show what changed from the next version in history
                  const nextVersionInHistory = index < versions.length - 1 ? versions[index + 1] : null;

                  // Get fields that changed between this version and the next one in history
                  const changedFields = nextVersionInHistory
                    ? getChangedFields(nextVersionInHistory, version)
                    : ["title", "description", "status", "startDate", "endDate", "isAllDay"];

                  return (
                    <Box
                      key={index}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="gray.700"
                      bg="#161b22"
                      overflow="hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Flex
                        justifyContent="space-between"
                        alignItems="center"
                        bg="#0d1117"
                        p={3}
                        borderBottomWidth="1px"
                        borderColor="gray.700"
                      >
                        <Flex alignItems="center">
                          <Badge
                            colorScheme={index === 0 ? "green" : index === versions.length - 1 ? "purple" : "blue"}
                            fontSize="0.8em"
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {index === 0
                              ? "Current Version"
                              : index === versions.length - 1
                                ? "Original Version"
                                : `Previous Version ${versions.length - index}`}
                          </Badge>
                          <Text ml={3} fontWeight="medium" fontSize="sm">
                            {formatDate(version.date)}
                          </Text>
                        </Flex>

                        {index > 0 && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              console.log("Revert button clicked for index:", index);
                              handleRevertToVersion(index);
                            }}
                            variant="outline"
                            bg="brand.4"
                            _hover={{ bg: "brand.3", color: "white" }}
                          >
                            Revert to this version
                          </Button>
                        )}
                      </Flex>

                      <Box p={4}>
                        <VStack gap={4} align="stretch">
                          {/* Only show fields that changed */}
                          {changedFields.length === 0 ? (
                            <Text fontStyle="italic" color="gray.500">
                              No changes in this version
                            </Text>
                          ) : (
                            <>
                              {changedFields.includes("title") && (
                                <Box>
                                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                                    Task Title:
                                  </Text>
                                  <Box
                                    p={3}
                                    borderRadius="md"
                                    bg="rgba(0,0,0,0.5)"
                                    borderWidth="1px"
                                    borderColor="gray.700"
                                  >
                                    <Text fontFamily="monospace">{version.title}</Text>
                                  </Box>
                                </Box>
                              )}

                              {/* Task Status */}
                              {changedFields.includes("status") && (
                                <Box>
                                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                                    Status:
                                  </Text>
                                  <Box
                                    p={3}
                                    borderRadius="md"
                                    bg="rgba(0,0,0,0.5)"
                                    borderWidth="1px"
                                    borderColor="gray.700"
                                  >
                                    <Badge colorScheme={version.status ? "green" : "red"}>
                                      {version.status ? "Completed" : "Not Completed"}
                                    </Badge>
                                  </Box>
                                </Box>
                              )}

                              {/* Task Schedule - only show if any schedule-related field changed */}
                              {(changedFields.includes("startDate") ||
                                changedFields.includes("endDate") ||
                                changedFields.includes("isAllDay")) && (
                                  <Box>
                                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                                      Schedule:
                                    </Text>
                                    <Box
                                      p={3}
                                      borderRadius="md"
                                      bg="rgba(0,0,0,0.5)"
                                      borderWidth="1px"
                                      borderColor="gray.700"
                                    >
                                      <VStack align="start" gap={1}>
                                        {changedFields.includes("isAllDay") && (
                                          <Text fontFamily="monospace">
                                            All Day: <Badge>{version.isAllDay ? "Yes" : "No"}</Badge>
                                          </Text>
                                        )}
                                        {changedFields.includes("startDate") && (
                                          <Text fontFamily="monospace">Start: {formatDateTime(version.startDate)}</Text>
                                        )}
                                        {changedFields.includes("endDate") && (
                                          <Text fontFamily="monospace">End: {formatDateTime(version.endDate)}</Text>
                                        )}
                                      </VStack>
                                    </Box>
                                  </Box>
                                )}

                              {/* Task Description */}
                              {changedFields.includes("description") && (
                                <Box>
                                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                                    Description:
                                  </Text>
                                  <Box
                                    p={3}
                                    borderRadius="md"
                                    bg="rgba(0,0,0,0.5)"
                                    borderWidth="1px"
                                    borderColor="gray.700"
                                    maxHeight="200px"
                                    overflowY="auto"
                                    fontFamily="monospace"
                                    fontSize="sm"
                                    whiteSpace="pre-wrap"
                                  >
                                    {version.description || "No description"}
                                  </Box>
                                </Box>
                              )}
                            </>
                          )}
                        </VStack>
                      </Box>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default TaskChangelog;
