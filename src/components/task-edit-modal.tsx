"use client";
import { Box, Modal, ModalBody, ModalContent, ModalOverlay } from "@chakra-ui/react";
import React from "react";
import TempTask from "./edit-task";
import { useTasks } from "~/contexts/task-context";
import { useRouter } from "next/navigation";

export default function TaskEditModal() {
  const { modalTask, setModalTask } = useTasks();
  const router = useRouter();
  const onClose = () => {
    void setModalTask(null);
    //navigate to /webapp
    // void router.push("/webapp");
    // check if the task got edited
  };
  return (
    <Modal isOpen={modalTask !== null} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg={"transparent"} color={"brand.4"} height={"90vh"} width={"90vw"} maxH={"90vh"} maxW={"90vw"}>
        <ModalBody height={"90vh"} width={"90vw"} p={0}>
          <Box bg={"black"} color={"brand.4"} height={"90vh"} width={"90vw"}>
            <TempTask task={modalTask!} height={undefined} width={undefined} onComplete={onClose}></TempTask>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
