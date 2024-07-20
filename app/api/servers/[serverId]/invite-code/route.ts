import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { v4 } from "uuid";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    if (!params.serverId)
      return new NextResponse("Server ID Missing", { status: 400 });

    const server = await db.server.update({
      where: {
        id: params.serverId,
        profileId: profile.id,
      },
      data: {
        inviteCode: v4(),
      },
    });
    return NextResponse.json(server, { status: 201 });
  } catch (error) {
    console.log("[SERVER_ID] -> [INVITE_CODE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
