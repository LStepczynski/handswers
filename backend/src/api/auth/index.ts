import { asyncHandler, setAuthCookies, UserError } from "@utils/index";
import { Router, Request, Response } from "express";

import dotenv from "dotenv";
import { verifyGoogleToken } from "@utils/auth/googleAuth";
import { JwtUser } from "@type/user";
dotenv.config();

const router = Router();

router.get(
  "/google",
  asyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
      throw new UserError("Google code not provided", 400);
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "http://localhost:3000/dev/auth/google",
        grant_type: "authorization_code",
      }),
    });
    const tokenData = (await tokenRes.json()) as any;

    const id_token = tokenData.id_token;

    const payload = (await verifyGoogleToken(id_token)) as any;

    const jwtPayload: JwtUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      roles: ["user"],
    };

    setAuthCookies(jwtPayload, res);

    res.cookie("user", JSON.stringify(jwtPayload), {
      httpOnly: false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined,
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    res.redirect(`${process.env.FRONTEND_URL}/login-redirect`);
  })
);

export default router;
