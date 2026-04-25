import { IAuthProvider } from "../repositories/interfaces";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_fallback_key";

export class JwtAuthProvider implements IAuthProvider {
  async getUserFromToken(token: string): Promise<{ id: string; email: string; role: string; [key: string]: unknown } | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (typeof decoded === "object" && decoded && "id" in decoded && "email" in decoded && "role" in decoded) {
        return decoded as { id: string; email: string; role: string; [key: string]: unknown };
      }
      return null;
    } catch (err) {
      console.error("JWT Verification Error:", err);
      return null;
    }
  }

  generateToken(payload: Record<string, unknown>): string {
    // Generates a JWT valid for 24 hours
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
