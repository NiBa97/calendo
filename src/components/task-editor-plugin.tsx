import { currentSelection$, activeEditor$, type JsxComponentDescriptor, useCellValues } from "@mdxeditor/editor";

import { usePublisher, insertJsx$ } from "@mdxeditor/editor";
import { Button, Modal, ModalOverlay, ModalContent, ModalBody, Input, VStack, Text, Box } from "@chakra-ui/react";
import { FaHashtag } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTasks } from "~/contexts/task-context";
import { type Task } from "@prisma/client";
import TaskRef from "./task-ref";
import { $getSelection, $isRangeSelection, $isTextNode } from "lexical";

// Task selector modal component
const TaskSelector = ({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (task: Task) => void;
}) => {
  const { tasks } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  useEffect(() => {
    setFilteredTasks(tasks.filter((task) => task.name.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [searchTerm, tasks]);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="brand.1" color="brand.4">
        <ModalBody p={4}>
          <VStack spacing={4}>
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="brand.2"
            />
            <VStack spacing={2} width="100%" maxHeight="400px" overflowY="auto">
              {filteredTasks.map((task) => (
                <Box
                  key={task.id}
                  p={2}
                  width="100%"
                  bg="brand.2"
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => {
                    onSelect(task);
                    onClose();
                  }}
                  _hover={{ bg: "brand.3" }}
                >
                  <Text>{task.name}</Text>
                </Box>
              ))}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
// Toolbar button component
export const InsertTaskButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const insertJsx = usePublisher(insertJsx$);
  const handleTaskSelect = (task: Task) => {
    insertJsx({
      name: "TaskRef",
      kind: "text",
      props: {
        taskId: task.id,
      },
    });
  };
  return (
    <>
      <Button onClick={() => setIsOpen(true)} leftIcon={<FaHashtag />} size="sm">
        Insert Task
      </Button>
      <TaskSelector isOpen={isOpen} onClose={() => setIsOpen(false)} onSelect={handleTaskSelect} />
    </>
  );
};

// JSX Component Descriptor
export const taskRefComponentDescriptor: JsxComponentDescriptor = {
  name: "TaskRef",
  kind: "text",
  source: "~/components/task-ref.tsx",
  props: [{ name: "taskId", type: "string" }],
  hasChildren: false,
  defaultExport: true,
  Editor: (props) => {
    if (props?.mdastNode?.attributes[0]?.value) {
      return <TaskRef taskId={props.mdastNode.attributes[0].value as string} />;
    } else {
      return <></>;
    }
  },
};

// Toolbar button component
export const CreateTaskButton = () => {
  const { createTask } = useTasks();
  const insertJsx = usePublisher(insertJsx$);
  // const selection = useCellValue(currentSelection$);
  const [currentSelection, activeEditor] = useCellValues(currentSelection$, activeEditor$);

  if (!currentSelection || !activeEditor) return null;

  // const insertJsx = usePublisher(insertJsx$);
  const handleTaskSelect = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        createTask({ name: selection.getTextContent() })
          .then((task) => {
            insertJsx({
              name: "TaskRef",
              kind: "text",
              props: {
                taskId: task.id,
              },
            });
          })
          .catch((error) => {
            console.error("Error creating task:", error);
          });
      }
    });

    // console.log("test", selection?.getTextContent());
    // insertJsx({
    //   name: "TaskRef",
    //   kind: "text",
    //   props: {
    //     taskId: task.id,
    //   },
    // });
  };
  return (
    <>
      <Button onClick={handleTaskSelect} leftIcon={<FaHashtag />} size="sm">
        Create Task
      </Button>
    </>
  );
};
