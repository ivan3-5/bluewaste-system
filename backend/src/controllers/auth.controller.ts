import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === "Email already registered") {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error: any) {
      console.error("Login Error Details:", error);
      if (error.message === "Invalid email or password") {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: "Login failed", details: error.message });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await AuthService.getProfile(req.user!.id);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: "Profile update failed" });
    }
  }
}
