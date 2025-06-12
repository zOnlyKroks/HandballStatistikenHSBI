import express, { Request, Response, NextFunction } from "express";
import { TeamController } from "../controllers/TeamController";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await TeamController.getTeams(req, res);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:id/players",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TeamController.getTeamMembers(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/available-players",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TeamController.getAvailablePlayers(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:teamId/add-player/:playerId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TeamController.addPlayerToTeam(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await TeamController.createTeam(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await TeamController.deleteTeam(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
