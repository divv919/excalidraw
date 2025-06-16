import express from "express";
const app = express();
import jwt from "jsonwebtoken";
import "dotenv/config";
import authMiddleware from "./authMiddleware";
import JWT_SECRET from "@repo/backend-common/config";
import { CreateRoomSchema, SignInSchema, UserSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

app.use(express.json());

app.use((req, res, next) => {
  console.log("Body is : ", req.body);
  next();
});
app.post("/signup", async (req, res) => {
  const response = UserSchema.safeParse(req.body);

  if (!response.success) {
    res.status(422).json({ message: "Invalid input" });
    return;
  }

  const { email, password, name } = req.body;

  const alreadyExists = await prismaClient.user.count({ where: { email } });
  if (!!alreadyExists) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }
  const userId = await prismaClient.user.create({
    data: {
      email,
      password,
      name,
    },
  });
  const token = jwt.sign({ userId: userId.id }, JWT_SECRET);
  res.status(200).json({ message: "User created successfully", token });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const schemaCheck = SignInSchema.safeParse(req.body);
  if (!schemaCheck.success) {
    res.status(422).json({ message: "Invalid input" });
    return;
  }
  const userExists = await prismaClient.user.findFirst({ where: { email } });
  if (!userExists) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  if (userExists.password !== password) {
    res.status(401).json({ message: "Invalid password" });
    return;
  }
  const { id } = userExists;
  const token = jwt.sign({ userId: id }, JWT_SECRET || "Fallback_Secret");
  res.status(200).json({ message: "Logged in successfully", token });
});

app.post("/createRoom", authMiddleware, async (req, res) => {
  const schemaCheck = CreateRoomSchema.safeParse(req.body);
  console.log("is Schema correct : ", schemaCheck.success);

  if (!schemaCheck.success) {
    res.status(422).json({ message: "Invalid input" });
    return;
  }
  const { slug } = req.body;
  try {
    const roomExists = await prismaClient.room.count({ where: { slug } });
    if (!!roomExists) {
      res.status(409).json({ message: "Room already exists" });
      return;
    }
    if (!req.userId) {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    const response = await prismaClient.room.create({
      data: {
        slug,
        admin_id: req.userId,
      },
    });
    res.status(200).json({
      roomId: response.id,
      message: "Room created successfully",
    });
  } catch (err) {
    console.log("Error creating room : ", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const response = await prismaClient.chat.findMany({
    where: { roomId: Number(roomId) },
    // orderBy: {
    //   roomId: "desc",
    // },
    take: 50,
  });
  res.status(200).json({ messages: response });
});

app.get("/idFromSlug/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const response = await prismaClient.room.findFirst({
      where: {
        slug,
      },
    });
    if (!response) {
      throw new Error();
    }
    res.status(200).json({ id: response.id });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
app.listen(3001, () => console.log("Http server listening at port 3001"));
