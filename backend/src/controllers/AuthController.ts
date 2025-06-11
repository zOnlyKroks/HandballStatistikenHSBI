// src/controllers/AuthController.ts

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { AuthResponse, AuthUser, LoginRequest } from "../types/types";
import { pool } from "../server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import AuthDBSqlStatements from "../sql/auth/authSqlStatements";
import ProfileDBSqlStatements from "../sql/profile/profileSqlStatements";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, name } = req.body;
    const vorname = name?.split(" ")[0] || "";
    const nachname = name?.split(" ")[1] || "";

    const missingFields: string[] = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!vorname) missingFields.push("vorname");
    if (!nachname) missingFields.push("nachname");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field${
          missingFields.length > 1 ? "s" : ""
        }: ${missingFields.join(", ")}`,
      } as AuthResponse);
    }

    const sanitize = (val: any) => (val === undefined ? null : val);
    const authUserUuid = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const ligaName = "Keine Liga";
    const mannschaftName = "Kein Team";
    const positionId = -1;

    try {
      const conn = await pool.getConnection();
      await conn.beginTransaction();

      // 1) Create AuthUser
      await conn.execute<ResultSetHeader>(AuthDBSqlStatements.CREATE_AUTHUSER, [
        authUserUuid,
        email,
        hashedPassword,
      ]);

      // 2) Ensure Liga exists
      await conn.execute<ResultSetHeader>(
        AuthDBSqlStatements.CREATE_LIGA_IF_NOT_EXISTS,
        [ligaName, -1, -1]
      );

      // 3) Ensure Mannschaft exists
      await conn.execute<ResultSetHeader>(
        AuthDBSqlStatements.CREATE_MANNSCHAFT_IF_NOT_EXISTS,
        [mannschaftName, ligaName]
      );

      // 4) Ensure Position exists
      await conn.execute<ResultSetHeader>(
        AuthDBSqlStatements.CREATE_POSITION_IF_NOT_EXISTS,
        [positionId, "Unbekannt"]
      );

      // 5) Create User row
      const values = [
        sanitize(authUserUuid),
        sanitize(vorname),
        sanitize(nachname),
        sanitize(-1), // koerpergroesse
        sanitize("1900-01-01"), // geburtsdatum
        sanitize(positionId),
        sanitize(-1), // trikotnummer
        sanitize(-1),
        false,
      ];
      await conn.execute<ResultSetHeader>(
        AuthDBSqlStatements.CREATE_USER,
        values
      );

      await conn.commit();
      conn.release();

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          uuid: authUserUuid,
          email,
          vorname,
          nachname,
        },
      } as AuthResponse);
    } catch (error) {
      console.error("Registration error:", error);
      try {
        await pool.execute(`ROLLBACK`);
      } catch {
        /* ignore rollback errors */
      }
      return res.status(500).json({ error: "Registration failed" });
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      } as AuthResponse);
    }

    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        AuthDBSqlStatements.FIND_USER_BY_EMAIL,
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        } as AuthResponse);
      }

      const userRow = rows[0] as {
        UUID: string;
        Email: string;
        Password: string;
      };

      const isPasswordValid = await bcrypt.compare(password, userRow.Password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        } as AuthResponse);
      }

      // 2) Generate JWT
      const token = jwt.sign(
        { uuid: userRow.UUID, email: userRow.Email },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        success: true,
        token,
        user: {
          uuid: userRow.UUID,
          email: userRow.Email,
        },
      } as AuthResponse);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during login",
      } as AuthResponse);
    }
  }

  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "No token provided",
        } as AuthResponse);
      }

      const decoded = jwt.decode(token) as any;
      if (!decoded?.exp || !decoded?.uuid) {
        return res.status(400).json({
          success: false,
          message: "Invalid token",
        } as AuthResponse);
      }

      const now = new Date();
      const expiresAt = new Date(decoded.exp * 1000);

      console.log(
        `Logging out user ${decoded.uuid} with token ${token}, expires at ${expiresAt}`
      );

      await pool.execute<ResultSetHeader>(
        AuthDBSqlStatements.INSERT_BLACKLISTED_TOKEN,
        [decoded.uuid, token, now, now, expiresAt]
      );

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      } as AuthResponse);
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during logout",
      } as AuthResponse);
    }
  }

  static async profile(req: Request, res: Response): Promise<Response> {
    try {
      const userUuid = (req as any).user.uuid;

      const [rows] = await pool.query<RowDataPacket[]>(
        ProfileDBSqlStatements.GET_PARTIAL_PROFILE,
        [userUuid]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        } as AuthResponse);
      }

      const row = rows[0];
      const userProfile: any = {
        uuid: row.uuid,
        email: row.email,
        vorname: row.vorname,
        nachname: row.nachname,
      };

      return res.status(200).json({
        success: true,
        user: userProfile,
      });
    } catch (error) {
      console.error("Profile fetch error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      } as AuthResponse);
    }
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const [results] = await pool.query<RowDataPacket[]>(
        AuthDBSqlStatements.CHECK_TOKEN_BLACKLIST,
        [token]
      );
      return results.length > 0;
    } catch (error) {
      console.error("Error checking blacklisted token:", error);
      return false;
    }
  }
}
