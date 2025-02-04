import { type NextRequest } from "next/server";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";

// Mark route as dynamic
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const dateStr = req.nextUrl.searchParams.get("date");
    if (!dateStr) {
      return new Response("Date parameter is required", { status: 400 });
    }

    const date = new Date(dateStr);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const tasks = await db.task.findMany({
      where: {
        userId,
        AND: [
          {
            OR: [
              {
                startDate: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
              {
                endDate: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            ],
          },
        ],
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return Response.json(tasks);
  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
