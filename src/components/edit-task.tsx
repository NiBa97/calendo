"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
// Import necessary icons and components from chakra-ui or other places
import { FaTimes } from "react-icons/fa";
import { useTasks } from "../contexts/task-context";
import { type Task } from "@prisma/client";
import { InputGroup, InputLeftElement, Input, Checkbox, Flex, Button, IconButton } from "@chakra-ui/react";
import { ForwardRefEditor } from "./bypass-editor";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import DateTimeRangeSelector from "./datetime-range-selector";

const TempTask = ({
  task,
  height = undefined,
  width = undefined,
  onSave,
  showCloseButton = true,
  showToolbar = true,
}: {
  task: Task;
  height: number | undefined;
  width: number | undefined;
  onSave?: (task: Task) => void;
  showCloseButton?: boolean;
  showToolbar?: boolean;
}) => {
  const router = useRouter();
  const ref = React.useRef<MDXEditorMethods>(null);
  const { updateTask, createTask, setTemporaryTask } = useTasks();
  const [name, setName] = useState(task?.name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? false);
  const [startDate, setStartDate] = useState(task?.startDate ? new Date(task.startDate) : null);
  const [endDate, setEndDate] = useState(task?.endDate ? new Date(task.endDate) : null);
  const [isAllDay, setIsAllDay] = useState(task?.isAllDay ?? false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setStartDate(task.startDate ? new Date(task.startDate) : null);
      setEndDate(task.endDate ? new Date(task.endDate) : null);
      setIsAllDay(task.isAllDay);
      ref.current?.setMarkdown(task.description!);
    }
  }, [task]);

  useEffect(() => {
    if (task.status !== status) {
      task.status = status;
      void updateTask(task.id, { status: status });
    }
  }, [status]);

  const handleSubmit = async (_e: React.FormEvent) => {
    if (task.id) {
      await updateTask(task.id, { name, description, status, startDate, endDate, isAllDay });
    } else {
      await createTask({ name, description, status, startDate, endDate, isAllDay });
      setTemporaryTask(null);
    }
    if (onSave) {
      onSave(task);
    }
  };

  const handleClose = () => {
    void router.push("/webapp");
  };

  return (
    <Flex direction="column" width={width ?? "100%"} height={height ?? "100%"} bg={"gray.800"} maxHeight={"100%"}>
      <InputGroup size="md" width={"100%"}>
        <InputLeftElement bg={"gray.800"}>
          <Checkbox size={"lg"} isChecked={status} onChange={() => setStatus(!status)} top={1} left={1}></Checkbox>
        </InputLeftElement>
        <Input
          placeholder="Add new unscheduled task"
          bg={"gray.800"}
          border={"none"}
          type="text"
          size={"lg"}
          fontWeight={"600"}
          value={name}
          _focus={{ border: "none", outline: "none", boxShadow: "none" }}
          onChange={(e) => setName(e.target.value)}
          borderRadius={"none"}
        />
        {showCloseButton && (
          <IconButton
            aria-label="Close"
            icon={<FaTimes />}
            bg={"gray.800"}
            onClick={handleClose}
            color={"white"}
            size={"lg"}
            borderRadius={"none"}
          ></IconButton>
        )}
      </InputGroup>
      <ForwardRefEditor
        markdown={description}
        onChange={(markdown) => setDescription(markdown)}
        showToolbar={showToolbar}
      />
      <Flex justifyContent={"space-between"} alignItems={"center"} bg={"gray.900"} bottom={0}>
        <DateTimeRangeSelector task={task} />
        <Button type="submit" onClick={handleSubmit} variant={"ghost"} float={"right"} color={"gray.300"}>
          Save
        </Button>
      </Flex>
    </Flex>
  );
};

export default TempTask;
