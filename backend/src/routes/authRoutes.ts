import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();

router.post("/register", async (req, res, next) => {
	try {
		await AuthController.register(req, res);
	} catch (error) {
		next(error);
	}
});

router.post("/login", async (req, res, next) => {
  try {
      await AuthController.login(req, res);
  } catch (error) {
      next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
      await AuthController.logout(req, res);
  } catch (error) {
      next(error);
  }
});

router.get("/register", async (req, res, next) => {
  try {
      await AuthController.profile(req, res);
  } catch (error) {
      next(error);
  }
});

export default router;
