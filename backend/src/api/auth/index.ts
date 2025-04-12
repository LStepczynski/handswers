import {
  asyncHandler,
  setAuthCookies,
  UserError,
  verifyToken,
  verifyGoogleToken,
  generateToken,
  getUnixTimestamp,
} from "@utils/index";
import { Router, Request, Response } from "express";

import dotenv from "dotenv";
import { JwtUser } from "@type/user";
import { EntityCrud } from "@services/entityCrud";
import { UserCrud } from "@services/userCrud";
import { AuthResponse } from "@type/authResponse";
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

    const DBUsers = await UserCrud.getByEmail(payload.email);
    if (DBUsers.length != 0 && DBUsers[0].enabled) {
      const jwtPayload: JwtUser & { exp: number } = {
        id: DBUsers[0].id,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        roles: DBUsers[0].roles,
        exp:
          getUnixTimestamp() +
          Number(process.env.JWT_ACCESS_EXPIRATION) * 60 * 60,
      };

      setAuthCookies(jwtPayload, res);

      res.cookie("loginResponse", JSON.stringify(jwtPayload), {
        httpOnly: false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.DOMAIN
            : undefined,
        maxAge: 30 * 60 * 1000, // 30 minutes
      });

      return res.redirect(`${process.env.FRONTEND_URL}/login-redirect`);
    } else {
      res.cookie(
        "loginResponse",
        JSON.stringify({
          unregistered: DBUsers.length == 0,
          disabled: DBUsers.length != 0 && !DBUsers[0].enabled,
        }),
        {
          httpOnly: false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
          domain:
            process.env.NODE_ENV === "production"
              ? process.env.DOMAIN
              : undefined,
          maxAge: 30 * 60 * 1000, // 30 minutes
        }
      );

      return res.redirect(`${process.env.FRONTEND_URL}/login-redirect`);
    }
  })
);

/**
 * @route GET auth/refresh
 * @async
 *
 * Endpoint to refresh the user's authentication token.
 *
 * @description Verifies the provided refresh token, generates a new authentication token, and sets it in an HTTP-only cookie.
 *
 * @throws {UserError} 401 - If the refresh token is missing or invalid.
 *
 * @response {200} - Token refresh successful. Returns a new access token and user information.
 * @response {401} - Missing or invalid refresh token.
 */
router.get(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    // Check for the refresh token
    if (!req.cookies.refreshToken) {
      throw new UserError("Missing refresh token.", 401);
    }

    // remove the `exp` and `iat` properties
    const payload = verifyToken(req.cookies.refreshToken, true);

    const dbUser = await UserCrud.getById(payload.id);
    if (dbUser == null) {
      throw new UserError("User not found.", 404);
    }
    if (!dbUser.enabled) {
      throw new UserError("Account disabled.", 403);
    }

    // Generate a new access token
    const newToken = generateToken(payload);

    // Return the JWT access token in a cookie
    res.cookie("token", newToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      domain:
        process.env.NODE_ENV === "production"
          ? ".projectcatalog.click"
          : undefined,
      maxAge: 30 * 60 * 1000,
    });

    // Return the response
    const response: AuthResponse<null> = {
      status: "success",
      data: null,
      message: "Token refresh successful.",
      statusCode: 200,
      auth: {
        user: {
          ...payload,
          exp:
            getUnixTimestamp() +
            Number(process.env.JWT_ACCESS_EXPIRATION) * 60 * 60,
        },
      },
    };

    res.status(response.statusCode).send(response);
  })
);

export default router;
