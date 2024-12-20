import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Image,
  Box,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useRef } from "react";
import { DrawIoEmbed } from "react-drawio";

export interface DrawIORefProps {
  xml: string;
  onSave?: (xml: string) => void;
}

export const DrawIORef: React.FC<DrawIORefProps> = ({ xml, onSave }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();

  const cancelRef = useRef<HTMLButtonElement>(null);

  // Function to handle saving
  const handleSave = (newXml: string) => {
    if (onSave) {
      onSave(newXml);
    }
  };

  // Function to handle confirmed close
  const handleConfirmedClose = () => {
    onAlertClose();
    onClose();
  };

  return (
    <>
      <Box
        cursor="pointer"
        onClick={onOpen}
        bg="gray.100"
        w="fit-content"
        h="fit-content"
        p={2}
        position="relative"
        _hover={{
          cursor: "hand",
          bg: "gray.200",
          "& > .hover-text": {
            opacity: 1,
            cursor: "pointer",
          },
        }}
      >
        <Image src={xml} alt="drawio" w="auto" h="auto" />
        <Box
          className="hover-text"
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="blackAlpha.600"
          color="white"
          opacity="0"
          transition="opacity 0.2s"
          cursor={"pointer"}
        >
          Click to edit
        </Box>
      </Box>
      {/* Main Modal */}
      <Modal isOpen={isOpen} onClose={onAlertOpen} size="full">
        <ModalOverlay />
        <ModalContent h="80vh" maxW="90vw" maxH="80vh" background={"transparent"}>
          <ModalBody py={4} background={"transparent"}>
            <DrawIoEmbed xml={xml} onSave={(data) => handleSave(data.xml)} onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog */}
      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Close Editor?
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure? Any unsaved changes will be lost.</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmedClose} ml={3}>
                Close Without Saving
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
