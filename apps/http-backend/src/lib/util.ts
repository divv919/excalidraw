import { customAlphabet } from "nanoid";
export function generateInviteLink() {
  return customAlphabet(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    10
  )();
}
export function generateSlug(name: string) {
  return (
    name
      .split(" ")
      .join("-")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "") +
    "-" +
    customAlphabet(
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
      5
    )()
  );
}
