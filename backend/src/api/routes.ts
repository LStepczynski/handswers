import { Request, Response, Router } from "express";

import authRouter from "@api/auth/index";

const router = Router();

router.use("/auth", authRouter);

router.get("/health", async (req: Request, res: Response) => {
  res.status(200).json("Health check");
});

export default router;
