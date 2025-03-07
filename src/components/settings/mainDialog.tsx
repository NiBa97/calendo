import { DialogRoot, DialogContent, DialogTitle, DialogBody, DialogCloseTrigger } from "../ui/dialog";
import { Tabs } from "@chakra-ui/react";
interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogContent bg="white" color="gray.800" maxW="500px" mx="auto">
        <DialogCloseTrigger />
        <DialogTitle fontWeight="bold" fontSize="xl" px={6} pt={4}>
          Profile Settings
        </DialogTitle>

        <DialogBody py={4} px={6}>
          <Tabs.Root defaultValue="user">
            <Tabs.List>
              <Tabs.Trigger value="user">User Settings</Tabs.Trigger>
              <Tabs.Trigger value="connections">Connections</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="user">Placeholder</Tabs.Content>
            <Tabs.Content value="connections">Placeholder</Tabs.Content>
          </Tabs.Root>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
