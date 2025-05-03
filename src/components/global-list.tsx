import React, { useState, useEffect } from "react";
import { Filter } from "../lib/filters";
import { getTasks, getNotes } from "../services/pocketBaseService";
import { Task, Note } from "../types";
import { Box, Flex, GridItem, Icon, Text } from "@chakra-ui/react";
import { useTasks } from "../contexts/task-context";
import { useNotes } from "../contexts/note-context";
import { Grid } from "@chakra-ui/react";
import TaskCheckbox from "./ui/task-checkbox";
import { FaUserFriends } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import TitlePreview from "./ui/title-preview";
import { TagBadges } from "./ui/tag-badges";

// Define props for the component
interface GlobalListProps {
    filter: Filter;
    onSelectionChange: (selectedIds: string[]) => void;
}

const isTask = (item: Task | Note): item is Task => {
    return 'isAllDay' in item;
};

const GlobalList: React.FC<GlobalListProps> = ({ filter, onSelectionChange }) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    console.log(selectedItems);
    const [allItems, setAllItems] = useState<(Task | Note)[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let fetchedTasks: Task[] = [];
                let fetchedNotes: Note[] = [];

                if (filter.type === 'tasks' || filter.type === 'all') {
                    fetchedTasks = await getTasks(filter);
                }

                if (filter.type === 'notes' || filter.type === 'all') {
                    fetchedNotes = await getNotes(filter);
                }

                let combinedItems: (Task | Note)[] = [...fetchedTasks, ...fetchedNotes];

                if (filter.type === 'all') {
                    combinedItems.sort((a, b) => b.created.getTime() - a.created.getTime());
                }

                setAllItems(combinedItems);
                setSelectedItems([]);
                onSelectionChange([]);

            } catch (err) {
                console.error("Error fetching data in GlobalList:", err);
                setError("Failed to load items.");
                setAllItems([]);
                setSelectedItems([]);
                onSelectionChange([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [filter, onSelectionChange]);




    return (
        <div>
            <h1>Global List</h1>
            {isLoading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <ul>
                {allItems.map(item => {
                    return <ListItem key={item.id} item={item} />
                })}
            </ul>
            {!isLoading && allItems.length === 0 && !error && <p>No items found.</p>}
        </div>
    );
};



const ListItem = ({ item }: { item: Task | Note }) => {
    const {setModalTask, updateTask } = useTasks();
    const { setSelectedNote } = useNotes();
    const [isHovered, setIsHovered] = useState(false);
  
    const handleTaskStatusChange = async (task: Task, newStatus: boolean) => {
      if (task) {
        await updateTask(task.id, {
          ...task,
          status: newStatus,
        });
      }
    };
  
    // Handle item click - open appropriate popup
    const handleItemClick = (item: Note | Task) => {
      if (isTask(item)) {
          setModalTask(item);
      } else {
        setSelectedNote(item);
      }
    };
  
    return (
      <Grid
        templateColumns="20px 1fr 80px 150px"
        gap={4}
        px={4}
        py={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        _hover={{ bg: "gray.50" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        alignItems="center"
      >
        <GridItem>
          {isTask(item) ? (
            <TaskCheckbox
              checked={item.status}
              onChange={(e) => handleTaskStatusChange(item, e)}
              onClick={(e) => e.stopPropagation()}
              colorScheme={item.status ? "green" : "gray"}
            />
          ) : (
            <Icon as={FaBook} color="blue.500" boxSize={5} />
          )}
        </GridItem>
        <GridItem>
          <Flex>
            <TitlePreview
              title={item.title}
              onClick={() => handleItemClick(item)}
              lineThrough={item.status}
              contrast={isHovered ? "dark" : "bright"}
              mr={2}
              _hover={{ textDecoration: "underline", cursor: "pointer" }}
            />
            {item.tags.length > 0 && (
              <Box mt={1}>
                <TagBadges tagIds={item.tags} size="sm" />
              </Box>
            )}
          </Flex>
          <Text color="gray.600" fontSize="xs">
            Created {formatDate(item.created)}
          </Text>
        </GridItem>
        <GridItem>
          {item.user.length > 1 && <Icon as={FaUserFriends} color="green.500" boxSize={5} aria-label="Shared with others" />}
        </GridItem>
        <GridItem color="gray.600">{}</GridItem>
      </Grid>
    );
  };
  
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
export default GlobalList;