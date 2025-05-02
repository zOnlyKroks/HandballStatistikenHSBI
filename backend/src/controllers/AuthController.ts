import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AuthUserModel from "../model/auth/AuthUserModel";
import BlacklistedTokenModel from "../model/auth/BlacklistedTokenModel";
import UserModel, { Position, UserRole } from "../model/user/UserModel";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Name, email, and password are required" });
      }
  
      const existingUser = await AuthUserModel.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "User with this email already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await AuthUserModel.create({ name, email, password: hashedPassword });
  

      await UserModel.create({
        id: newUser.id,
        role: UserRole.PLAYER,
        height: -1,
        age: -1,
        position: Position.UNKNOWN,
        jerseyNumber: -1,
      });
  
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Server error during registration" });
    }
  }  

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      const user = await AuthUserModel.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });

      res.status(200).json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Server error during login" });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(400).json({ success: false, message: "No token provided" });

      const decoded = jwt.decode(token) as any;
      if (!decoded?.exp) return res.status(400).json({ success: false, message: "Invalid token" });

      await BlacklistedTokenModel.create({ token, expiresAt: new Date(decoded.exp * 1000) });

      res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ success: false, message: "Server error during logout" });
    }
  }

  static async profile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await AuthUserModel.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}
