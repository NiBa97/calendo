import React, { useState, useEffect } from "react";
import { Box, Button, VStack, Text, Flex, Heading, Badge } from "@chakra-ui/react";
import { getPb } from "../pocketbaseUtils";
import { NoteChangeRecord } from "../pocketbase-types";
import DiffMatchPatch from "diff-match-patch";
import { useNotes } from "../contexts/note-context";
import { DialogBody, DialogContent, DialogRoot } from "./ui/dialog";
import { FaHistory } from "react-icons/fa";

interface NoteChangelogProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  originalContent: string;
  originalTitle: string;
}

const NoteChangelog: React.FC<NoteChangelogProps> = ({ isOpen, onClose, noteId, originalContent, originalTitle }) => {
  const [versions, setVersions] = useState<{ content: string; title?: string; date: Date }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { updateNote } = useNotes();
  const pb = getPb();

  useEffect(() => {
    if (isOpen && noteId) {
      loadChangeHistory();
    }
  }, [isOpen, noteId]);

  const loadChangeHistory = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection("noteChange").getFullList<NoteChangeRecord>({
        filter: `note="${noteId}"`,
        sort: "created",
      });

      const versionHistory = [
        {
          content: originalContent,
          title: originalTitle,
          date: new Date(),
        },
      ];

      let currentContent = originalContent;
      let currentTitle = originalTitle;
      const dmp = new DiffMatchPatch();

      for (let i = records.length - 1; i >= 0; i--) {
        const change = records[i];

        let contentChanged = false;
        let titleChanged = false;

        if (change.contentPatch) {
          const patch = dmp.patch_fromText(change.contentPatch);
          const newContent = dmp.patch_apply(patch, currentContent)[0];
          contentChanged = newContent !== currentContent;
          currentContent = newContent;
        }

        if (change.title != currentTitle) {
          titleChanged = true;
          currentTitle = change.title ?? "";
        }

        if (contentChanged || titleChanged) {
          versionHistory.push({
            content: currentContent,
            title: currentTitle,
            date: new Date(change.created ?? ""),
          });
        }
      }

      setVersions(versionHistory);
    } catch (error) {
      console.error("Error loading change history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertToVersion = async (index: number) => {
    try {
      const versionToRevert = versions[index];
      await updateNote(noteId, {
        content: versionToRevert.content,
        title: versionToRevert.title,
      });

      onClose();
    } catch (error) {
      console.error("Error reverting note:", error);
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

  const renderDiff = (currentContent: string, previousContent: string) => {
    const dmp = new DiffMatchPatch();
    const diff = dmp.diff_main(previousContent, currentContent);
    dmp.diff_cleanupSemantic(diff);

    const MAX_DIFF_LENGTH = 500;

    return (
      <Box
        p={4}
        borderRadius="md"
        bg="rgba(0,0,0,0.8)"
        maxHeight="300px"
        overflowY="auto"
        fontFamily="monospace"
        fontSize="sm"
        whiteSpace="pre-wrap"
        borderWidth="1px"
        borderColor="gray.700"
      >
        {diff.map((part, i) => {
          const [type, text] = part;

          let displayText = text;
          if (text.length > MAX_DIFF_LENGTH) {
            displayText =
              text.substring(0, MAX_DIFF_LENGTH) +
              "... [truncated, " +
              (text.length - MAX_DIFF_LENGTH) +
              " more characters]";
          }

          if (type === 1) {
            return (
              <Box
                as="span"
                key={i}
                bg="rgba(170, 0, 0, 0.2)"
                color="#fa4a4a"
                px={1}
                textDecoration="line-through"
                borderRadius="sm"
              >
                {displayText}
              </Box>
            );
          } else if (type === -1) {
            return (
              <Box as="span" key={i} bg="rgba(0, 170, 0, 0.2)" color="#4afa4a" px={1} borderRadius="sm">
                {displayText}
              </Box>
            );
          } else {
            return (
              <Box as="span" key={i}>
                {displayText}
              </Box>
            );
          }
        })}
      </Box>
    );
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
    >
      <DialogContent bg={"transparent"} color={"brand.4"} height={"90vh"} width={"90vw"} maxH={"90vh"} maxW={"90vw"}>
        <DialogBody height={"90vh"} width={"90vw"} p={0}>
          <Box bg={"#0d1117"} color={"#e6edf3"} height={"90vh"} width={"90vw"} p={6} overflowY="auto">
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
                  Note Change History
                </Heading>
              </Flex>
              <Button colorScheme="blue" onClick={onClose} size="sm" borderRadius="md">
                Close
              </Button>
            </Flex>

            {isLoading ? (
              <Text>Loading change history...</Text>
            ) : versions.length <= 1 ? (
              <Flex direction="column" alignItems="center" justifyContent="center" h="50vh" color="gray.400">
                <FaHistory size={40} />
                <Text mt={4} fontSize="lg">
                  No changes recorded for this note
                </Text>
              </Flex>
            ) : (
              <VStack gap={6} align="stretch">
                {versions.map((version, index) => (
                  <Box
                    key={index}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="gray.700"
                    bg="#161b22"
                    overflow="hidden"
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
                            ? "Latest Version"
                            : index === versions.length - 1
                            ? "Note Created"
                            : `Previous Version ${index}`}
                        </Badge>
                        <Text ml={3} fontWeight="medium" fontSize="sm">
                          {formatDate(version.date)}
                        </Text>
                      </Flex>

                      {index > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleRevertToVersion(index)}
                          variant="outline"
                          bg="brand.4"
                          _hover={{ bg: "brand.3", color: "white" }}
                        >
                          Revert to this version
                        </Button>
                      )}
                    </Flex>

                    {index < versions.length - 1 && (
                      <Box p={4}>
                        <VStack gap={4} align="stretch">
                          {version.title !== versions[index + 1].title && (
                            <Box>
                              <Text fontSize="sm" fontWeight="medium" mb={1}>
                                Title changes:
                              </Text>
                              <Box
                                p={3}
                                borderRadius="md"
                                bg="rgba(0,0,0,0.5)"
                                borderWidth="1px"
                                borderColor="gray.700"
                              >
                                <Text fontSize="sm" color="gray.400">
                                  Changed from:
                                </Text>
                                <Text fontFamily="monospace" mb={2}>
                                  {versions[index + 1].title}
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                  To:
                                </Text>
                                <Text fontFamily="monospace" color="#4afa4a">
                                  {version.title}
                                </Text>
                              </Box>
                            </Box>
                          )}

                          {version.content !== versions[index + 1].content && (
                            <Box>
                              <Text fontSize="sm" fontWeight="medium" mb={1}>
                                Content changes:
                              </Text>
                              {renderDiff(versions[index + 1].content, version.content)}
                            </Box>
                          )}
                        </VStack>
                      </Box>
                    )}

                    {index === versions.length - 1 && (
                      <Box p={4}>
                        <VStack gap={4} align="stretch">
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={1}>
                              Original Title:
                            </Text>
                            <Box p={3} borderRadius="md" bg="rgba(0,0,0,0.5)" borderWidth="1px" borderColor="gray.700">
                              <Text fontFamily="monospace">{version.title}</Text>
                            </Box>
                          </Box>

                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={1}>
                              Original Content:
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
                              {version.content}
                            </Box>
                          </Box>
                        </VStack>
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default NoteChangelog;
