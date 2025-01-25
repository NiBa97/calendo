import { type NextRequest } from "next/server";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { taskId: string } }
  ) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }
  
      const task = await db.task.findUnique({
        where: { 
          id: params.taskId,
          userId 
        }
      });
  
      if (!task) {
        return new Response("Task not found", { status: 404 });
      }
  
      const updatedTask = await db.task.update({
        where: { id: params.taskId },
        data: { 
          status: !task.status
        }
      });
  
      return Response.json(updatedTask);
    } catch (error) {
      console.error("Error toggling task:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }