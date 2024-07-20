import { NextApiRequest } from "next";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile-page";

import { NextApiResponseServerIo } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const profile = await currentProfile(req);

    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { content, fileUrl } = req.body;
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is missing" });
    }

    if (!content) {
      return res.status(400).json({ message: "Content is missing" });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const message = await db.directMessage.create({
      data: {
        content,
        memberId: member.id,
        fileUrl: fileUrl || "",
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${conversationId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);
    return res.status(201).json(message);
  } catch (error) {
    console.log(`[DIRECT_MESSAGE_POST]`, error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
