import Papa from "papaparse";
import moment from "moment";
import { Button, IconButton, Input, useToast } from "@chakra-ui/react";
import { FaClone, FaUpload } from "react-icons/fa";
import { useRef, useState } from "react";
import { Task } from "@prisma/client";
interface TickTickTask {
  Title: string | undefined;
  Content: string;
  Status: string;
  "Start Date": string;
  "Due Date": string;
  "Is All Day": string;
  Tags: string;
  Timezone: string;
}
import { api } from "~/trpc/react";

interface ImportResult {
  success: boolean;
  tasksImported: number;
  notesImported: number;
  errors: string[];
}
export const importTickTickData = async (file: File) => {
  try {
    const text = await file.text();
    const tickTickTasks = await parseTickTickCsv(text);
    return convertTickTickToCalendo(tickTickTasks);
  } catch (error) {
    console.error("Error importing TickTick data:", error);
    throw error;
  }
};

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
          .filter((row) => Object.keys(row as object).length > 1) // Filter out empty rows
          .map((row) => row as TickTickTask);
        resolve(tasks);
      },
      error: (error: { message: string }) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
};

const convertTickTickToCalendo = (tickTickTasks: TickTickTask[]) => {
  const tasks: {
    name: string;
    startDate?: Date;
    endDate?: Date;
    isAllDay?: boolean;
    status?: boolean;
    description?: string;
  }[] = [];

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
    const calendoItem: {
      name: string;
      startDate?: Date;
      endDate?: Date;
      isAllDay?: boolean;
      status?: boolean;
      description?: string;
    } = {
      name: task.Title!,
      description: task.Content,
      status: status,
      startDate: startDate,
      endDate: endDate,
      isAllDay: isAllDay,
    };
    if (!task.Title) {
      return;
    }

    // If it has dates, treat as task, otherwise as note
    if (startDate ?? endDate) {
      if (startDate ?? endDate) {
        tasks.push(calendoItem);
      }
    }
  });

  return { tasks };
};

interface TickTickImportProps {
  variant?: "outline" | "solid" | "ghost" | "link";
  size?: "xs" | "sm" | "md" | "lg";
  width?: string;
}

export const TickTickImport: React.FC<TickTickImportProps> = ({ variant = "solid", size = "md", width = "full" }) => {
  const tickTickFileInputRef = useRef<HTMLInputElement>(null); // Add this line
  const toast = useToast();
  const { mutateAsync: createBulkTasks } = api.task.createBulk.useMutation();

  const handleTickTickImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result: ImportResult = {
      success: false,
      tasksImported: 0,
      notesImported: 0,
      errors: [],
    };

    try {
      const { tasks } = await importTickTickData(file);
      await createBulkTasks({ tasks });

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
    }
  };
  return (
    <>
      <Input type="file" accept=".csv" onChange={handleTickTickImport} ref={tickTickFileInputRef} display="none" />

      <Button
        leftIcon={<FaUpload />}
        onClick={() => tickTickFileInputRef.current?.click()}
        width={width}
        variant={variant}
        size={size}
        bg="brand.2"
        _hover={{ bg: "brand.3" }}
      >
        Import from TickTick
      </Button>
    </>
  );
};
