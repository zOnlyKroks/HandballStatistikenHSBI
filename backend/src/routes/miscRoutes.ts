import { Request, Response, NextFunction, Router } from "express";
import MiscController from "../controllers/MiscController";

const router = Router();

router.get(
  "/ligen",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await MiscController.getLigen(req, res);
    } catch (error) {
      console.error("Error getting ligen data:", error);
      next(error);
    }
  }
);

export default router;
