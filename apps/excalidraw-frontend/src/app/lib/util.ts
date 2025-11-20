import clsx from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...input: any[]) {
  return twMerge(clsx(input));
}
