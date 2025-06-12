import express, { Request, Response, NextFunction } from "express";
import { PlayerController } from "../controllers/PlayerController";

// Create a router instance
const router = express.Router();

// GET /players/:id/full
router.get(
  "/players/:id/full",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.getFull(req, res);
    } catch (error) {
      console.error("Error getting full player data:", error);
      next(error);
    }
  }
);

router.get(
  "/positions",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.getPositions(req, res);
    } catch (error) {
      console.error("Error getting basic player data:", error);
      next(error);
    }
  }
);

router.delete(
  "/players/:id/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.deletePlayer(req, res);
    } catch (error) {
      console.error("Error getting basic player data:", error);
      next(error);
    }
  }
);

router.post(
  "/players/:id/profileData",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.setNonEssentialProfileData(req, res);
    } catch (error) {
      console.error("Error getting basic player data:", error);
      next(error);
    }
  }
);

router.post(
  "/players/:id/profileImage",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.setProfileImage(req, res);
    } catch (error) {
      console.error("Error setting profile image:", error);
      next(error);
    }
  }
);

router.get(
  "/users/all",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.getAllUsers(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
