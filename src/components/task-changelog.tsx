import { TaskHistory } from "@prisma/client";
import { api } from "~/trpc/react";
import {
  Button,
  Box,
  ModalCloseButton,
  Flex,
  List,
  ListItem,
  Divider,
  useToast,
  Popover,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverCloseButton,
} from "@chakra-ui/react";
import { FaHistory } from "react-icons/fa";
import { useTasks } from "~/contexts/task-context";
import { useState } from "react";
import { set } from "zod";

const compareIsAllDay = (newVersion: TaskHistory, oldVersion: TaskHistory) => {
  if (newVersion.isAllDay === oldVersion.isAllDay) return "";
  if (newVersion.isAllDay) return <ListItem>Task was set to all-day</ListItem>;
  return <ListItem>Task was set to non-all-day</ListItem>;
};

const compareStatus = (newVersion: TaskHistory, oldVersion: TaskHistory) => {
  if (newVersion.status === oldVersion.status) return "";
  if (newVersion.status) return <ListItem>Task completed</ListItem>;
  return <ListItem>Task was set to incomplete</ListItem>;
};

const compareName = (newVersion: TaskHistory, oldVersion: TaskHistory) => {
  if (newVersion.name === oldVersion.name) return "";
  return <ListItem>Task was renamed to &quot;{newVersion.name}&quot;</ListItem>;
};

const compareDescription = (newVersion: TaskHistory, oldVersion: TaskHistory) => {
  if (newVersion.description === oldVersion.description) return "";
  return <ListItem>Task description was updated</ListItem>;
};

const compareStartDate = (newVersion: TaskHistory, oldVersion: TaskHistory) => {
  if (newVersion.startDate?.getTime() === oldVersion.startDate?.getTime()) return "";
  return <ListItem>Task start date was changed to {newVersion.startDate?.toLocaleString()}</ListItem>;
};

const compareEndDate = (newVersion: TaskHistory, oldVersion: TaskHistory) => {
  if (newVersion.endDate?.getTime() === oldVersion.endDate?.getTime()) return "";
  return <ListItem>Task end date was changed to {newVersion.endDate?.toLocaleString()}</ListItem>;
};

const compareGroup = (newVersion: TaskHistory, oldVersion: TaskHistory) => {
  if (newVersion.groupId === oldVersion.groupId) return "";
  return <ListItem>Task group was changed to {newVersion.groupId}</ListItem>;
};

const ChangelogComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      direction="column"
      position={"relative"}
      gap={1}
      _before={{
        display: "block",
        content: '""',
        height: "100%",
        width: "3px",
        backgroundColor: "brand.2",
        position: "absolute",
      }}
    >
      {children}
    </Flex>
  );
};

const ChangelogStart = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      paddingLeft={4}
      position={"relative"}
      _before={{
        content: '""',
        height: "16px",
        width: "16px",
        backgroundColor: "red",
        position: "absolute",
        left: "-6px",
        top: "3px",
      }}
    >
      {children}
    </Box>
  );
};

const ChangelogItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      direction={"column"}
      gap={1}
      paddingLeft={4}
      position={"relative"}
      _before={{
        content: '""',
        height: "16px",
        width: "16px",
        backgroundColor: "brand.3",
        borderRadius: "50%",
        position: "absolute",
        left: "-6px",
        top: "3px",
      }}
    >
      {children}
    </Flex>
  );
};

const TaskChangelog = ({ taskId }: { taskId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { restoreTask } = useTasks();
  const { data } = api.task.getHistoric.useQuery({
    id: taskId,
  });
  // if (!data) return <Box>No history found</Box>;

  const restoreTaskFromHistory = (history: TaskHistory) => {
    restoreTask(history.taskId, history.changedAt, {
      name: history.name,
      description: history.description,
      startDate: history.startDate,
      endDate: history.endDate,
      isAllDay: history.isAllDay,
      status: history.status,
      groupId: history.groupId,
    })
      .then(() => {
        setIsOpen(false);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  return (
    <Box position={"relative"}>
      <Button onClick={() => setIsOpen(!isOpen)} isDisabled={!data}>
        <FaHistory />
      </Button>
      {data && (
        <Flex
          hidden={!isOpen}
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          justifyContent="center"
          alignItems="center"
          zIndex="popover"
          bg={"blackAlpha.800"}
        >
          <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} closeOnBlur={true}>
            <PopoverContent
              height={"90vh"}
              width={"90vw"}
              maxH={"90vh"}
              maxW={"90vw"}
              display="flex"
              top="5vh"
              left="5vw"
              backgroundColor={"brand.1"}
              border={"transparent"}
            >
              <PopoverCloseButton size={"lg"}></PopoverCloseButton>
              <PopoverHeader fontSize={"lg"}>History of &quot;{data[0]?.name ?? "Untitled"}&quot;</PopoverHeader>
              <PopoverBody overflow={"auto"} pointerEvents={"visible"}>
                <ChangelogComponent>
                  {data.map((newVersion, index) => {
                    const oldVersion = data[index + 1] ?? null;
                    if (!oldVersion)
                      return (
                        <ChangelogStart key={newVersion.historyId}>
                          {newVersion.changedAt.toLocaleString()} Task created
                        </ChangelogStart>
                      );
                    return (
                      <ChangelogItem key={newVersion.historyId}>
                        <i>Changes on {newVersion.changedAt.toLocaleString()}</i>
                        <List>
                          {compareName(newVersion, oldVersion)}
                          {compareDescription(newVersion, oldVersion)}
                          {compareStartDate(newVersion, oldVersion)}
                          {compareEndDate(newVersion, oldVersion)}
                          {compareIsAllDay(newVersion, oldVersion)}
                          {compareStatus(newVersion, oldVersion)}
                          {compareGroup(newVersion, oldVersion)}
                        </List>
                        <Button
                          w={100}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            restoreTaskFromHistory(newVersion);
                          }}
                        >
                          Restore
                        </Button>
                        <Divider color={"brand.4"} my={4} borderColor={"brand.3"} variant={"dashed"} />
                      </ChangelogItem>
                    );
                  })}
                </ChangelogComponent>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
      )}
    </Box>
  );
};

export default TaskChangelog;
