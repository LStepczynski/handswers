import { JwtUser } from "@type/user";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
