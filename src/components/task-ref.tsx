import { Box, Checkbox, Text } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { useTasks } from "~/contexts/task-context";
import TempTask from "./edit-task";
import { set } from "zod";

interface TaskRefProps {
  taskId: string;
}

export const TaskRef = ({ taskId }: TaskRefProps) => {
  const { tasks, setModalTask, updateTask } = useTasks();
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    void updateTask(taskId, { status: event.target.checked });
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
      >
        <Box display="inline-flex" alignItems="center" onClick={(e) => e.stopPropagation()}>
          <Checkbox size="md" isChecked={task.status} onChange={handleCheckboxChange} />
        </Box>
        <Text as="span" fontSize="sm" color="gray.500" ml={2} textDecoration={task.status ? "line-through" : "none"}>
          {task.name}
        </Text>
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
          <TempTask
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
