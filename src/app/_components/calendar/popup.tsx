export default function CalendarPopup({
  onClose,
  position,
  task,
}: {
  onClose: () => void;
  position: { top: number; left: number };
  task: Task;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <Box
      ref={ref}
      position="absolute"
      top={position.top}
      left={position.left}
      bg="white"
      boxShadow="md"
      zIndex={1}
      border="1px solid gray"
      borderRadius="md"
      width={400}
      height={400}
    >
      <TempTask task={task}></TempTask>
    </Box>
  );
}
