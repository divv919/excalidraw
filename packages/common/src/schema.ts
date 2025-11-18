import { z } from "zod";
export const UserSchema = z.object({
  email: z.string().min(3).max(30),
  password: z.string(),
  username: z.string(),
});

export const CreateRoomSchema = z.object({
  name: z.string(),
  isProtected: z.boolean(),
  password: z.string().optional(),
});

export const SignInSchema = z.object({
  email: z.string().min(3).max(30),
  password: z.string(),
});

export const ShapeSchema = z.enum([
  "ellipse",
  "rectangle",
  "pencil",
  "line",
  "arrow",
  "text",
]);

export const MessageSchema = z.object({
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

export const Role = z.enum(["user", "admin", "moderator"]);
