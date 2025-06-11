import { Response, Request } from "express";
import { RowDataPacket } from "mysql2";
import MiscDBSqlStatements from "../sql/misc/MiscDBSqlStatements";
import { pool } from "../server";

export default class MiscController {
  static async getLigen(req: Request, res: Response): Promise<Response> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        MiscDBSqlStatements.GET_LIGEN
      );

      return res.status(200).json({ success: true, ligen: rows });
    } catch (error) {
      console.error("Get ligen error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}
