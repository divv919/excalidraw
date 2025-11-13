import { NextRequest, NextResponse } from "next/server";
import JWT_SECRET from "@repo/backend-common/config";

import jwt from "jsonwebtoken";
export default function proxy(req: NextRequest, res: NextResponse) {
  const token = req.cookies.get("authToken")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  } catch (err) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*", "/canvas/:path*"],
};
