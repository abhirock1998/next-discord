import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { Message } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGE_BATCH_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    const channelId = searchParams.get("channelId");
    const cursor = searchParams.get("cursor");

    if (!channelId) {
      return new NextResponse("channelId is missing", { status: 400 });
    }

    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let messages: Message[] = [];
    if (cursor && Number(cursor) > 0) {
      messages = await db.message.findMany({
        take: MESSAGE_BATCH_SIZE,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      messages = await db.message.findMany({
        take: MESSAGE_BATCH_SIZE,
        where: {
          channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    let nextCursor = null;
    if (messages.length === MESSAGE_BATCH_SIZE) {
      nextCursor = messages[messages.length - 1].id;
    }

    const payload = {
      items: messages,
      nextCursor,
    };
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.log("[MESSAGES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
