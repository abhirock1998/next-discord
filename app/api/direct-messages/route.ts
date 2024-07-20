import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGE_BATCH_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  try {
    const conversationId = searchParams.get("conversationId");
    const cursor = searchParams.get("cursor");

    if (!conversationId) {
      return new NextResponse("Conversation Id is missing", { status: 400 });
    }

    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let messages: DirectMessage[] = [];
    if (cursor && Number(cursor) > 0) {
      messages = await db.directMessage.findMany({
        take: MESSAGE_BATCH_SIZE,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId: conversationId,
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
      messages = await db.directMessage.findMany({
        take: MESSAGE_BATCH_SIZE,
        where: {
          conversationId: conversationId,
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
