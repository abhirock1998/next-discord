import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export async function POST(req: Request) {
  try {
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!serverId) return new NextResponse("Missing serverId", { status: 400 });

    if (!name || !type)
      return new NextResponse("Missing name or type", { status: 400 });

    if (name === "general") {
      return new NextResponse("Channel name cannot be general", {
        status: 401,
      });
    }

    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });
    return NextResponse.json(server, { status: 201 });
  } catch (error) {
    console.log("CHANNELS_POST", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
