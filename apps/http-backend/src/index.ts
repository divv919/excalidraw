import express from "express";
const app = express();
import jwt from "jsonwebtoken";
import "dotenv/config";
import authMiddleware from "./authMiddleware";
import JWT_SECRET from "@repo/backend-common/config";
import { CreateRoomSchema, SignInSchema, UserSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { generateInviteLink, generateSlug } from "./lib/util";

app.use(express.json());

app.use((req, res, next) => {
  console.log("Body is : ", req.body);
  next();
});
app.post("/signup", async (req, res) => {
  const response = UserSchema.safeParse(req.body);

  if (!response.success) {
    res.status(422).json({ success: false, message: "Invalid input" });
    return;
  }

  const { email, password, username } = req.body;

  const alreadyExists = await prismaClient.user.count({ where: { email } });
  if (!!alreadyExists) {
    res.status(409).json({ success: false, message: "Email already in use" });
    return;
  }
  const userId = await prismaClient.user.create({
    data: {
      email,
      password,
      username,
    },
  });
  const token = jwt.sign({ userId: userId.id }, JWT_SECRET);
  res
    .status(200)
    .json({
      success: true,
      message: "User created successfully",
      user: { email, username },
    })
    .cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "strict",
    });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const schemaCheck = SignInSchema.safeParse(req.body);
  if (!schemaCheck.success) {
    res.status(422).json({ success: false, message: "Invalid input" });
    return;
  }
  const userExists = await prismaClient.user.findFirst({ where: { email } });
  if (!userExists) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  if (userExists.password !== password) {
    res.status(401).json({ success: false, message: "Invalid password" });
    return;
  }
  const { id } = userExists;
  const token = jwt.sign({ userId: id }, JWT_SECRET);
  res
    .status(200)
    .json({
      success: true,
      message: "Logged in successfully",

      user: {
        email: userExists.email,
        username: userExists.username,
      },
    })
    .cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "strict",
    });
});

app.post("/createRoom", authMiddleware, async (req, res) => {
  const schemaCheck = CreateRoomSchema.safeParse(req.body);
  console.log("is Schema correct : ", schemaCheck.success);

  if (!schemaCheck.success) {
    res.status(422).json({ success: false, message: "Invalid input" });
    return;
  }
  const { name, isProtected, password } = req.body;
  const slug = generateSlug(name);
  const inviteLink = generateInviteLink();
  const adminId = req.userId;
  if (!adminId) {
    res.status(401).json({ success: false, message: "Token expired" });
    return;
  }
  try {
    const response = await prismaClient.room.create({
      data: {
        slug,
        inviteLink,
        isProtected,
        password,
        adminId,
        name,
      },
    });
    res.status(200).json({
      slug,
      inviteLink,
      message: "Room created successfully",
    });
  } catch (err) {
    console.log("Error creating room : ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/contents/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const room = await prismaClient.room.findFirst({
      where: { slug },
    });
    if (!room) {
      res.status(404).json({ success: false, message: "Room not found" });
      return;
    }
    const hasAccess = await prismaClient.access.findFirst({
      where: {
        roomId: room.id,
        userId: req.userId,
      },
    });
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this room",
      });
      return;
    }
    const response = await prismaClient.content.findMany({
      where: { roomId: room.id },
      take: 50,
    });
    //Todo : Pagination
    res.status(200).json({ messages: response, success: true });
  } catch (err) {
    console.log("Error getting contents : ", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

app.get("/getRoom/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const room = await prismaClient.room.findFirst({
      where: {
        slug,
      },
    });
    if (!room) {
      res.status(404).json({ message: "Room not found", success: false });
      return;
    }
    const hasAccess = await prismaClient.access.findFirst({
      where: {
        roomId: room.id,
        userId: req.userId,
      },
    });
    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this room",
      });
      return;
    }
    const token = jwt.sign(
      { userId: req.userId, roomId: room.id, access: hasAccess.role },
      JWT_SECRET
    );
    res
      .status(200)
      .cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "strict",
      })
      .json({ success: true, message: "Cookies set successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
});
app.get("/getAllRooms", async (req, res) => {
  try {
    const rooms = await prismaClient.room.findMany({
      where: {
        adminId: req.userId,
      },
      include: {
        accesses: true,
      },
    });
    if (!rooms) {
      res.status(404).json({ message: "No rooms found", success: false });
      return;
    }
    res
      .status(200)
      .json({ rooms, success: true, message: "Rooms fetched successfully" });
  } catch (err) {
    console.log("Error getting all rooms : ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
});
app.listen(3001, () => console.log("Http server listening at port 3001"));
