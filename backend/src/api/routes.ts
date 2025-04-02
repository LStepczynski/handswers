import { Request, Response, Router } from "express";

import authRouter from "@api/auth/index";
import userRouter from "@api/user/index";
import roomRouter from "@api/room/index";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/room", roomRouter);

router.get("/health", async (req: Request, res: Response) => {
  res.status(200).json("Health check");
});

export default router;
