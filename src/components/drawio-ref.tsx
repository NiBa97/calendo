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
      <Box cursor="pointer" onClick={onOpen}>
        <Image src={xml} alt="drawio" w="auto" h="auto" />
      </Box>

      {/* Main Modal */}
      <Modal isOpen={isOpen} onClose={onAlertOpen} size="full">
        <ModalOverlay />
        <ModalContent h="90vh" maxW="90vw" maxH="90vh" m="auto">
          <ModalBody p={6}>
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
