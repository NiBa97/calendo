"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaHistory, FaEllipsisV } from "react-icons/fa";
import { useTasks } from "../contexts/task-context";
import { Input, Flex, IconButton, Box, HStack, Button } from "@chakra-ui/react";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import { Task } from "../types";
import DateTimeRangeSelector from "./ui/datetime-range-selector";
import { Checkbox } from "./ui/checkbox";
import Editor from "./editor/editor";
import TaskChangelog from "./task-changelog";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "./ui/menu";
import { ShareMenu } from "./share-menu";

interface TaskState {
  name: string;
  description: string;
  status: boolean;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isAllDay: boolean;
}

const EditTask = ({
  task,
  height = undefined,
  width = undefined,
  showCloseButton = true,
  showToolbar = true,
  onComplete,
}: {
  task: Task;
  height: number | string | undefined;
  width: number | string | undefined;
  onComplete?: () => void;
  showCloseButton?: boolean;
  showToolbar?: boolean;
}) => {
  const ref = React.useRef<MDXEditorMethods>(null);
  const { updateTask, createTask, setTemporaryTask } = useTasks();
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [taskState, setTaskState] = useState<TaskState>({
    name: task?.name ?? "",
    description: task?.description ?? "",
    status: task?.status ?? false,
    startDate: task?.startDate ? new Date(task.startDate) : undefined,
    endDate: task?.endDate ? new Date(task.endDate) : undefined,
    isAllDay: task?.isAllDay ?? false,
  });
  const taskStateRef = useRef<TaskState>({
    name: task?.name ?? "",
    description: task?.description ?? "",
    status: task?.status ?? false,
    startDate: task?.startDate ? new Date(task.startDate) : undefined,
    endDate: task?.endDate ? new Date(task.endDate) : undefined,
    isAllDay: task?.isAllDay ?? false,
  });
  const [showChangelog, setShowChangelog] = useState(false);

  ref.current?.setMarkdown(taskState.description);

  const handleSave = async () => {
    if (task.id) {
      await updateTask(task.id, taskStateRef.current);
    } else {
      await createTask(taskStateRef.current);
      setTemporaryTask(null);
    }
  };

  const debounceSave = () => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      void handleSave();
    }, 5000);
  };

  const handleStatusChange = (value: boolean) => {
    taskStateRef.current = { ...taskStateRef.current, status: value };
    setTaskState((prevState) => ({
      ...prevState,
      status: value,
    }));

    task.status = taskState.status;
    void updateTask(task.id, { status: value });
  };

  const handleSubmit = async () => {
    if (!task.id && taskState.name.trim()) {
      onComplete?.();
    }
  };

  const handleChange = (field: keyof Task, value: Task[keyof Task]) => {
    taskStateRef.current = { ...taskStateRef.current, [field]: value };
    setTaskState((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    debounceSave();
  };
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        void handleSave();
      }
    };
  }, [debounceTimeout, task]);
  return (
    <Flex
      direction="column"
      width={width ?? "100%"}
      height={height ?? "100%"}
      bg={"brand.1"}
      maxHeight={"100%"}
      overflow={"hidden"}
      borderRadius="md"
      boxShadow="md"
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        width={"100%"}
        borderBottom={showCloseButton ? "none" : "2px solid"}
        borderColor={"brand.2"}
        p={2}
      >
        <HStack gap={1}>
          <Checkbox
            size={"lg"}
            checked={taskState.status}
            onChange={() => handleStatusChange(!taskState.status)}
            borderColor="brand.4"
            colorScheme="teal"
            _checked={{
              bg: "brand.3",
              borderColor: "brand.4",
            }}
          ></Checkbox>
          <Input
            placeholder="Add task title"
            bg={"brand.1"}
            border={"none"}
            type="text"
            fontSize={"xl"}
            fontWeight={"600"}
            value={taskState.name}
            _focus={{ border: "none", outline: "none", boxShadow: "none" }}
            onChange={(e) => handleChange("name", e.target.value)}
            borderRadius={"none"}
            autoFocus={taskState.name === ""}
          />
          {showCloseButton && (
            <IconButton
              aria-label="Close"
              bg="brand.1"
              onClick={onComplete}
              color="brand.4"
              size="lg"
              borderRadius="none"
              _hover={{
                bg: "brand.2",
              }}
            >
              <FaTimes />
            </IconButton>
          )}
        </HStack>
      </Box>
      <Box flex="1" overflow="auto" borderBottom="2px solid" borderColor="brand.2">
        <Editor
          markdown={taskState.description}
          onChange={(content) => handleChange("description", content)}
          editorRef={ref}
          showToolbar={showToolbar}
        ></Editor>
      </Box>
      <Flex
        justifyContent={"space-between"}
        alignItems={"center"}
        bg={"brand.1"}
        bottom={0}
        borderTop={"2px solid"}
        borderColor={"brand.2"}
        p={3}
      >
        <DateTimeRangeSelector task={task} />
        <MenuRoot>
          <MenuTrigger asChild>
            <Button
              aria-label="More options"
              bg="brand.1"
              color="brand.4"
              size="lg"
              borderRadius="none"
              _hover={{ bg: "brand.2" }}
            >
              <FaEllipsisV />
            </Button>
          </MenuTrigger>
          <MenuContent zIndex={1000}>
            <MenuItem onClick={() => setShowChangelog(true)} value="history">
              <FaHistory style={{ marginRight: "8px" }} />
              View History
            </MenuItem>
            <ShareMenu objectId={task.id} objectType="task" currentUsers={task.user} />
          </MenuContent>
        </MenuRoot>
      </Flex>
      {/* <AttachmentList parentId={task.id} parentType={ParentType.TASK} /> */}
      <TaskChangelog isOpen={showChangelog} onClose={() => setShowChangelog(false)} taskId={task.id} />
    </Flex>
  );
};

export default EditTask;
