"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { FaTimes } from "react-icons/fa";
import { useTasks } from "../contexts/task-context";
import { ParentType, type Task } from "@prisma/client";
import { InputGroup, InputLeftElement, Input, Checkbox, Flex, IconButton, Box } from "@chakra-ui/react";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import DateTimeRangeSelector from "./datetime-range-selector";
import TaskChangelog from "./task-changelog";
import AttachmentList from "./attachment-list";
import { on } from "events";
const EditorComp = dynamic(() => import("./app-editor"), { ssr: false });

const TempTask = ({
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
  const router = useRouter();
  const ref = React.useRef<MDXEditorMethods>(null);
  const { updateTask, createTask, setTemporaryTask } = useTasks();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [taskState, setTaskState] = useState({
    name: task?.name ?? "",
    description: task?.description ?? "",
    status: task?.status ?? false,
    startDate: task?.startDate ? new Date(task.startDate) : null,
    endDate: task?.endDate ? new Date(task.endDate) : null,
    isAllDay: task?.isAllDay ?? false,
  });
  const taskStateRef = useRef(taskState);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
    >
      <Box as="form" onSubmit={handleSubmit}>
        <InputGroup
          size="md"
          width={"100%"}
          borderBottom={showCloseButton ? "none" : "2px solid"}
          borderColor={"brand.2"}
        >
          <InputLeftElement bg={"brand.1"}>
            <Checkbox
              size={"lg"}
              isChecked={taskState.status}
              onChange={() => handleStatusChange(!taskState.status)}
              top={1}
              left={1}
            ></Checkbox>
          </InputLeftElement>
          <Input
            placeholder="Add new unscheduled task"
            bg={"brand.1"}
            border={"none"}
            type="text"
            size={"lg"}
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
              icon={<FaTimes />}
              bg={"brand.1"}
              onClick={onComplete}
              color={"brand.4"}
              size={"lg"}
              borderRadius={"none"}
            ></IconButton>
          )}
        </InputGroup>
      </Box>
      <EditorComp
        markdown={taskState.description}
        handleChange={handleChange}
        editorRef={ref}
        // onChange={(markdown) => handleChange("description", markdown)}
        showToolbar={showToolbar}
        parentId={task.id}
        parentType={ParentType.TASK}
      />
      <Flex
        justifyContent={"space-between"}
        alignItems={"center"}
        bg={"brand.1"}
        bottom={0}
        borderTop={"2px solid"}
        borderColor={"brand.2"}
        paddingX={2}
        paddingY={2}
      >
        <DateTimeRangeSelector task={task} />

        <TaskChangelog taskId={task.id} />
      </Flex>
      <AttachmentList parentId={task.id} parentType={ParentType.TASK} />
    </Flex>
  );
};

export default TempTask;
