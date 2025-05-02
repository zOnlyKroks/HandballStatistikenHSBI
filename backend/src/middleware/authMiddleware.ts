import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import BlacklistedTokenModel from "../model/auth/BlacklistedTokenModel";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const blacklisted = await BlacklistedTokenModel.findOne({ where: { token } });
    if (blacklisted) {
      return res.status(401).json({ success: false, message: "Token has been invalidated." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
}
