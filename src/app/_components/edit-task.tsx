"use client";

import React, { useState, useEffect } from "react";
import { useTasks } from "../_contexts/task-context";
import { type Task } from "@prisma/client";
import { InputGroup, InputLeftElement, Input, Checkbox, Flex, Button } from "@chakra-ui/react";
import { ForwardRefEditor } from "./bypass-editor";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import DateTimeRangeSelector from "./datetime-range-selector";

const TempTask = ({ task }: { task: Task }) => {
  const ref = React.useRef<MDXEditorMethods>(null);
  const { updateTask } = useTasks();
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
    await updateTask(task.id, { name, description, status, startDate, endDate, isAllDay });
  };

  return (
    <Flex direction="column" width="100%" height="100%" bg={"gray.800"} maxHeight={"100%"}>
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
        />
        {/* <InputRightElement bg={"gray.800"}>
          <Link href="/webapp/">
            <Icon size={20} as={FaXmark}></Icon>
          </Link>
        </InputRightElement> */}
      </InputGroup>
      <Flex grow={"1"} width={"100%"} flexDirection={"column"} overflowX={"hidden"}>
        <ForwardRefEditor markdown={description} onChange={(markdown) => setDescription(markdown)} />
      </Flex>
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
