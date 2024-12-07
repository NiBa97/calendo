import React, { useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Text,
  Button,
  useToast,
  Divider,
  Box,
  Input,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FaDownload, FaUpload } from "react-icons/fa";
import { useTasks } from "~/contexts/task-context";
import { useNotes } from "~/contexts/note-context";
import { useSession } from "next-auth/react";
import { type Task, type Note, type Tag } from "@prisma/client";
import { api } from "~/trpc/react";
interface CleanTask {
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isAllDay: boolean;
  status: boolean;
  groupId?: string | null;
}

interface CleanTag {
  name: string;
}

interface CleanNote {
  title: string;
  content?: string | null;
  tags: CleanTag[];
}

interface ExportData {
  tasks: CleanTask[];
  notes: CleanNote[];
  exportDate: string;
}

interface ImportData {
  tasks: CleanTask[];
  notes: CleanNote[];
  exportDate: string;
}

interface ImportResult {
  success: boolean;
  tasksImported: number;
  notesImported: number;
  errors: string[];
}
import Papa from "papaparse";
import moment from "moment";

interface TickTickTask {
  Title: string;
  Content: string;
  Status: string;
  "Start Date": string;
  "Due Date": string;
  "Is All Day": string;
  Tags: string;
  Timezone: string;
}

export const parseTickTickCsv = (csvContent: string) => {
  // Skip the first few lines that contain metadata
  const dataLines = csvContent.split("\n").slice(4).join("\n");

  return new Promise<TickTickTask[]>((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      delimiter: ",",
      complete: (results) => {
        // Filter out any empty rows and cast to TickTickTask
        const tasks = results.data
          .filter((row) => Object.keys(row).length > 1) // Filter out empty rows
          .map((row) => row as TickTickTask);
        resolve(tasks);
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
};

const convertTickTickToCalendo = (tickTickTasks: TickTickTask[]) => {
  const tasks: Partial<Task>[] = [];
  const notes: Partial<Note & { tags: Tag[] }>[] = [];

  tickTickTasks.forEach((task) => {
    // Convert status (0=Normal, 1=Completed, 2=Archived)
    const status = task.Status === "1" || task.Status === "2";

    // Convert dates
    const startDate = task["Start Date"] ? moment(task["Start Date"]).toDate() : undefined;
    const endDate = task["Due Date"] ? moment(task["Due Date"]).toDate() : undefined;

    // Convert tags
    const tags = task.Tags
      ? task.Tags.split(",").map((tag) => ({
          name: tag.trim(),
        }))
      : [];

    // Convert isAllDay
    const isAllDay = task["Is All Day"]?.toLowerCase() === "true";

    // Create Calendo task object
    const calendoItem = {
      name: task.Title,
      description: task.Content,
      status,
      startDate,
      endDate,
      isAllDay,
    };
    if (!task.Title) {
      console.log("Skipping...");
      console.log(task);
      return;
    }

    // If it has dates, treat as task, otherwise as note
    if (startDate || endDate) {
      tasks.push(calendoItem);
    } else {
      console.log("Skipping...");
      // notes.push({
      //   title: task.Title,
      //   content: task.Content,
      //   tags,
      // });
    }
  });

  return { tasks, notes };
};

export const importTickTickData = async (file: File) => {
  try {
    const text = await file.text();
    const tickTickTasks = await parseTickTickCsv(text);
    console.log("tickTickTasks");
    console.log(tickTickTasks);
    return convertTickTickToCalendo(tickTickTasks);
  } catch (error) {
    console.error("Error importing TickTick data:", error);
    throw error;
  }
};
export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { tasks, createTask } = useTasks();
  const { notes, createNote } = useNotes();
  const { data: session } = useSession();
  const { mutateAsync: createBulkTasks } = api.task.createBulk.useMutation();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const tickTickFileInputRef = useRef<HTMLInputElement>(null); // Add this line
  const cleanTaskForExport = (task: Task): CleanTask => {
    // Destructure and omit unused properties
    const { userId, ...cleanTask } = task;
    return cleanTask;
  };

  const cleanTagForExport = (tag: Tag): CleanTag => {
    return {
      name: tag.name,
    };
  };

  const cleanNoteForExport = (note: Note & { tags: Tag[] }): CleanNote => {
    // Destructure and omit unused properties
    const { createdAt, updatedAt, userId, ...rest } = note;

    return {
      ...rest,
      tags: note.tags.map(cleanTagForExport),
    };
  };
  const handleTickTickImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    setImporting(true);
    setImportResult(null);
    const result: ImportResult = {
      success: false,
      tasksImported: 0,
      notesImported: 0,
      errors: [],
    };

    try {
      const { tasks, notes } = await importTickTickData(file);
      console.log(tasks);
      console.log(notes);
      const taskResult = await createBulkTasks({ tasks });
      console.log(taskResult);
      return;
      // Import tasks
      for (const task of tasks) {
        try {
          const taskResult = await createBulkTasks({ tasks });
          console.log(taskResult);

          result.tasksImported = taskResult.tasksCreated;
          result.errors.push(...taskResult.errors);
        } catch (error) {
          console.log(error);
          result.errors.push(`Failed to import task: ${task.name}`);
        }
      }

      // Import notes
      for (const note of notes) {
        try {
          await createNote({
            title: note.title!,
            content: note.content ?? undefined,
            tags: note.tags,
          });
          result.notesImported++;
        } catch (error) {
          result.errors.push(`Failed to import note: ${note.title}`);
        }
      }

      result.success = true;
      toast({
        title: "TickTick Import successful",
        description: `Imported ${result.tasksImported} tasks and ${result.notesImported} notes`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      result.errors.push("Failed to parse TickTick file");
      toast({
        title: "Import failed",
        description: "There was an error importing your TickTick data. Please check the file format.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setImporting(false);
      setImportResult(result);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleExportData = () => {
    try {
      const exportData: ExportData = {
        tasks: tasks.map(cleanTaskForExport),
        notes: notes.map(cleanNoteForExport),
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `calendo-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Your data has been exported successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const validateImportData = (data: unknown): data is ImportData => {
    if (!data || typeof data !== "object") return false;

    const typedData = data as Partial<ImportData>;
    return Boolean(
      Array.isArray(typedData.tasks) && Array.isArray(typedData.notes) && typeof typedData.exportDate === "string"
    );
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    setImporting(true);
    setImportResult(null);
    const result: ImportResult = {
      success: false,
      tasksImported: 0,
      notesImported: 0,
      errors: [],
    };

    try {
      const fileContent = await file.text();
      const importData: unknown = JSON.parse(fileContent);

      if (!validateImportData(importData)) {
        throw new Error("Invalid import file format");
      }

      // Import tasks
      for (const task of importData.tasks) {
        try {
          const startDate = task.startDate ? new Date(task.startDate) : undefined;
          const endDate = task.endDate ? new Date(task.endDate) : undefined;

          await createTask({
            name: task.name,
            description: task.description ?? undefined,
            startDate,
            endDate,
            isAllDay: task.isAllDay,
            status: task.status,
          });
          result.tasksImported++;
        } catch (error) {
          result.errors.push(`Failed to import task: ${task.name}`);
        }
      }

      // Import notes
      for (const note of importData.notes) {
        try {
          await createNote({
            title: note.title,
            content: note.content ?? undefined,
            // Create tag objects for the note context
            tags: note.tags.map((tag) => ({
              id: "", // Will be generated by the database
              name: tag.name,
              userId: session.user.id,
            })),
          });
          result.notesImported++;
        } catch (error) {
          result.errors.push(`Failed to import note: ${note.title}`);
        }
      }

      result.success = true;
      toast({
        title: "Import successful",
        description: `Imported ${result.tasksImported} tasks and ${result.notesImported} notes`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      result.errors.push("Failed to parse import file");
      toast({
        title: "Import failed",
        description: "There was an error importing your data. Please check the file format.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setImporting(false);
      setImportResult(result);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Rest of the component remains the same...
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg="brand.1" color="brand.4">
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch" pb={4}>
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Data Management
              </Text>
              <Divider mb={4} borderColor="brand.2" />

              <VStack spacing={4} align="stretch">
                <Button
                  leftIcon={<FaDownload />}
                  onClick={handleExportData}
                  width="full"
                  bg="brand.2"
                  _hover={{ bg: "brand.3" }}
                >
                  Export All Data
                </Button>

                <Input type="file" accept=".json" onChange={handleImportData} ref={fileInputRef} display="none" />

                <Button
                  leftIcon={<FaUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  width="full"
                  bg="brand.2"
                  _hover={{ bg: "brand.3" }}
                  isDisabled={importing}
                >
                  Import Data
                </Button>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleTickTickImport}
                  ref={tickTickFileInputRef}
                  display="none"
                />

                <Button
                  leftIcon={<FaUpload />}
                  onClick={() => tickTickFileInputRef.current?.click()}
                  width="full"
                  bg="brand.2"
                  _hover={{ bg: "brand.3" }}
                  isDisabled={importing}
                >
                  Import from TickTick
                </Button>
                {importing && <Progress size="xs" isIndeterminate colorScheme="teal" />}

                {importResult && (
                  <Alert
                    status={importResult.success ? "success" : "error"}
                    variant="subtle"
                    flexDirection="column"
                    alignItems="start"
                    borderRadius="md"
                    bg={importResult.success ? "green.800" : "red.800"}
                  >
                    <AlertIcon />
                    <AlertTitle>
                      {importResult.success ? "Import Successful" : "Import Completed with Errors"}
                    </AlertTitle>
                    <AlertDescription>
                      <Text>Tasks imported: {importResult.tasksImported}</Text>
                      <Text>Notes imported: {importResult.notesImported}</Text>
                      {importResult.errors.length > 0 && (
                        <Box mt={2}>
                          <Text fontWeight="bold">Errors:</Text>
                          {importResult.errors.map((error, index) => (
                            <Text key={index} fontSize="sm">
                              {error}
                            </Text>
                          ))}
                        </Box>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>

              <Text fontSize="sm" color="gray.500" mt={2}>
                Export/Import all your tasks and notes as a JSON file
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
