import type { AuthContext } from "../middleware/auth.js";

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
