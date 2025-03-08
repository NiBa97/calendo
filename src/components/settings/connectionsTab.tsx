import { useState, useEffect } from "react";
import { Box, Flex, Input, List, ListItem, Text, Badge, IconButton, HStack, Button } from "@chakra-ui/react";
import { getPb } from "../../pocketbaseUtils";
import { FaCheck, FaX, FaTrash, FaPlus } from "react-icons/fa6";

interface Connection {
  id: string;
  user1: string;
  user2: string;
  confirmed: boolean;
  expand: {
    user1: {
      name: string;
      email: string;
    };
    user2: {
      name: string;
      email: string;
    };
  };
}

export default function ConnectionsTab() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const pb = getPb();
  const currentUserId = pb.authStore.model?.id;

  const highlightBg = "yellow.100"; //useColorModeValue("yellow.100", "yellow.700");
  const cardBg = "white"; //useColorModeValue("white", "gray.700");

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const records = (await pb.collection("connection").getList(1, 100, {
        // filter: `user1="${currentUserId}" || user2="${currentUserId}"`,
        expand: "user1,user2",
        sort: "confirmed",
      })) as { items: Connection[] };
      console.log("records, ", records);
      setConnections(records.items);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching connections:", error);
      setIsLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    await pb.collection("connection").update(id, { confirmed: true });
    fetchConnections();
  };

  const handleDelete = async (id: string) => {
    await pb.collection("connection").delete(id);
    fetchConnections();
  };

  const handleAddConnection = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      // Find user by email
      const users = await pb.collection("users").getList(1, 1, {
        filter: `email="${searchQuery}"`,
      });

      // Create connection request
      await pb.collection("connection").create({
        user1: currentUserId,
        user2: users.items[0].id,
        confirmed: false,
      });

      setSearchQuery("");
      fetchConnections();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredConnections = connections.filter((connection) => {
    const otherUser = connection.user1 === currentUserId ? connection.expand?.user2 : connection.expand?.user1;
    console.log("otherUser, ", otherUser);
    if (!otherUser) return false;

    return (
      otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const pendingConnections = filteredConnections.filter((c) => !c.confirmed);
  const confirmedConnections = filteredConnections.filter((c) => c.confirmed);

  return (
    <Flex w="full" p={4} flexDir="column" gap={4}>
      <Flex>
        <Input
          placeholder="Enter email to connect..."
          value={searchQuery}
          bg="brand.2"
          border="none"
          onChange={(e) => setSearchQuery(e.target.value)}
          borderRadius="md"
          borderRightRadius="0"
          color="white"
          _placeholder={{
            color: "white",
            opacity: 0.5,
          }}
          _focus={{
            boxShadow: "0 0 0 1px #00ADB5",
          }}
        />
        <Button
          colorScheme="blue"
          borderLeftRadius="0"
          onClick={handleAddConnection}
          bg="brand.2"
          _hover={{ bg: "brand.3", opacity: 0.9 }}
        >
          <FaPlus />
          Add
        </Button>
      </Flex>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          {filteredConnections.length > 0 ? (
            <List.Root listStyleType="none">
              {pendingConnections.map((connection) => {
                const otherUser =
                  connection.user1 === currentUserId ? connection.expand?.user2 : connection.expand?.user1;
                const needsApproval = connection.user2 === currentUserId;

                return (
                  <ListItem
                    key={connection.id}
                    p={3}
                    borderRadius="md"
                    bg={needsApproval ? highlightBg : cardBg}
                    boxShadow="sm"
                    mb={2}
                  >
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="bold">{otherUser?.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {otherUser?.email}
                        </Text>
                        <Badge colorScheme="green" borderRadius="full" ml={-1}>
                          Pending
                        </Badge>
                      </Box>

                      {needsApproval && (
                        <HStack>
                          <IconButton
                            aria-label="Confirm"
                            colorScheme="green"
                            size="sm"
                            onClick={() => handleConfirm(connection.id)}
                          >
                            <FaCheck />
                          </IconButton>
                          <IconButton
                            aria-label="Decline"
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleDelete(connection.id)}
                          >
                            <FaX />
                          </IconButton>
                        </HStack>
                      )}
                      {needsApproval !== true && (
                        <IconButton
                          aria-label="Delete"
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDelete(connection.id)}
                        >
                          <FaTrash />
                        </IconButton>
                      )}
                    </Flex>
                  </ListItem>
                );
              })}

              {confirmedConnections.map((connection) => {
                const otherUser =
                  connection.user1 === currentUserId ? connection.expand?.user2 : connection.expand?.user1;

                return (
                  <ListItem key={connection.id} p={3} borderRadius="md" bg={cardBg} boxShadow="sm" mb={2}>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="bold">{otherUser?.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {otherUser?.email}
                        </Text>
                      </Box>
                      <IconButton
                        aria-label="Delete"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(connection.id)}
                      >
                        <FaTrash />
                      </IconButton>
                    </Flex>
                  </ListItem>
                );
              })}
            </List.Root>
          ) : (
            <Text color="gray.500">No connections found</Text>
          )}
        </>
      )}
    </Flex>
  );
}
