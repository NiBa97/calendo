import { useEffect, useState } from "react";
import { getPb } from "../pocketbaseUtils";
import { FaShareAlt, FaSearch, FaChevronRight } from "react-icons/fa";
import { Box, Input, Text, Flex, Portal, Menu, HStack } from "@chakra-ui/react";
import { useNotes } from "../contexts/note-context";
import { useTasks } from "../features/tasks/contexts/task-context";

interface ShareMenuProps {
  objectId: string;
  objectType: "task" | "note";
  currentUsers: string[];

  contentDialogRef?: React.MutableRefObject<HTMLDivElement | null> | null;
}
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
export const ShareMenu: React.FC<ShareMenuProps> = ({
  objectId,
  objectType,
  currentUsers,
  contentDialogRef = null,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { updateTask } = useTasks();
  const { updateNote } = useNotes();
  const pb = getPb();
  useEffect(() => {
    setIsLoading(true);
    pb.collection("connection")
      .getFullList({
        filter: `confirmed = true`,
        expand: "user1,user2",
      })
      .then((res) => {
        const currentUserId = pb.authStore.model?.id;
        const connectedUsers: User[] = [];

        res.forEach((connection) => {
          const user1 = connection.expand?.user1;
          const user2 = connection.expand?.user2;

          if (user1 && user1.id !== currentUserId) {
            connectedUsers.push({
              id: user1.id,
              name: user1.name || user1.email,
              email: user1.email,
              avatar: user1.avatar,
            });
          }

          if (user2 && user2.id !== currentUserId) {
            connectedUsers.push({
              id: user2.id,
              name: user2.name || user2.email,
              email: user2.email,
              avatar: user2.avatar,
            });
          }
        });

        const uniqueUsers = connectedUsers.filter(
          (user, index, self) => index === self.findIndex((u) => u.id === user.id)
        );

        setUsers(uniqueUsers);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load connections:", error);
        setIsLoading(false);
      });
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aIsShared = currentUsers.includes(a.id);
    const bIsShared = currentUsers.includes(b.id);

    if (aIsShared && !bIsShared) return -1;
    if (!aIsShared && bIsShared) return 1;
    return 0;
  });

  const handleUserSelect = async (userId: string) => {
    try {
      setIsLoading(true);
      let updatedUsers = currentUsers;
      if (currentUsers.includes(userId)) {
        updatedUsers = currentUsers.filter((id) => id !== userId);
      } else {
        updatedUsers = [...currentUsers, userId];
      }
      if (objectType === "task") {
        await updateTask(objectId, { user: updatedUsers });
      } else if (objectType === "note") {
        await updateNote(objectId, { user: updatedUsers });
      }
    } catch (error) {
      console.error("Failed to update sharing:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Menu.Root positioning={{ placement: "right-start", gutter: 2 }}>
      <Menu.TriggerItem asChild>
        <Flex justifyContent={"space-between"}>
          <HStack>
            <FaShareAlt style={{ marginRight: "8px" }} /> Share{" "}
          </HStack>
          <FaChevronRight />
        </Flex>
      </Menu.TriggerItem>

      <Portal container={contentDialogRef ?? undefined}>
        <Menu.Positioner>
          <Menu.Content>
            <Box position="relative" mb={2}>
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                pr="2rem"
                bg="brand.1"
                color="brand.4"
                borderColor="brand.3"
                _hover={{ borderColor: "brand.4" }}
                _focus={{ borderColor: "brand.4" }}
                onClick={(e) => e.stopPropagation()}
              />
              <Box position="absolute" right="0.5rem" top="50%" transform="translateY(-50%)">
                <FaSearch color="var(--chakra-colors-brand-3)" />
              </Box>
            </Box>
            {isLoading ? (
              <Text p={2}>Loading users...</Text>
            ) : sortedUsers.length === 0 ? (
              <Text p={2}>No users found</Text>
            ) : (
              sortedUsers.map((user) => {
                const isShared = currentUsers.includes(user.id);
                return (
                  <Menu.Item key={user.id} value={user.id} onClick={() => handleUserSelect(user.id)}>
                    <Flex align="center" justify="space-between" width="100%">
                      <Flex align="center">
                        <Box
                          bg={isShared ? "green.500" : "brand.3"}
                          borderRadius="full"
                          width="24px"
                          height="24px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mr={2}
                          color="white"
                          fontSize="sm"
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">
                            {user.name}
                          </Text>
                          <Text fontSize="xs" color="brand.3">
                            {user.email}
                          </Text>
                        </Box>
                      </Flex>
                      {isShared && (
                        <Box
                          bg="green.100"
                          color="green.700"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight="medium"
                        >
                          Shared
                        </Box>
                      )}
                    </Flex>
                  </Menu.Item>
                );
              })
            )}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};
