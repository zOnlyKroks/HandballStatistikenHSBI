import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import TeamDBSqlStatements from "../sql/team/teamSqlStatements";
import { pool } from "../server";

export class TeamController {
  static async getTeams(req: Request, res: Response): Promise<Response> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        TeamDBSqlStatements.GET_TEAMS
      );

      return res.status(200).json(rows);
    } catch (error) {
      console.error("Get teams error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  static async getTeamMembers(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      const [rows] = await conn.execute<RowDataPacket[]>(
        TeamDBSqlStatements.GET_TEAM_MEMBERS_FOR_TEAM,
        [id]
      );

      await conn.commit();
      return res.status(200).json(rows);
    } catch (error) {
      console.error("Get team members error:", error);
      if (conn) await conn.rollback();
      return res.status(500).json({ error: "Server error" });
    } finally {
      if (conn) conn.release();
    }
  }

  static async getAvailablePlayers(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT
u.uuid AS uuid,
au.email AS email,
u.vorname AS vorname,
u.nachname AS nachname,
u.koerpergroesse AS koerpergroesse,
u.geburtsdatum AS geburtsdatum,
u.trikotnummer AS trikotnummer,
gp.position_title AS position
FROM \`User\` u
JOIN AuthUser au ON u.uuid = au.UUID
LEFT JOIN GamePosition gp ON u.position_id = gp.id
WHERE u.mannschaft_id IS NULL OR u.mannschaft_id = -1
`);

      return res.status(200).json(rows);
    } catch (error) {
      console.error("Get available players error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  static async addPlayerToTeam(req: Request, res: Response): Promise<Response> {
    const { teamId, playerId } = req.params;

    if (!teamId || !playerId) {
      return res
        .status(400)
        .json({ error: "teamId and playerId are required" });
    }

    try {
      // First verify the team exists
      const [teamCheck] = await pool.execute<RowDataPacket[]>(
        `SELECT id FROM Mannschaft WHERE id = ?`,
        [teamId]
      );

      if (teamCheck.length === 0) {
        return res.status(404).json({ error: "Team not found" });
      }

      // Update player's team assignment
      const [result] = await pool.execute<ResultSetHeader>(
        `
        UPDATE \`User\`
        SET mannschaft_id = ?
        WHERE uuid = ?
        AND (mannschaft_id IS NULL OR mannschaft_id = 1)
        `,
        [teamId, playerId]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({
          error: "Player not found or already assigned to a team",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Player successfully added to team",
      });
    } catch (error) {
      console.error("Add player to team error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  static async removePlayerFromTeam(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { playerId } = req.params;

    if (!playerId) {
      return res.status(400).json({ error: "playerId is required" });
    }

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        `
        UPDATE \`User\`
        SET mannschaft_id = NULL
        WHERE uuid = ?
        `,
        [playerId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Player not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Player successfully removed from team",
      });
    } catch (error) {
      console.error("Remove player from team error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  static async getTeamInfo(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `
        SELECT 
          m.id,
          m.Name as teamName,
          l.Name as ligaName,
          l.Stufe as ligaStufe,
          COUNT(u.authUser_uuid) as playerCount
        FROM Mannschaft m
        JOIN Liga l ON m.Liga_id = l.id
        LEFT JOIN \`User\` u ON m.id = u.mannschaft_id
        WHERE m.id = ?
        GROUP BY m.id, m.Name, l.Name, l.Stufe
        `,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Team not found" });
      }

      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error("Get team info error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }

  static async createTeam(req: Request, res: Response): Promise<Response> {
    const { name, leagueId, trainerIds } = req.body;

    if (!name || !leagueId) {
      return res.status(400).json({ error: "Name and league ID are required" });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // Create team
      const [teamResult] = await conn.execute<ResultSetHeader>(
        TeamDBSqlStatements.CREATE_TEAM,
        [name, leagueId, null] // teamImage is null for now
      );

      const teamId = teamResult.insertId;

      // Add trainers to team
      if (trainerIds && trainerIds.length > 0) {
        await conn.execute(TeamDBSqlStatements.ADD_TRAINERS_TO_TEAM, [
          teamId,
          trainerIds,
        ]);
      }

      await conn.commit();
      return res.status(201).json({
        success: true,
        teamId,
        message: "Team created successfully",
      });
    } catch (error) {
      if (conn) await conn.rollback();
      console.error("Create team error:", error);
      return res.status(500).json({ error: "Server error" });
    } finally {
      if (conn) conn.release();
    }
  }

  static async deleteTeam(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // Remove all trainers from team first
      await conn.execute(
        `UPDATE \`User\` SET mannschaft_id = NULL WHERE mannschaft_id = ?`,
        [id]
      );

      // Delete team
      await conn.execute(TeamDBSqlStatements.DELETE_TEAM, [id]);

      await conn.commit();
      return res.status(200).json({
        success: true,
        message: "Team deleted successfully",
      });
    } catch (error) {
      if (conn) await conn.rollback();
      console.error("Delete team error:", error);
      return res.status(500).json({ error: "Server error" });
    } finally {
      if (conn) conn.release();
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        TeamDBSqlStatements.GET_ALL_USERS
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.error("Get all users error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
}
