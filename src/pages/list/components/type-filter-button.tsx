import { Button, Flex, Icon, Menu } from "@chakra-ui/react"
import { FilterType } from "../../../lib/filters"
import { FaCaretDown, FaFilter } from "react-icons/fa"
export const TypeFilterButton = ({ selectedType, handleSelectionChange }: { selectedType: string, handleSelectionChange: (selectedType: FilterType) => void }) => {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button>
          <Flex align="center">
            <Icon as={FaFilter} mr={2} />
            Type: {selectedType === "all" ? "All" : selectedType === "notes" ? "Notes" : "Tasks"}
            <Icon as={FaCaretDown} ml={2} />
          </Flex>
        </Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.RadioItemGroup value={selectedType} onValueChange={(details) => handleSelectionChange(details.value as FilterType)}>
            <Menu.RadioItem value="all">All Items</Menu.RadioItem>
            <Menu.RadioItem value="notes">Notes</Menu.RadioItem>
            <Menu.RadioItem value="tasks">Tasks</Menu.RadioItem>
          </Menu.RadioItemGroup>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}