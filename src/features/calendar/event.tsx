import { Flex, Text } from "@chakra-ui/react";
import moment from "moment";
import { Task } from "../tasks/type";
import { FaUsers } from "react-icons/fa";

const Event = ({ event }: { event: Task }) => {
    const isOverdue = moment(event.endDate).isBefore(moment().startOf("day")) && !event.status;

    return (
        <Flex
            width="100%"
            height="100%"
            // color={"primary"}
            bg={"backgroundSecondary"}
            borderLeft={isOverdue ? "4px solid red" : ""}
            flexDirection="column"
            justifyContent="space-between"
        >
            <Flex justifyContent="space-between" alignItems="center" width="100%" gap={1}>
                <Text
                    fontWeight={600}
                    textDecoration={event.status ? "line-through" : "none"}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    display="flex"
                    alignItems="center"
                    gap={1}
                    fontSize={"sm"}
                >
                    {event.user && event.user.length > 1 && (
                        <FaUsers size={"xs"} />
                    )}
                    {event.title}
                </Text>

                <Text fontSize={"xs"} opacity={0.9} flexShrink={0} lineHeight="1">
                    {moment(event.startDate).format("HH:mm")}
                    - {moment(event.endDate).format("HH:mm")}
                </Text>
            </Flex>

            {/* <Flex mt={1} flexWrap="wrap" gap={1}>
                {event.tags.slice(0, 3).map((tag) => (
                    <Badge
                        key={tag.id}
                        borderRadius="full"
                        px={1}
                        py={0}
                        fontSize={isSmallEvent ? "0.5em" : "0.6em"}
                        bg={backgroundColor === tag.color ? "whiteAlpha.300" : tag.color}
                        color={backgroundColor === tag.color ? textColor : getContrastColor(tag.color)}
                    >
                        {isSmallEvent && tag.name.length > 5 ? tag.name.substring(0, 3) + "..." : tag.name}
                    </Badge>
                ))}
                {eventTags.length > (isMediumEvent ? 2 : 3) && (
                    <Badge borderRadius="full" px={1} py={0} fontSize={isSmallEvent ? "0.5em" : "0.6em"} bg="blackAlpha.200">
                        +{eventTags.length - (isMediumEvent ? 2 : 3)}
                    </Badge>
                )}
            </Flex> */}
        </Flex>
    );
};

export default Event;