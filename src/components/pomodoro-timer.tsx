import { useState, useEffect, useRef, useCallback } from "react";
import { Box, HStack, IconButton, Input, Progress, useToast } from "@chakra-ui/react";
import { FaPlay, FaStop, FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { api } from "~/trpc/react";
import { getLocalStorage, setLocalStorage } from "~/utils/storage";

export const PomodoroTimer = () => {
  const [duration, setDuration] = useState(parseInt(getLocalStorage("pomodoro-duration", "25")));
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [pomodoroId, setPomodoroId] = useState<string | null>(null);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toast = useToast();
  const utils = api.useUtils();

  useEffect(() => {
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  const { data: activePomodoro } = api.pomodoro.getActive.useQuery(undefined, {
    refetchInterval: 15000,
  });

  const startMutation = api.pomodoro.start.useMutation();
  const stopMutation = api.pomodoro.stop.useMutation();
  const cancelMutation = api.pomodoro.cancel.useMutation();

  const handleComplete = useCallback(async () => {
    if (!pomodoroId) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      toast({
        title: "Pomodoro completed!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      if (Notification.permission === "granted") {
        new Notification("Pomodoro completed!");
      }
      if (audioRef.current) {
        void audioRef.current.play();
      }
    } catch (error) {
      toast({
        title: "Error completing pomodoro",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [pomodoroId, stopMutation, toast, utils.pomodoro.getActive]);

  useEffect(() => {
    if (activePomodoro) {
      const endTime = new Date(activePomodoro.startTime);
      endTime.setMinutes(endTime.getMinutes() + activePomodoro.duration);
      const remaining = Math.max(0, endTime.getTime() - new Date().getTime());
      setTimeLeft(Math.ceil(remaining / 1000));
      setPomodoroId(activePomodoro.id);
      setDuration(activePomodoro.duration);
    } else {
      setTimeLeft(null);
      setPomodoroId(null);
    }
  }, [activePomodoro]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      void handleComplete();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeLeft, handleComplete]);

  useEffect(() => {
    if (timeLeft !== null) {
      setProgress((timeLeft / (duration * 60)) * 100);
    } else {
      setProgress(100);
    }
  }, [timeLeft, duration]);

  const handleDurationChange = (newDuration: number) => {
    if (timeLeft !== null) return;
    const validDuration = Math.max(1, newDuration);
    setDuration(validDuration);
    setLocalStorage("pomodoro-duration", validDuration.toString());
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
      : `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      position="relative"
      bg="brand.2"
      px={4}
      py={2}
      borderRadius="md"
      overflow="hidden"
      _hover={{ "& .controls": { opacity: 1 } }}
    >
      <Progress
        value={progress}
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        borderRadius="md"
        bg="brand.1"
        height="100%"
        sx={{
          "& > div": {
            background: "brand.3",
            transition: "all 1s linear",
          },
        }}
      />
      <HStack spacing={2} position="relative" zIndex={1} className="controls">
        {timeLeft === null ? (
          <>
            <IconButton
              aria-label="Decrease duration"
              icon={<FaMinus />}
              size="sm"
              variant="ghost"
              _hover={{ bg: "brand.3" }}
              onClick={() => handleDurationChange(duration - 1)}
            />
            <Input
              value={duration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value) || duration)}
              width="60px"
              size="md"
              fontWeight="bold"
              textAlign="center"
              bg="transparent"
              border="none"
              _focus={{ border: "none", boxShadow: "none" }}
            />
            <IconButton
              aria-label="Increase duration"
              icon={<FaPlus />}
              size="sm"
              variant="ghost"
              _hover={{ bg: "brand.3" }}
              onClick={() => handleDurationChange(duration + 1)}
            />
            <IconButton
              aria-label="Start Pomodoro"
              icon={<FaPlay />}
              size="sm"
              variant="ghost"
              _hover={{ bg: "brand.3" }}
              onClick={async () => {
                try {
                  await startMutation.mutateAsync({ duration });
                  await utils.pomodoro.getActive.invalidate();
                } catch (error) {
                  toast({
                    title: "Error starting pomodoro",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  });
                }
              }}
            />
          </>
        ) : (
          <>
            <IconButton
              aria-label="Cancel Pomodoro"
              icon={<FaTrash />}
              size="sm"
              variant="ghost"
              _hover={{ bg: "brand.3" }}
              onClick={async () => {
                try {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  await cancelMutation.mutateAsync({ id: pomodoroId! });
                  await utils.pomodoro.getActive.invalidate();
                } catch (error) {
                  toast({
                    title: "Error canceling pomodoro",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  });
                }
              }}
            />
            <Box minWidth="80px" textAlign="center" fontWeight="medium">
              {formatTime(timeLeft)}
            </Box>
            <IconButton
              aria-label="Stop Pomodoro"
              icon={<FaStop />}
              size="sm"
              variant="ghost"
              _hover={{ bg: "brand.3" }}
              onClick={async () => {
                try {
                  const remaining_duration = Math.floor((duration * 60 - timeLeft) / 60);
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  if (remaining_duration === 0) {
                    await cancelMutation.mutateAsync({ id: pomodoroId! });
                  } else {
                    await stopMutation.mutateAsync({
                      id: pomodoroId!,
                      duration: remaining_duration,
                    });
                  }
                  await utils.pomodoro.getActive.invalidate();
                } catch (error) {
                  toast({
                    title: "Error stopping pomodoro",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  });
                }
              }}
            />
          </>
        )}
      </HStack>
    </Box>
  );
};
