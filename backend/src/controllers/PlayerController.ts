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

      const [actionRows] = await pool.execute(
        ProfileDBSqlStatements.GET_PLAYER_ACCURACY(
          (req.query.lookbackTime as string) ?? ""
        ),
        [id, id]
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

      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT profileImage FROM `User` WHERE uuid = ?",
        [id]
      );

      if (rows.length === 0 || !rows[0].profileImage) {
        rows[0].profileImage = {
          profileImage: Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8//8/AwAI/wH+9Q4AAAAASUVORK5CYII="
          ),
        };
      }

      const imageBuffer = rows[0].profileImage;
      const base64Image = imageBuffer.toString("base64");

      playerData.profileImage = `data:image/jpeg;base64,${base64Image}`;
      playerData.accuracy = {
        gesamtSchuesse,
        schuesseAufZiel,
        genauigkeitProzent,
      };

      playerData.statistics = await PlayerController.getBaseStatistics(
        req,
        res
      );

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

  static async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        ProfileDBSqlStatements.GET_ALL_USERS
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.error("Get all users error:", error);
      return res.status(500).json({ error: "Server error" });
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

  static async getBaseStatistics(
    req: Request,
    res: Response
  ): Promise<{
    spiele: number;
    tore: number;
    assists: number;
    throws: number;
    quoteSeven: number;
    zeitstrafen: number;
    roteKarten: number;
    paradeQuote: number;
    paraden: number;
    gegnerWuerfe: number;
  }> {
    const { id } = req.params;

    try {
      const [
        [spieleRow],
        [toreRow],
        [assistsRow],
        [würfeRow],
        [sevenRow],
        [zeitRow],
        [rotRow],
        [saveRow],
      ] = await Promise.all([
        pool.query<RowDataPacket[]>(
          ProfileDBSqlStatements.GET_PLAYER_GAMES(
            (req.query.lookbackTime as string) ?? ""
          ),
          [id, id]
        ),
        pool.query<RowDataPacket[]>(
          ProfileDBSqlStatements.GET_PLAYER_GOALS(
            (req.query.lookbackTime as string) ?? ""
          ),
          [id, id]
        ),
        pool.query<RowDataPacket[]>(
          ProfileDBSqlStatements.GET_PLAYER_ASSISTS(
            (req.query.lookbackTime as string) ?? ""
          ),
          [id, id]
        ),
        pool.query<RowDataPacket[]>(
          ProfileDBSqlStatements.GET_PLAYER_SHOTS(
            (req.query.lookbackTime as string) ?? ""
          ),
          [id, id]
        ),
        pool.query<RowDataPacket[]>(
          ProfileDBSqlStatements.GET_PLAYER_SEVEN_METER(
            (req.query.lookbackTime as string) ?? ""
          ),
          [id, id]
        ),
        pool.query<RowDataPacket[]>(
          ProfileDBSqlStatements.GET_TIME_PENALTIES(
            (req.query.lookbackTime as string) ?? ""
          ),
          [id, id]
        ),
        pool.query<RowDataPacket[]>(
          ProfileDBSqlStatements.GET_RED_CARDS(
            (req.query.lookbackTime as string) ?? ""
          ),
          [id, id]
        ),
        pool.query<RowDataPacket[]>(
          ProfileDBSqlStatements.GET_SAVE_QUOTE(
            (req.query.lookbackTime as string) ?? ""
          ),
          [id, id]
        ),
      ]);

      const spiele = spieleRow[0]?.spiele || 0;
      const tore = toreRow[0]?.tore || 0;
      const assists = assistsRow[0]?.assists || 0;
      const throws = würfeRow[0]?.würfe || 0;

      const sevenGoals = sevenRow[0]?.sevenGoals || 0;
      const sevenAttempts = sevenRow[0]?.sevenAttempts || 0;
      const quoteSeven = sevenAttempts ? sevenGoals / sevenAttempts : 0;

      const zeitstrafen = zeitRow[0]?.zeitstrafen || 0;
      const roteKarten = rotRow[0]?.roteKarten || 0;

      const paraden = saveRow[0]?.Parade_Aktionen || 0;
      const gegnerWuerfe = saveRow[0]?.Gegentor_Aktionen || 0;
      const paradenQuote = saveRow[0]?.Paradequote_in_Prozent || 0;

      return {
        spiele,
        tore,
        assists,
        throws,
        quoteSeven: parseFloat(quoteSeven.toFixed(2)),
        zeitstrafen,
        roteKarten,
        paraden: paraden,
        gegnerWuerfe: gegnerWuerfe,
        paradeQuote: paradenQuote,
      };
    } catch (error) {
      console.error("Get player base stats error:", error);
      return {
        spiele: 0,
        tore: 0,
        assists: 0,
        throws: 0,
        quoteSeven: 0,
        zeitstrafen: 0,
        roteKarten: 0,
        paradeQuote: 0,
        paraden: 0,
        gegnerWuerfe: 0,
      };
    }
  }
}
