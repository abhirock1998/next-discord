import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    if (!params.serverId)
      return new NextResponse("Server ID Missing", { status: 400 });

    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const server = await db.server.update({
      where: {
        id: params.serverId,
        // checking if the profile is the owner of the server before updating the invite code
        // is profileId the owner of the server? then we don't want to leave the server
        profileId: {
          not: profile.id,
        },
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });
    return NextResponse.json(server, { status: 201 });
  } catch (error) {
    console.log("SERVER_ID_LEAVE", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
