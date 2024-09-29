import { Box } from "@chakra-ui/react";
import { TaskHistory } from "@prisma/client";
import { api } from "~/trpc/react";

const TaskChangelog = ({ taskId }: { taskId: string }) => {
  const { data: taskHistory } = api.task.getHistoric.useQuery({
    id: taskId,
  });
  if (!taskHistory) return <Box>No history found</Box>;
  return (
    <div>
      {taskHistory.slice(1).map((newVersion, index) => {
        const oldVersion = taskHistory[index]!;
        return (
          <div key={newVersion.historyId}>
            <h2>Changes on {newVersion.changedAt.toLocaleString()}</h2>
            <ul>
              {oldVersion.name !== newVersion.name && (
                <li>
                  Name changed from &quot;{oldVersion.name}&quot; to &quot;{newVersion.name}&quot;
                </li>
              )}
              {oldVersion.description !== newVersion.description && <li>Description updated</li>}
              {oldVersion.startDate !== newVersion.startDate && (
                <li>
                  Start date changed from {oldVersion.startDate?.toLocaleString() ?? "unset"} to{" "}
                  {newVersion.startDate?.toLocaleString() ?? "unset"}
                </li>
              )}
              {oldVersion.endDate !== newVersion.endDate && (
                <li>
                  End date changed from {oldVersion.endDate?.toLocaleString() ?? "unset"} to{" "}
                  {newVersion.endDate?.toLocaleString() ?? "unset"}
                </li>
              )}
              {oldVersion.isAllDay !== newVersion.isAllDay && (
                <li>
                  All-day status changed from {oldVersion.isAllDay.toString()} to {newVersion.isAllDay.toString()}
                </li>
              )}
              {oldVersion.status !== newVersion.status && (
                <li>
                  Status changed from {oldVersion.status.toString()} to {newVersion.status.toString()}
                </li>
              )}
              {oldVersion.groupId !== newVersion.groupId && (
                <li>
                  Group changed from {oldVersion.groupId ?? "unassigned"} to {newVersion.groupId ?? "unassigned"}
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default TaskChangelog;
