import { v4 as uuid } from "uuid";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

export const POST = async (req: Request) => {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });
    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuid(),
        channels: {
          create: [{ name: "general", profileId: profile.id }],
        },
        members: {
          create: [{ profileId: profile.id, role: MemberRole.ADMIN }],
        },
      },
    });
    return NextResponse.json(server, { status: 201 });
  } catch (err: any) {
    console.log(`[SERVERS_POST]: ${err.message}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
