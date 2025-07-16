import {
  Box,
  Button,
  Drawer,
  IconButton,
  VStack,
} from '@chakra-ui/react'
import { FaXmark } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

interface Props {
  onClose: () => void
  isOpen: boolean
  variant: 'drawer' | 'sidebar'
}

const SidebarContent = ({ onClick }: { onClick: () => void }) => {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
    onClick()
  }

  return (
    <VStack>
      <Button
        onClick={() => handleNavigation('/')}
        w="100%"
      >
        Dashboard
      </Button>
      <Button
        onClick={() => handleNavigation('/tasks')}
        w="100%"
      >
        Tasks
      </Button>
      <Button
        onClick={() => handleNavigation('/notes')}
        w="100%"
      >
        Notes
      </Button>
      <Button
        onClick={() => handleNavigation('/calendar')}
        w="100%"
      >
        Calendar
      </Button>
    </VStack>
  )
}

const Sidebar = ({ isOpen, variant, onClose }: Props) => {
  return variant === 'sidebar' ? (
    <Box
      position="fixed"
      left={0}
      // p="lg"
      w="200px"
      top={0}
      h="100%"
    >
      <SidebarContent onClick={onClose} />
    </Box>
  ) : (
    <Drawer.Root open={isOpen} placement={"start"} onOpenChange={(details) => { if (!details.open) onClose() }}>
      <Drawer.Positioner>
        <Drawer.Content maxW="100%" w="100%">
          <Drawer.CloseTrigger><IconButton><FaXmark></FaXmark></IconButton></Drawer.CloseTrigger>
          <Drawer.Header>
            <Drawer.Title>TTTT</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <SidebarContent onClick={onClose} />
          </Drawer.Body>
          <Drawer.Footer />
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>

  )
}

export default Sidebar
