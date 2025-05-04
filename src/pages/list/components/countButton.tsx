import { Button, Text } from "@chakra-ui/react";
import { Filter } from "../../../lib/filters";
import { getCollectionCount } from "../../../services/pocketBaseService";
import { useState, useEffect } from 'react';

export const CountButton = ({ title, filter, onClick, collection }: {
    title: string,
    filter: Filter,
    onClick: () => void,
    collection: string
}) => {
    const [count, setCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getCollectionCount(collection, filter)
            .then(fetchedCount => {
                setCount(fetchedCount);
            })
            .catch(error => {
                console.error(`Error fetching count for ${collection}:`, error);
                setCount(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [collection, filter]);

    return (
        <Button onClick={onClick}>
            {title}
            <Text color="gray.600" bg="gray.100" px={2} borderRadius="md">
                {isLoading ? "..." : count ?? 0}
            </Text>
        </Button>
    )
}