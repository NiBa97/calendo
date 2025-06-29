import React, { useState } from "react";
import { Grid, GridItem, Flex, Text, Icon, Box } from "@chakra-ui/react";
import { Card } from "./ui/card";
import { FaBook, FaUserFriends, FaPlus } from "react-icons/fa";
import { useTasks } from "../contexts/task-context";
import { useNotes } from "../contexts/note-context";
import { TagBadges } from "./ui/tag-badges";
import TaskCheckbox from "./ui/task-checkbox";
import TitlePreview from "./ui/title-preview";
import { TagListMenu } from "./tag-list-menu";
import { Menu } from "@chakra-ui/react";
import { ListItem as ListItemType } from "../hooks/useListFilters";
import { useIsMobile } from "../utils/responsive";

interface ListItemProps {
  item: ListItemType;
  onTagClick: (tagId: string) => void;
}

const formatDate = (date: Date) => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return `today`;
  } else if (diffInDays === 1) {
    return `yesterday`;
  } else if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const ListItem: React.FC<ListItemProps> = ({ item, onTagClick }) => {
  const { tasks, setModalTask, updateTask, addTagToTask, removeTagFromTask } = useTasks();
  const { notes, setSelectedNote, addTagToNote, removeTagFromNote } = useNotes();
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  const handleTaskStatusChange = async (taskId: string, newStatus: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await updateTask(task.id, {
        ...task,
        status: newStatus,
      });
    }
  };

  // Handle item click - open appropriate popup
  const handleItemClick = (item: ListItemType) => {
    if (item.isTask) {
      // Find the task object to open in modal
      const task = tasks.find((t) => t.id === item.id);
      if (task) {
        setModalTask(task);
      }
    } else {
      // Open note in dialog
      const note = notes.find((t) => t.id === item.id);
      if (note) {
        setSelectedNote(note);
      }
    }
  };

  // Handle tag toggle for both tasks and notes
  const handleTagToggle = (tagId: string) => {
    if (item.isTask) {
      const isSelected = item.tags.includes(tagId);
      if (isSelected) {
        removeTagFromTask(item.id, tagId);
      } else {
        addTagToTask(item.id, tagId);
      }
    } else {
      const isSelected = item.tags.includes(tagId);
      if (isSelected) {
        removeTagFromNote(item.id, tagId);
      } else {
        addTagToNote(item.id, tagId);
      }
    }
  };

  return (
    <Card
      variant="flat"
      _hover={{ bg: "gray.50", cursor: "pointer" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleItemClick(item)}
      p={2}
    >
      <Grid
        templateColumns={isMobile ? "20px 1fr" : "20px 1fr 80px 150px"}
        gap={isMobile ? 2 : 4}
        alignItems="center"
      >
        <GridItem>
          {item.isTask ? (
            <TaskCheckbox
              checked={item.status}
              onChange={(e) => handleTaskStatusChange(item.id, e)}
              onClick={(e) => e.stopPropagation()}
              colorScheme={item.status ? "green" : "gray"}
            />
          ) : (
            <Icon as={FaBook} color="blue.500" boxSize={5} />
          )}
        </GridItem>
        <GridItem>
          <Flex direction="column" gap={1}>
            <TitlePreview
              title={item.title}
              lineThrough={item.status}
              contrast={isHovered ? "dark" : "bright"}
              wordBreak="break-word"
              overflow="hidden"
            />

            <Flex alignItems="center" gap={2} h={5} flexWrap="wrap">
              {item.tags.length > 0 && (
                <TagBadges tagIds={item.tags} size="sm" onClick={onTagClick} />
              )}
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Box 
                    color={isHovered ? "gray.500" : "gray.400"} 
                    _hover={{ cursor: "pointer" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaPlus size={10} />
                  </Box>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content>
                    <TagListMenu
                      selectedTagIds={item.tags}
                      onTagToggle={handleTagToggle}
                    />
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
              {isMobile && item.shared && (
                <Icon as={FaUserFriends} color="green.500" boxSize={4} aria-label="Shared with others" />
              )}
            </Flex>
            
            <Text color="gray.600" fontSize="xs">
              Created {formatDate(item.created)}
            </Text>
          </Flex>
        </GridItem>
        {!isMobile && (
          <>
            <GridItem>
              {item.shared && <Icon as={FaUserFriends} color="green.500" boxSize={5} aria-label="Shared with others" />}
            </GridItem>
            <GridItem color="gray.600">{ }</GridItem>
          </>
        )}
      </Grid>
    </Card>
  );
};