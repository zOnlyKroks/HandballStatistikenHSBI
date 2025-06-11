import { Request, Response } from "express";
import { AuthUser, User } from "../types/types";
import { RowDataPacket } from "mysql2";
import { pool } from "../server";
import ProfileDBSqlStatements from "../sql/profile/profileSqlStatements";
import { stat } from "fs";

export class PlayerController {
  /**
   * GET /api/players/:uuid/full
   */
  static async getFull(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const [players] = await pool.query<RowDataPacket[]>(
        ProfileDBSqlStatements.GET_FULL_PROFILE,
        [id]
      );
      if (players.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Player not found",
        });
      }
      const playerData = players[0] as User;

      if (playerData.profileImage) {
        playerData.profileImage = Buffer.from(
          playerData.profileImage,
          "utf-8"
        ).toString("base64");
      }

      return res.status(200).json({
        success: true,
        player: playerData,
      });
    } catch (error) {
      console.error("Get full player error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  /**
   * GET /api/players/:uuid/basic
   */
  static async getBasic(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const [players] = await pool.query<RowDataPacket[]>(
        ProfileDBSqlStatements.GET_PARTIAL_PROFILE,
        [id]
      );
      if (players.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Player not found",
        });
      }
      const playerData = players[0] as AuthUser;
      return res.status(200).json({
        success: true,
        player: playerData,
      });
    } catch (error) {
      console.error("Get basic player error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  /**
   * GET /api/players/:uuid/accuracy
   */
  static async getAccuracy(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const [playerRows] = await pool.execute(
        `
      SELECT vorname, nachname 
      FROM User 
      WHERE uuid = ?
    `,
        [id]
      );

      if (!Array.isArray(playerRows) || playerRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Player not found",
        });
      }

      const player = playerRows[0] as any;

      const [actionRows] = await pool.execute(
        ProfileDBSqlStatements.GET_PLAYER_ACCURACY,
        [id]
      );

      let schuesseAufZiel = 0;
      let gesamtSchuesse = 0;

      if (Array.isArray(actionRows)) {
        for (const row of actionRows as any[]) {
          const count = parseInt(row.count) || 0;
          gesamtSchuesse += count;

          if (row.action_name.startsWith("Tor ")) {
            schuesseAufZiel += count;
          }
        }
      }

      const genauigkeitProzent =
        gesamtSchuesse > 0
          ? Math.round((schuesseAufZiel / gesamtSchuesse) * 100 * 100) / 100
          : 0;

      return res.status(200).json({
        success: true,
        accuracy: {
          vorname: player.vorname,
          nachname: player.nachname,
          gesamtSchuesse,
          schuesseAufZiel,
          genauigkeitProzent,
        },
      });
    } catch (error) {
      console.error("Get accuracy error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  /**
   * GET /api/positions
   * Returns all available position titles
   */
  static async getPositions(req: Request, res: Response): Promise<Response> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        ProfileDBSqlStatements.GET_POSITIONS
      );

      const positions = (rows as Array<{ id: number; title: string }>).map(
        (r) => ({ id: r.id, title: r.title })
      );
      return res.status(200).json({ success: true, positions });
    } catch (error) {
      console.error("Get positions error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * DELETE /api/players/:uuid
   * Deletes a player and corresponding auth user
   */
  static async deletePlayer(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(ProfileDBSqlStatements.DELETE_PLAYER, [id]);

      await conn.query(ProfileDBSqlStatements.DELETE_AUTHUSER, [id]);
      await conn.commit();
      return res.status(200).json({ success: true });
    } catch (error) {
      await conn.rollback();
      console.error("Delete player error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    } finally {
      conn.release();
    }
  }

  /**
   * SET /api/players/:uuid/profileData
   */
  static async setNonEssentialProfileData(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;
    try {
      const { profileData } = req.body as { profileData: Partial<User> };
      if (!profileData) {
        return res.status(400).json({ error: "Profile data is required" });
      }
      const updateFields: string[] = [];
      const values: any[] = [];

      const validFields = [
        "vorname",
        "nachname",
        "koerpergroesse",
        "geburtsdatum",
        "trikotnummer",
        "position_id",
        "profileImage",
      ];

      const fieldMap: { [key: string]: string } = {
        mannschaftId: "mannschaft_id",
      };

      validFields.forEach((field) => {
        if (profileData[field as keyof User] !== undefined) {
          const dbField = fieldMap[field] || field;
          updateFields.push(`${dbField} = ?`);
          values.push(profileData[field as keyof User]);
        }
      });

      if (profileData.mannschaftId !== undefined) {
        updateFields.push(`mannschaft_id = ?`);
        values.push(profileData.mannschaftId);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      values.push(id);
      const query = `
        UPDATE \`User\`
        SET ${updateFields.join(", ")}
        WHERE uuid = ?
      `;
      await pool.query(query, values);

      const [playerRows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM `User` WHERE uuid = ?",
        [id]
      );

      if (playerRows.length === 0) {
        return res.status(404).json({ error: "Player not found" });
      }

      return res.status(200).json({
        success: true,
        player: playerRows[0],
      });
    } catch (error) {
      console.error("Set profile error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  static async setProfileImage(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { profileImage } = req.body as { profileImage: string };

    if (!profileImage) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    try {
      // Extract base64 data from data URL
      const base64Data = profileImage.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      await pool.query(`UPDATE \`User\` SET profileImage = ? WHERE uuid = ?`, [
        imageBuffer,
        id,
      ]);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Set profile image error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  static async getProfileImage(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT profileImage FROM `User` WHERE uuid = ?",
        [id]
      );

      if (rows.length === 0 || !rows[0].profileImage) {
        return res.status(404).json({
          success: false,
          message: "Player image not found",
        });
      }

      const imageBuffer = rows[0].profileImage;
      const base64Image = imageBuffer.toString("base64");

      return res.status(200).json({
        success: true,
        profileImage: `data:image/jpeg;base64,${base64Image}`,
      });
    } catch (error) {
      console.error("Get profile image error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  static async getBaseStatistics(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;

    try {
      const result = await pool.query<RowDataPacket[]>(
        ProfileDBSqlStatements.GET_PLAYER_STATS_SIMPLE,
        [id]
      );

      const stats = result[0][0];

      return res.status(200).json({
        success: true,
        statistics: {
          spiele: stats.spiele || 0,
          tore: stats.tore || 0,
          assists: stats.assists || 0,
          throws: stats.würfe || 0,
          quoteSeven: parseFloat(stats.quoteSeven) || 0,
          zeitstrafen: stats.zeitstrafen || 0,
          roteKarten: stats.roteKarten || 0,
          paradeQuote: parseFloat(stats.paradeQuote) || 0,
        },
      });
    } catch (error) {
      console.error("Get player by ID error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
}
