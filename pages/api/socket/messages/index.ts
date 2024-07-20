import { currentProfile } from "@/lib/current-profile-page";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

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
    const { serverId, channelId } = req.query;

    if (!serverId) {
      return res.status(400).json({ message: "serverId is missing" });
    }

    if (!channelId) {
      return res.status(400).json({ message: "channelId is missing" });
    }

    if (!content) {
      return res.status(400).json({ message: "Content is missing" });
    }
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    const member = server.members.find((m) => m.profileId === profile.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const message = await db.message.create({
      data: {
        content,

        channelId: channel.id,
        memberId: member.id,
        fileUrl: fileUrl || "",
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);
    return res.status(201).json(message);
  } catch (error) {
    console.log(`[MESSAGE_POST]`, error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
