import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

interface PageProps {
  params: { serverId: string };
}

const Page = async ({ params }: PageProps) => {
  const profile = await currentProfile();
  if (!profile) return auth().redirectToSignIn();

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: "general",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!server) return null;

  const initialChannel = server.channels[0];

  if (initialChannel?.name !== "general") return null;

  return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`);
};

export default Page;
