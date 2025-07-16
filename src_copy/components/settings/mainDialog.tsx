import { DialogRoot, DialogContent, DialogBody, DialogCloseTrigger } from "../ui/dialog";
import { Tabs } from "@chakra-ui/react";
import ConnectionsTab from "./connectionsTab";
interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogContent color="gray.800" mx="auto" width="700px" height="500px" my="auto">
        <DialogCloseTrigger />

        <DialogBody p={0}>
          <Tabs.Root defaultValue="user" orientation="vertical" bg="brand.1" height="full">
            <Tabs.List gap={2} py={3} px={2}>
              <Tabs.Trigger value="user" color="brand.4" _selected={{ bg: "brand.3" }}>
                User Settings
              </Tabs.Trigger>
              <Tabs.Trigger value="connections" color="brand.4" _selected={{ bg: "brand.3" }}>
                Connections
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="user">Placeholder</Tabs.Content>
            <Tabs.Content value="connections" width="full" pl={0} height="full">
              <ConnectionsTab />
            </Tabs.Content>
          </Tabs.Root>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}
