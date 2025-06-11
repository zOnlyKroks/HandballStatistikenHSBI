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
  "/players/:id/basic",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.getBasic(req, res);
    } catch (error) {
      console.error("Error getting basic player data:", error);
      next(error);
    }
  }
);

router.get(
  "/players/:id/accuracy",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.getAccuracy(req, res);
    } catch (error) {
      console.error("Error getting basic player data:", error);
      next(error);
    }
  }
);

router.get(
  "/players/:id/base-statistics",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.getBaseStatistics(req, res);
    } catch (error) {
      console.error("Error getting basic player data:", error);
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

// GET /players/:id/profileImage
router.get(
  "/players/:id/profileImage",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await PlayerController.getProfileImage(req, res);
    } catch (error) {
      console.error("Error getting profile image:", error);
      next(error);
    }
  }
);

export default router;
