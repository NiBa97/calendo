"use client";

import React, { useState, useEffect } from "react";
import { useTasks } from "../_contexts/task-context";
import { type Task } from "@prisma/client";
import {
  InputGroup,
  InputLeftElement,
  Input,
  Checkbox,
  Textarea,
  Flex,
  Button,
  InputRightElement,
  Icon,
  Link,
  useToast,
} from "@chakra-ui/react";
import { FaXmark } from "react-icons/fa6";
import { ForwardRefEditor } from "./bypass-editor";
import { type MDXEditorMethods } from "@mdxeditor/editor";

const TempTask = ({ task }: { task: Task }) => {
  const ref = React.useRef<MDXEditorMethods>(null);
  const { updateTask } = useTasks();
  const [name, setName] = useState(task?.name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? false);
  const [startDate, setStartDate] = useState(task?.startDate ? new Date(task.startDate) : null);
  const [endDate, setEndDate] = useState(task?.endDate ? new Date(task.endDate) : null);
  const [isAllDay, setIsAllDay] = useState(task?.isAllDay ?? false);
  const toast = useToast();
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
      updateTask(task.id, { status: status })
        .then(() => {
          toast({
            title: "Task created",
            description: status ? "Task marked as completed" : "Task marked as open",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        })
        .catch((error: Error) => {
          toast({
            title: "Error",
            description: error.message || "An error occurred completing the task.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  }, [status, task, toast, updateTask]);

  const handleSubmit = async (_e: React.FormEvent) => {
    await updateTask(task.id, { name, description, status, startDate, endDate, isAllDay });
  };

  return (
    <Flex direction="column" width="100%" height="100%">
      <InputGroup size="md" width={"100%"}>
        <InputLeftElement bg={"gray.800"}>
          <Checkbox isChecked={status} onChange={() => setStatus(!status)}></Checkbox>
        </InputLeftElement>
        <Input
          placeholder="Add new unscheduled task"
          bg={"gray.800"}
          border={"none"}
          type="text"
          value={name}
          _focus={{ border: "none", outline: "none", boxShadow: "none" }}
          onChange={(e) => setName(e.target.value)}
        />
        <InputRightElement bg={"gray.800"}>
          <Link href="/webapp/">
            <Icon size={20} as={FaXmark}></Icon>
          </Link>
        </InputRightElement>
      </InputGroup>
      <ForwardRefEditor markdown={description} onChange={(markdown) => setDescription(markdown)} />
      <Textarea
        outline={"none"}
        flex="1"
        border={"none"}
        borderRadius={0}
        _focus={{ border: "none", outline: "none", boxShadow: "none" }}
        bg={"gray.800"}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Flex justifyContent={"space-between"} alignItems={"center"} px={4}>
        <div>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate ? startDate.toISOString().substring(0, 10) : ""}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            End Date:
            <input
              type="date"
              value={endDate ? endDate.toISOString().substring(0, 10) : ""}
              onChange={(e) => setEndDate(new Date(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            All Day:
            <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
          </label>
        </div>
        <Button type="submit" onClick={handleSubmit} variant={"ghost"} float={"right"} color={"gray.300"}>
          Save
        </Button>
      </Flex>
    </Flex>
  );
};
export default TempTask;
