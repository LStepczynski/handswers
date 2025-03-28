import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtUser } from "@type/index";
import { InternalError, UserError } from "@utils/statusError";

dotenv.config();

/**
 * Verifies a JSON Web Token (JWT).
 *
 * @param {string} token - The JWT to verify.
 * @param {boolean} refresh - Detremines if the token is a refresh token
 * @returns {JwtUser} The decoded payload if the token is valid.
 * @throws {InternalError} Throws an InternalError if the token is invalid or expired.
 */
export const verifyToken = (
  token: string,
  refresh: boolean = false
): JwtUser => {
  const secret = refresh
    ? process.env.JWT_REFRESH_SECRET
    : process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new InternalError(
      "JWT_SECRET is not configured in environment variables.",
      500
    );
  }

  try {
    const decoded = jwt.verify(token, secret) as any;

    delete decoded.iat;
    delete decoded.exp;

    return decoded as JwtUser;
  } catch (err: any) {
    throw new UserError("Invalid or expired token.", 403);
  }
};
