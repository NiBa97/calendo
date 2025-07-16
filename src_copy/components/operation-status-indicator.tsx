import { Box } from "@chakra-ui/react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { useOperationStatus } from "../contexts/operation-status-context";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const AnimatedIcon = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &.loading {
    animation: ${spin} 1s linear infinite;
  }

  &.idle,
  &.error {
    animation: ${fadeIn} 0.3s ease forwards;
  }
`;

export const OperationStatusIndicator = () => {
  const { status } = useOperationStatus();

  return (
    <Box
      width="40px"
      height="40px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color={status === "error" ? "red.500" : status === "idle" ? "green.500" : "blue.500"}
    >
      <AnimatedIcon className={status}>
        {status === "idle" && <FaCheck size={20} />}
        {status === "loading" && <BiLoaderAlt size={20} />}
        {status === "error" && <FaTimes size={20} />}
      </AnimatedIcon>
    </Box>
  );
};
