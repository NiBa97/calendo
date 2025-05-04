import { Box, Button, Flex, HStack, Icon, IconButton, Input, Text } from "@chakra-ui/react"
import { FaFloppyDisk, FaPlus, FaStar, FaTrash } from "react-icons/fa6"
import { useEffect, useRef, useState } from "react"
import { Filter } from "../lib/filters"
import { FaTimes } from "react-icons/fa";

interface PinnedQuery {
    id: string;
    name: string;
    filter: Filter;
}

export const PinnedQueries = ({ currentFilter, setCurrentFilter }: { currentFilter: Filter, setCurrentFilter: (filter: Filter) => void }) => {
    const [showPinnedQueryInput, setShowPinnedQueryInput] = useState(false);
    const [pinnedQueries, setPinnedQueries] = useState<PinnedQuery[]>([]);
    const queryNameInputRef = useRef<HTMLInputElement>(null);

    const handleSavePinnedQuery = () => {
        const name = queryNameInputRef.current?.value?.trim();
        if (!name) {
            return;
        }
        setShowPinnedQueryInput(false);
        const newQuery: PinnedQuery = {
            id: Date.now().toString(),
            name: name,
            filter: currentFilter,
        };
        setPinnedQueries((prev) => [...prev, newQuery]);
        if (queryNameInputRef.current) {
            queryNameInputRef.current.value = '';
        }
    }

    useEffect(() => {
        if (pinnedQueries.length > 0) {
            localStorage.setItem("pinnedQueries", JSON.stringify(pinnedQueries));
        }
    }, [pinnedQueries]);

    const handleDeletePinnedQuery = (id: string) => {
        setPinnedQueries((prev) => prev.filter((q) => q.id !== id));
        if (pinnedQueries.length === 0) {
            localStorage.removeItem("pinnedQueries");
        }
    }

    useEffect(() => {
        try {
            const savedQueries = localStorage.getItem("pinnedQueries");
            if (savedQueries) {
                const queries = JSON.parse(savedQueries);
                setPinnedQueries(queries);
            }
        } catch (error) {
            console.error("Error loading pinned queries:", error);
            setPinnedQueries([]);
            localStorage.removeItem("pinnedQueries");
        }
    }, []);

    return (
        <Flex flexDirection="column" gap={2}>
            <Flex justifyContent="space-between" alignItems="center" >
                <Text>Pinned Queries ({pinnedQueries.length})</Text>
                <Button onClick={() => setShowPinnedQueryInput(true)}>
                    <FaPlus />
                    Add Query
                </Button>
            </Flex>
            <Flex flexWrap="wrap" gap={2} mb={2}>
                {pinnedQueries.map((query) => (
                    <PinnedQueryItem key={query.id} query={query} setCurrentFilter={setCurrentFilter} handleDeletePinnedQuery={handleDeletePinnedQuery} />
                ))}
                {showPinnedQueryInput && (
                    <HStack
                        bg="gray.100"
                        p={2}
                        borderRadius="md"
                        align="center"
                        _hover={{ bg: "gray.200" }}
                        cursor="pointer"
                    >
                        <Input ref={queryNameInputRef} type="text" placeholder="Query Name" autoFocus color="gray.700" />
                        <Button onClick={handleSavePinnedQuery} size="xs"><FaFloppyDisk /></Button>
                        <Button variant="ghost" size="xs" onClick={() => setShowPinnedQueryInput(false)}><FaTimes /></Button>
                    </HStack>
                )}
            </Flex>


        </Flex>
    )
}


const PinnedQueryItem = ({ query, setCurrentFilter, handleDeletePinnedQuery }: { query: PinnedQuery, setCurrentFilter: (filter: Filter) => void, handleDeletePinnedQuery: (id: string) => void }) => {
    return (
        <HStack
            key={query.id}
            bg="gray.100"
            p={2}
            borderRadius="md"
            align="center"
            _hover={{ bg: "gray.200" }}
            cursor="pointer"
            onClick={() => setCurrentFilter(query.filter)}
            w="auto"
            justifyContent="space-between"
        >
            <Icon as={FaStar} color="yellow.500" mr={2} />
            <Text fontSize="sm" fontWeight="medium" color="gray.700">{query.name}</Text>
            <Box>
                <IconButton
                    aria-label="Delete pinned query"
                    size="xs"
                    variant="ghost"
                    ml={2}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleDeletePinnedQuery(query.id);
                    }}
                    _hover={{ color: "red.500" }}
                >
                    <FaTrash />
                </IconButton>
            </Box>
        </HStack>
    )
}