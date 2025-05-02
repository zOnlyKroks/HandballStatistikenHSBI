import express, { Request, Response, NextFunction } from "express";
import { PlayerController } from "../controllers/PlayerController";

// Create a router instance
const router = express.Router();

// GET /players/:id/partial
router.get(
  "/players/:id/partial",
  (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const result = await PlayerController.getPartial(req,res);
        if (!result) {
          return res.status(404).send("Player not found");
        }
        return result;
      } catch (error) {
        console.error("Error getting partial player data:", error);
        return next(error);
      }
    })();
  }
);
// GET /players/:id/full
router.get(
  "/players/:id/full",
  (req: Request, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const result = await PlayerController.getFull(req,res);
        if (!result) {
          return res.status(404).send("Player not found");
        }
        return result;
      } catch (error) {
        console.error("Error getting full player data:", error);
        return next(error);
      }
    })();
  }
);

export default router;
