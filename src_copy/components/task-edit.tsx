"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaHistory, FaEllipsisV } from "react-icons/fa";
import { useTasks } from "../features/tasks/contexts/task-context";
import { Flex, Box, HStack, Portal, Menu } from "@chakra-ui/react";
import { IconActionButton } from "./ui/icon-action-button";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import { Task } from "../features/tasks/types/task.types";
import DateTimeRangeSelector from "./ui/datetime-range-selector";
import Editor from "./editor/editor";
import TaskChangelog from "./task-changelog";
import { ShareMenu } from "./share-menu";
import TitleInput from "./ui/title-input";
import TaskCheckbox from "./ui/task-checkbox";
import { TagBadges } from "./ui/tag-badges";
import { TagMenu } from "./tag-menu";
import { useIsMobile } from "../utils/responsive";

interface TaskState {
  title: string;
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
  contentDialogRef = null,
  onComplete,
}: {
  task: Task;
  height: number | string | undefined;
  width: number | string | undefined;
  onComplete?: () => void;
  showCloseButton?: boolean;
  showToolbar?: boolean;
  contentDialogRef?: React.MutableRefObject<HTMLDivElement | null> | null;
}) => {
  const ref = React.useRef<MDXEditorMethods>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { updateTask, createTask, setTemporaryTask, addTagToTask, removeTagFromTask } = useTasks();
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
  const [taskState, setTaskState] = useState<TaskState>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? false,
    startDate: task?.startDate ? new Date(task.startDate) : undefined,
    endDate: task?.endDate ? new Date(task.endDate) : undefined,
    isAllDay: task?.isAllDay ?? false,
  });
  const [localTags, setLocalTags] = useState<string[]>(task?.tags || []);
  const taskStateRef = useRef<TaskState>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? false,
    startDate: task?.startDate ? new Date(task.startDate) : undefined,
    endDate: task?.endDate ? new Date(task.endDate) : undefined,
    isAllDay: task?.isAllDay ?? false,
  });
  const [showChangelog, setShowChangelog] = useState(false);

  ref.current?.setMarkdown(taskState.description);

  // Function to handle updates from DateTimeRangeSelector
  const handleDateTimeChange = (changes: { startDate: Date; endDate: Date; isAllDay: boolean }) => {
    console.log("TaskEdit received date changes:", changes);
    taskStateRef.current = {
      ...taskStateRef.current,
      startDate: changes.startDate,
      endDate: changes.endDate,
      isAllDay: changes.isAllDay,
    };
    setTaskState((prevState) => ({
      ...prevState,
      startDate: changes.startDate,
      endDate: changes.endDate,
      isAllDay: changes.isAllDay,
    }));
    // Trigger the debounceSave mechanism in EditTask
    debounceSave();
  };

  useEffect(() => {
    setLocalTags(task?.tags || []);
  }, [task.tags]);

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
    if (!task.id && taskState.title.trim()) {
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

  const handleTagToggle = (tagId: string) => {
    const isSelected = localTags.includes(tagId);
    let updatedTags;
    if (isSelected) {
      updatedTags = localTags.filter((id) => id !== tagId);
      removeTagFromTask(task.id, tagId);
    } else {
      updatedTags = [...localTags, tagId];
      addTagToTask(task.id, tagId);
    }
    setLocalTags(updatedTags);
  };

  return (
    <>
      <Flex
        direction="column"
        width={isMobile ? "100dvw" : (width ?? "100%")}
        height={isMobile ? "100dvh" : (height ?? "100%")}
        bg={"brand.1"}
        maxHeight={isMobile ? "100vh" : "100%"}
        overflow={"hidden"}
        borderRadius={isMobile ? "none" : "md"}
        boxShadow={isMobile ? "none" : "md"}
      >
        <Box
          as="form"
          onSubmit={handleSubmit}
          width={"100%"}
          borderBottom={showCloseButton ? "none" : "2px solid"}
          borderColor={"brand.2"}
          px={isMobile ? 2 : 4}
          py={isMobile ? 2 : 0}
        >
          <HStack gap={0}>
            <TaskCheckbox checked={taskState.status} onChange={(checked) => handleStatusChange(checked)} />
            <TitleInput
              placeholder="Add task title"
              value={taskState.title}
              onChange={(value) => handleChange("title", value)}
              autoFocus={taskState.title === ""}
            />
            {showCloseButton && (
              <IconActionButton
                aria-label="Close"
                variant="close"
                onClick={onComplete}
                icon={<FaTimes />}
              />
            )}
          </HStack>
        </Box>

        {localTags.length > 0 && (
          <Box p={2} borderBottom="1px solid" borderColor="brand.2">
            <Flex align="center" justify="space-between">
              <TagBadges tagIds={localTags} onRemove={handleTagToggle} />
            </Flex>
          </Box>
        )}

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
          ref={contentRef}
        >
          <DateTimeRangeSelector task={task} onChange={handleDateTimeChange} />
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconActionButton
                aria-label="More options"
                variant="menu"
                icon={<FaEllipsisV />}
              />
            </Menu.Trigger>
            <Portal container={contentDialogRef ?? undefined}>
              <Menu.Positioner>
                <Menu.Content>

                  <ShareMenu
                    objectId={task.id}
                    objectType="task"
                    currentUsers={task.user}
                    contentDialogRef={contentDialogRef}
                  />
                  <TagMenu
                    selectedTagIds={localTags}
                    onTagToggle={handleTagToggle}
                    contentDialogRef={contentDialogRef}
                  />
                  <Menu.Separator />
                  <Menu.Item value="history" onClick={() => setShowChangelog(true)}>
                    <HStack>
                      <FaHistory style={{ marginRight: "8px" }} /> History
                    </HStack>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>
      </Flex>
      {showChangelog && <TaskChangelog isOpen={showChangelog} onClose={() => setShowChangelog(false)} taskId={task.id} />}
    </>
  );
};

export default EditTask;
