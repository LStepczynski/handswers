import { Request, Response, Router } from "express";

import authRouter from "@api/auth/index";
import userRouter from "@api/user/index";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);

router.get("/health", async (req: Request, res: Response) => {
  res.status(200).json("Health check");
});

export default router;
