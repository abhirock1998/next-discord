import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as SocketIO } from "socket.io";

import { NextApiResponseServerIo } from "@/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    console.log("New socket.io server");
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new SocketIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
  } else {
    console.log("Existing socket.io server");
  }
  res.end();
};

export default ioHandler;
