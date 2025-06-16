import { WebSocketServer, WebSocket } from "ws";
import jwt, { decode, JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import JWT_SECRET from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  ws: WebSocket;
  rooms: number[];
}

// [{
//   userId : 1,
//   ws : __,
//   rooms : [1,2]
// },
//{
//   userId : 2,
//   ws : __,
//   rooms : [1]
// }]

const users: User[] = [];

function userDetails(token: string | null) {
  if (!token) {
    return null;
  }
  console.log("Token ", token);
  try {
    const decoded = jwt.verify(token, JWT_SECRET || "Fallback_Secret");
    if (!decoded) {
      console.log(" Not decodable ");
      return null;
    }
    return decoded;
  } catch (err) {
    console.log(" error caught ");
    return null;
  }
}

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParam = new URLSearchParams(url.split("?")[1]);
  const user = userDetails(queryParam.get("token"));
  console.log("queryParam : ", queryParam, " user : ", user);
  if (!user) {
    console.log("Working");
    ws.close();
    return;
  }
  users.push({
    userId: (user as JwtPayload).userId,
    ws,
    rooms: [],
  });

  ws.on("message", async (toParseMessage) => {
    const message = JSON.parse(toParseMessage as unknown as string);

    if (message.type === "join_room") {
      const user = users.find((user) => user.ws === ws);
      user?.rooms.push(message.roomId);
    } else if (message.type === "leave_room") {
      const user = users.find((user) => user.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter((room) => room !== message.roomId);
    } else if (message.type === "chat") {
      await prismaClient.chat.create({
        data: {
          roomId: Number(message.roomId),
          message: message.message,
          userId: (user as JwtPayload).userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(message.roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message.message,
              roomId: message.roomId,
            })
          );
        }
      });
    }
  });
  console.log("websocket server listening at 8080 port ");
});
