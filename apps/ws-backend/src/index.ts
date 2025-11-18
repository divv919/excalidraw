import { WebSocketServer, WebSocket } from "ws";
import jwt, { decode, JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import JWT_SECRET from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
import { uuid } from "uuidv4";
const wss = new WebSocketServer({ port: 8080 });
import z from "zod";
type Role = "user" | "admin" | "moderator";

interface User {
  userId: string;
  ws: WebSocket;
  socketId: string;
  roomId: number;
  access: Record<number, Role>;
}

const ShapeSchema = z.enum([
  "ellipse",
  "rectangle",
  "pencil",
  "line",
  "arrow",
  "text",
]);
const MessageSchema = z.object({
  type: ShapeSchema,
  userId: z.string(),
  roomId: z.string(),
  text: z.string().optional(),
  clientX: z.number().optional(),
  clientY: z.number().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
  radiusX: z.number().optional(),
  radiusY: z.number().optional(),
  fromX: z.number().optional(),
  fromY: z.number().optional(),
  toX: z.number().optional(),
  toY: z.number().optional(),
  points: z.object({}).optional(),
  color: z.string(),
});

const usersBySocket = new Map<string, User>();
const socketByRoom = new Map<number, Set<string>>();

function decodeToken(token: string | null) {
  if (!token) {
    return null;
  }
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
  const cookies = request.headers.cookie;
  if (!cookies) {
    console.log("No cookies found");
    ws.close(1008, "Authentication Error");
    return;
  }
  const cookieMap = new Map<string, string>();
  cookies.split("; ").forEach((cookie) => {
    const [key, value] = cookie.split("=");
    cookieMap.set(key ?? "", value ?? "");
  });
  const decodedToken = decodeToken(cookieMap.get("roomToken") ?? null);

  if (!decodedToken) {
    console.log("No token found");
    ws.close();
    return;
  }
  const { userId, roomId, access } = decodedToken as JwtPayload;
  if (!userId || !roomId || !access) {
    console.log("No userId, roomId or access found");
    ws.close();
    return;
  }
  const socketId = uuid();
  const roomExists = socketByRoom.get(roomId);
  if (!roomExists) {
    socketByRoom.set(roomId, new Set([socketId]));
  } else {
    roomExists.add(socketId);
  }
  usersBySocket.set(socketId, { userId, ws, socketId, roomId, access });
  console.log({ usersBySocket });
  console.log(usersBySocket.size);
  console.log(socketByRoom);

  ws.on("message", async (msg: Buffer) => {
    const toParseMessage = msg.toString();
    const message = JSON.parse(toParseMessage);

    console.log("message : ", message, typeof message);
    const { type, ...rest } = message;
    const validateType = ShapeSchema.safeParse(type);
    if (!validateType.success) {
      console.log("Invalid shape type", validateType.error);
      return;
    }
    const validatedMessage = MessageSchema.safeParse({
      type,
      ...rest,
      userId,
      roomId,
    });
    if (!validatedMessage.success) {
      console.log("Invalid message", validatedMessage.error);
      return;
    }
    sendMessageToRoom(roomId, validatedMessage, userId, socketId);
    await prismaClient.content.create({
      data: {
        ...validatedMessage.data,
      },
    });
  });
  ws.on("close", () => {
    usersBySocket.delete(socketId);
    const lastInRoom = socketByRoom.get(roomId);
    if (!lastInRoom) {
      console.error("Room is already empty");
      return;
    }
    if (lastInRoom?.size > 1) {
      lastInRoom?.delete(socketId);
    } else {
      socketByRoom.delete(roomId);
    }

    console.log("user id is closed ", userId);
    console.log({ usersBySocket });
  });
});

function sendMessageToRoom(
  roomId: number,
  message: any,
  userId: string,
  socketIdOfSender: string
) {
  const sockets = socketByRoom.get(roomId);
  console.log("messages to be sent to these sockets", sockets);
  if (!sockets) {
    console.log("no sockets found , returnign");
    return;
  }
  sockets.forEach((socketId) => {
    console.log("sending message to", usersBySocket.get(socketId)?.userId);
    const user = usersBySocket.get(socketId);
    console.log({ user });
    console.log("user sneding is", userId, " To send to is ", user?.userId);
    console.log("access", user?.access);
    if (user && user.userId !== userId && !!user.access) {
      user.ws.send(JSON.stringify(message));
    }
  });
}
console.log("websocket server listening at 8080 port ");
