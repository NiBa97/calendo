import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { groupRouter } from "./routers/group";
import { taskRouter } from "./routers/task";
import { uploadRouter } from "./routers/upload";
import { attachmentRouter } from "./routers/attachments";
import { noteRouter } from "./routers/note";
import { pomodoroRouter } from "./routers/pomodoro";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  group: groupRouter,
  task:taskRouter,
  upload: uploadRouter,
  attachments: attachmentRouter,
  note: noteRouter,
  pomodoro: pomodoroRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
