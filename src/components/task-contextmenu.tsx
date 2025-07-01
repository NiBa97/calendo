import { Menu, HStack } from "@chakra-ui/react";
import CalendarPopup from "./calendar/popup";
import { FaCopy, FaStop, FaTrash } from "react-icons/fa6";
import { useTasks } from "../contexts/task-context";
import { ShareMenu } from "./share-menu";
import { TagMenu } from "./tag-menu";

const TaskContextMenu = () => {
  const { createTask, deleteTask, updateTask, contextInformation, setContextInformation, addTagToTask, removeTagFromTask } = useTasks();
  if (!contextInformation) return null;

  const handleDelete = () => {
    void deleteTask(contextInformation.task.id);
    setContextInformation(undefined);
  };

  const handleDuplicate = () => {
    void createTask({
      title: contextInformation.task.title,
      description: contextInformation.task.description ?? undefined,
      startDate: contextInformation.task.startDate ?? undefined,
      endDate: contextInformation.task.endDate ?? undefined,
      isAllDay: contextInformation.task.isAllDay,
      status: contextInformation.task.status,
    });
    setContextInformation(undefined);
  };

  const handleUnschedule = () => {
    void updateTask(contextInformation.task.id, { startDate: undefined, endDate: undefined });
    setContextInformation(undefined);
  };

  const handleTagToggle = (tagId: string) => {
    const task = contextInformation.task;
    const isSelected = task.tags?.includes(tagId) ?? false;
    if (isSelected) {
      void removeTagFromTask(task.id, tagId);
    } else {
      void addTagToTask(task.id, tagId);
    }
  };
  console.log("context", contextInformation);
  return (
    contextInformation && (
      <CalendarPopup
        onClose={() => setContextInformation(undefined)}
        position={{ top: contextInformation.y, left: contextInformation.x }}
      >
        <Menu.Root defaultOpen={true} positioning={{
          getAnchorRect() {
            return DOMRect.fromRect({ x: contextInformation.x, y: contextInformation.y, width: 1, height: 1 })
          },
        }}>
          <Menu.Positioner>
            <Menu.Content bg={"brand.1"} borderRadius={"md"} border={"none"} zIndex={999}>
              <Menu.Item value="duplicate" onClick={handleDuplicate}>
                <HStack>
                  <FaCopy /> Duplicate
                </HStack>
              </Menu.Item>
              <Menu.Item value="unschedule" onClick={handleUnschedule}>
                <HStack>
                  <FaStop /> Unschedule
                </HStack>
              </Menu.Item>
              <ShareMenu
                objectId={contextInformation.task.id}
                objectType="task"
                currentUsers={contextInformation.task.user || []}
              />
              <TagMenu
                selectedTagIds={contextInformation.task.tags || []}
                onTagToggle={handleTagToggle}
              />
              <Menu.Item value="delete" onClick={handleDelete}>
                <HStack>
                  <FaTrash /> Delete
                </HStack>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </CalendarPopup>
    )
  );
};
export default TaskContextMenu;
