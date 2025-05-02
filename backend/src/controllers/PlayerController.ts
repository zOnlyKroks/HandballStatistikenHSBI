import { Request, Response } from "express";
import AuthUserModel from "../model/auth/AuthUserModel";
import UserModel from "../model/user/UserModel";

export class PlayerController {
  /**
   * GET /api/players/:id/partial
   */
  static async getPartial(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const player = await UserModel.findByPk(id);

      if (!player) {
        return res.status(404).json({ success: false, message: "Player not found" });
      }

      return res.status(200).json({
        success: true,
        player: {
          role: player.role,
          position: player.position,
        },
      });
    } catch (error) {
      console.error("Get partial player error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * GET /api/players/:id/full
   */
  static async getFull(req: Request, res: Response) {
    const { id } = req.params;


    try {
      const user = await AuthUserModel.findByPk(id, {
        attributes: ["id", "name", "email", "createdAt", "updatedAt"],
      });
      const player = await UserModel.findByPk(id);

      if (!user || !player) {
        return res.status(404).json({ success: false, message: "Player not found" });
      }

      // Only pick fields needed for full profile
      return res.status(200).json({
        success: true,
        player: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: player.role,
          position: player.position,
          age: player.age,
          height: player.height,
          jerseyNumber: player.jerseyNumber,
        },
      });
    } catch (error) {
      console.error("Get full player error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
}
