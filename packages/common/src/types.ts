import { z } from "zod";
export const UserSchema = z.object({
  email: z.string().min(3).max(20),
  password: z.string(),
  name: z.string(),
});

export const CreateRoomSchema = z.object({
  slug: z.string(),
});

export const SignInSchema = z.object({
  email: z.string().min(3).max(20),
  password: z.string(),
});
