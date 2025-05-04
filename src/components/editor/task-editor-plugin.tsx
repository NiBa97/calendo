import { currentSelection$, activeEditor$, type JsxComponentDescriptor, useCellValues } from "@mdxeditor/editor";

import { usePublisher, insertJsx$ } from "@mdxeditor/editor";
import { Button, Input, VStack } from "@chakra-ui/react";
import { FaHashtag } from "react-icons/fa";
import { $getSelection, $isRangeSelection } from "lexical";
import { DialogBody, DialogContent, DialogRoot } from "../ui/dialog";
import { Box, Text } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useTasks } from "../../contexts/task-context";
import EditTask from "../task/task-edit";
import { Task } from "../../types";
import TaskCheckbox from "../ui/task-checkbox";
import TitlePreview from "../ui/title-preview";

interface TaskRefProps {
  taskId: string;
}

export const TaskRef = ({ taskId }: TaskRefProps) => {
  const { tasks, setModalTask, updateTask } = useTasks();
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const task = tasks.find((t) => t.id === taskId);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (!task) {
    return (
      <Box as="span" color="red.500">
        Task not found: {taskId}
      </Box>
    );
  }

  const handleCheckboxChange = (checked: boolean) => {
    void updateTask(taskId, { status: checked });
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();

    setPopupPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });

    hoverTimeoutRef.current = setTimeout(() => {
      setShowPopup(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowPopup(false);
  };

  return (
    <>
      <Box
        display="inline-flex"
        alignItems="center"
        as="span"
        bg="brand.2"
        px={2}
        py={0.5}
        borderRadius="md"
        cursor="pointer"
        onClick={() => setModalTask(task)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        _hover={{ bg: "brand.3" }}
        mx={2}
        gap={2}
      >
        <TaskCheckbox checked={task.status} onChange={() => handleCheckboxChange(!task.status)} />
        <TitlePreview title={task.title} lineThrough={task.status} />
      </Box>

      {showPopup && (
        <Box
          position="fixed"
          zIndex={1000}
          boxShadow="lg"
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
          }}
          onMouseEnter={() => setShowPopup(true)}
          onMouseLeave={() => setShowPopup(false)}
        >
          <EditTask
            task={task}
            showCloseButton={false}
            height={400}
            width={400}
            showToolbar={false}
            onComplete={() => setShowPopup(false)}
          />
        </Box>
      )}
    </>
  );
};

export default TaskRef;
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
    setFilteredTasks(tasks.filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [searchTerm, tasks]);
  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent bg="brand.1" color="brand.4">
        <DialogBody p={4}>
          <VStack gap={4}>
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="brand.2"
            />
            <VStack gap={2} width="100%" maxHeight="400px" overflowY="auto">
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
                  <Text>{task.title}</Text>
                </Box>
              ))}
            </VStack>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
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
      <Button onClick={() => setIsOpen(true)} size="sm">
        <FaHashtag />
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
        createTask({ title: selection.getTextContent() })
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
  };
  return (
    <>
      <Button onClick={handleTaskSelect} size="sm">
        <FaHashtag />
        Create Task
      </Button>
    </>
  );
};
