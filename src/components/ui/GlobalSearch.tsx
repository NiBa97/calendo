import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  Input,
  List,
  Spinner,
  Text,
  Box,
  Portal,
} from '@chakra-ui/react';
import { getPb } from '../../pocketbaseUtils';
import { useTasks } from '../../contexts/task-context';
import { useNotes } from '../../contexts/note-context';


interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
}




const GlobalSearch = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {tasks} = useTasks();
  const {notes} = useNotes();
  const pb = getPb();

  const { setModalTask } = useTasks();
  const { setSelectedNote } = useNotes();

  const onResultClick = (result_id: string, result_type: string) => {
    console.log(`Search result clicked: ${result_id}`);

    if (result_type === 'task') {
      const task = tasks.find(task => task.id === result_id);
      if (task) {
        setModalTask(task);
      }
    } else if (result_type === 'note') {
      const note = notes.find(note => note.id === result_id);
      if (note) {
        setSelectedNote(note);
      }
    }
  };

  
  useEffect(() => {
    console.log("useEffect", isDialogOpen);
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log("handleKeyDown", event.metaKey, event.ctrlKey, event.key);
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsDialogOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDialogOpen]);

  const fetchResults = useCallback(async (term: string) => {
    if (!term || term.trim().length < 2 || !pb.authStore.isValid || !pb.authStore.model) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    const escapedTerm = term.replace(/'/g, "''");

    try {
      console.log(`Searching for: ${term}`);
      const filter = ` (title ~ '${escapedTerm}' || content ~ '${escapedTerm}')`;
      console.log("PocketBase Filter:", filter);

      const pbResults = await pb.collection('taskandnotes').getList<SearchResult>(1, 20, {
        filter: filter,
        fields: 'id, type, title, content',
      });
      console.log("PocketBase Results:", pbResults);
      const convertedResults = pbResults.items;

      console.log("PocketBase Converted Results:", convertedResults);
      setResults(convertedResults);

    } catch (err: any) {
      console.error('Search failed:', err);
      if (err.isAbort) {
        console.log('Search request aborted');
      } else {
        setError(err.message || 'Failed to fetch search results.');
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [pb]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchResults(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchResults]);

  // Update handleResultClick to dispatch a custom event
  const handleResultClick = (result: SearchResult) => {
    onResultClick(result.id, result.type);
    setIsDialogOpen(false);
    setSearchTerm('');
    setResults([]);
  };

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={(details) => { setIsDialogOpen(details.open); }} >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="xl">
            <Dialog.Body pb={6} bg={"brand.1"}>
              <Input
                bg="brand.2"
                placeholder="Search tasks and notes... (Cmd+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                mt={4}
              />

              <Box mt={4} minH="200px" maxH="400px" overflowY="auto">
                {isLoading && (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100px">
                    <Spinner />
                  </Box>
                )}
                {error && (
                  <Text color="red.500">Error: {error}</Text>
                )}
                {!isLoading && !error && results.length > 0 && (
                  <List.Root gap={3}>
                    {results.map((result) => (
                      <List.Item
                        bg={"brand.3"}
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        p={2}
                        _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                        borderRadius="md"
                      >
                        <Text fontWeight="bold">{result.title} [{result.type}]</Text> 
                       
                      </List.Item>
                    ))}
                  </List.Root>
                )}
                {!isLoading && !error && results.length === 0 && searchTerm.trim().length >= 2 && (
                  <Text>No results found for "{searchTerm}".</Text>
                )}
                {!isLoading && !error && results.length === 0 && searchTerm.trim().length < 2 && (
                  <Text>Start typing to search...</Text>
                )}
              </Box>
            </Dialog.Body>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default GlobalSearch;
