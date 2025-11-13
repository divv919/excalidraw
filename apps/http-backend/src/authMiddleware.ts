import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import JWT_SECRET from "@repo/backend-common/config";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("cookies are : " + req.cookies.authToken);

  const decoded = jwt.verify(req.cookies.authToken || "", JWT_SECRET);
  console.log("Is decoded : ", !!decoded, " Decode value : ", decoded);

  if (decoded) {
    req.userId = (decoded as JwtPayload).userId;
    next();
    return;
  }
  res.status(401).json({ success: false, message: "Unauthorized" });
  return;
};
export default authMiddleware;
