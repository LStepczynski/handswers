import { Request, Response, Router } from "express";

const router = Router();

router.get("/health", async (req: Request, res: Response) => {
  res.status(200).json("Health check");
});

export default router;
