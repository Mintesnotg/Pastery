import type { AuthContext } from "../../modules/authentication/auth.middleware.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      user?: AuthContext;
      permissions?: string[];
    }
  }
}

export {};
