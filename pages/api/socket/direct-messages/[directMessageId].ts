import { NextApiRequest } from "next";
import { MemberRole } from "@prisma/client";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile-page";

import { NextApiResponseServerIo } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  try {
    if (req.method !== "DELETE" && req.method !== "PATCH") {
      return res.status(405).json({ message: "Method not allowed" });
    }
    const { directMessageId, conversationId } = req.query;
    const { content } = req.body;

    if (!directMessageId || !conversationId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const profile = await currentProfile(req);
    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
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

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
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

    if (!directMessage || directMessage.deleted) {
      return res.status(404).json({ message: "Direct message not found" });
    }

    const isMessageOwner = directMessage.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModifyMessage = isMessageOwner || isAdmin || isModerator;

    if (!canModifyMessage) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.method === "DELETE") {
      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          deleted: true,
          fileUrl: undefined,
          content: `This message has been deleted.`,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    } else {
      if (!isMessageOwner) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    const updateKey = `chat:${conversationId}:messages:update`;

    res?.socket?.server?.io?.emit(updateKey, directMessage);
    return res.status(200).json(directMessage);
  } catch (error) {
    console.log("[MESSAGE_ID]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
