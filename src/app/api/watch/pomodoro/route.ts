import { type NextRequest } from "next/server";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { type Pomodoro } from "@prisma/client";

const pomodoroSchema = z.object({
  duration: z.number().min(1),
  id: z.string().optional(),
});

// Get active pomodoro
export async function GET(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const activePomodoro = await db.pomodoro.findFirst({
      where: {
        userId,
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        startTime: 'desc',
      }
    });

    return Response.json(activePomodoro);
  } catch (error) {
    console.error("Error fetching pomodoro:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Start new pomodoro
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    const rawBody = await req.json() as { duration: number };
    const result = pomodoroSchema.safeParse(rawBody);
    
    if (!result.success) {
      return new Response("Invalid request body", { status: 400 });
    }
    
    const { duration } = result.data;

    // Cancel any active pomodoros
    await db.pomodoro.deleteMany({
      where: {
        userId,
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const pomodoro = await db.pomodoro.create({
      data: {
        duration,
        userId,
      },
    });

    return Response.json(pomodoro);
  } catch (error) {
    console.error("Error creating pomodoro:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Stop pomodoro (update duration)
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawBody = await req.json() as unknown;
    const result = pomodoroSchema.safeParse(rawBody);
    
    if (!result.success || !result.data?.id) {
      return new Response("Invalid request body", { status: 400 });
    }
    
    const { id, duration } = result.data;

    const pomodoro = await db.pomodoro.update({
      where: {
        id,
        userId,
      },
      data: {
        duration,
      },
    });

    return Response.json(pomodoro);
  } catch (error) {
    console.error("Error updating pomodoro:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Cancel pomodoro
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response("Pomodoro ID is required", { status: 400 });
    }

    await db.pomodoro.delete({
      where: {
        id,
        userId,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting pomodoro:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 