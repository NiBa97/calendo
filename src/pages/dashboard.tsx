import React from 'react';
import {
    Box,
    Flex,
    Grid,
    GridItem,
    Heading,
    Text,
    Card,
    VStack,
    HStack,
    Button,
    Icon,
} from '@chakra-ui/react';
import { Calendar, Plus, Eye, Target, Clock, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
    const cardBg = 'white';

    const statsCards = [
        {
            title: 'Total Tasks',
            value: '24',
            change: '+2.5%',
            changeText: 'from last week',
            isPositive: true,
            icon: Target,
            color: 'purple',
        },
        {
            title: 'Completed Today',
            value: '8',
            change: '+12.5%',
            changeText: 'from last week',
            isPositive: true,
            icon: Target,
            color: 'purple',
        },
        {
            title: 'Pending',
            value: '16',
            change: '-4.3%',
            changeText: 'from last week',
            isPositive: false,
            icon: Clock,
            color: 'purple',
        },
        {
            title: 'Overdue',
            value: '3',
            change: '-1.2%',
            changeText: 'from last week',
            isPositive: false,
            icon: AlertCircle,
            color: 'purple',
        },
    ];

    const recentTasks = [
        {
            title: 'Review project proposal',
            time: 'Today, 2:00 PM',
        },
        {
            title: 'Update documentation',
            time: 'Tomorrow, 10:00 AM',
        },
        {
            title: 'Team standup meeting',
            time: 'Today, 9:30 AM',
        },
        {
            title: 'Bug fixes for mobile app',
            time: 'Friday, 5:00 PM',
        },
    ];

    const todaySchedule = [
        {
            title: 'Product Planning',
            time: '10:00 AM - 11:30 AM',
            color: 'purple',
        },
        {
            title: 'Design Review',
            time: '2:00 PM - 3:00 PM',
            color: 'purple',
        },
        {
            title: 'Sprint Retrospective',
            time: '4:00 PM - 5:00 PM',
            color: 'purple',
        },
    ];

    return (
        <Box minH="100vh">
            <VStack gap={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <Box>
                        <Heading size="lg" mb={2}>Dashboard</Heading>
                        <Text color="gray.600">Welcome back! Here's what's happening today.</Text>
                    </Box>
                    <HStack gap={3}>
                        <Button variant="outline">
                            <Icon as={Calendar} />
                            View Calendar
                        </Button>
                        <Button colorScheme="purple">
                            <Icon as={Plus} />
                            New Task
                        </Button>
                    </HStack>
                </Flex>

                {/* Stats Cards */}
                <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={"md"}>
                    {statsCards.map((stat, index) => (
                        <GridItem key={index}>
                            <Card.Root bg={cardBg} boxShadow="sm">
                                <Card.Body>
                                    <HStack justify="space-between" mb={4}>
                                        <Box>
                                            <Text fontSize="sm" color="gray.600" mb={1}>
                                                {stat.title}
                                            </Text>
                                            <Text fontSize="2xl" fontWeight="bold">
                                                {stat.value}
                                            </Text>
                                        </Box>
                                        <Box
                                            p={3}
                                            bg={`${stat.color}.100`}
                                            borderRadius="lg"
                                        >
                                            <Icon as={stat.icon} color={`${stat.color}.500`} />
                                        </Box>
                                    </HStack>
                                    <Text
                                        fontSize="sm"
                                        color={stat.isPositive ? 'green.500' : 'red.500'}
                                    >
                                        {stat.change} {stat.changeText}
                                    </Text>
                                </Card.Body>
                            </Card.Root>
                        </GridItem>
                    ))}
                </Grid>

                {/* Main Content */}
                <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
                    {/* Recent Tasks */}
                    <GridItem>
                        <Card.Root bg={cardBg} boxShadow="sm">
                            <Card.Body>
                                <Heading size="md" mb={4}>Recent Tasks</Heading>
                                <VStack gap={4} align="stretch">
                                    {recentTasks.map((task, index) => (
                                        <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                                            <Box flex={1}>
                                                <Text fontWeight="medium" mb={1}>{task.title}</Text>
                                                <Text fontSize="sm" color="gray.600">{task.time}</Text>
                                            </Box>

                                        </HStack>
                                    ))}
                                </VStack>
                                <Button variant="ghost" mt={4} w="full">
                                    View All Tasks
                                </Button>
                            </Card.Body>
                        </Card.Root>
                    </GridItem>

                    {/* Today's Schedule */}
                    <GridItem>
                        <Card.Root bg={cardBg} boxShadow="sm">
                            <Card.Body>
                                <HStack justify="space-between" mb={4}>
                                    <Heading size="md">Today's Schedule</Heading>
                                    <Button size="sm" variant="ghost">
                                        <Icon as={Eye} />
                                        View Calendar
                                    </Button>
                                </HStack>
                                <VStack gap={4} align="stretch">
                                    {todaySchedule.map((item, index) => (
                                        <HStack key={index} gap={3}>
                                            <Box
                                                w={3}
                                                h={3}
                                                bg={`${item.color}.500`}
                                                borderRadius="full"
                                            />
                                            <Box flex={1}>
                                                <Text fontWeight="medium">{item.title}</Text>
                                                <Text fontSize="sm" color="gray.600">{item.time}</Text>
                                            </Box>
                                        </HStack>
                                    ))}
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    </GridItem>
                </Grid>
            </VStack>
        </Box>
    );
};

export default Dashboard;