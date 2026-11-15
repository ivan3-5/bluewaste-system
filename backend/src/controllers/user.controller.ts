import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { UserService } from "../services/user.service";
import { handleControllerError, QueryFilters } from "../utils/http";
import type { UserReportHistoryQuery, UserScheduleHistoryQuery } from "../validators/user.validator";

export class UserController {
  static async getUserById(req: AuthRequest, res: Response) {
    try {
      res.set("Cache-Control", "private, no-store").json(await UserService.getUserById(req.params.id));
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch user", "USER_FETCH_FAILED");
    }
  }

  static async getReportHistory(req: AuthRequest, res: Response) {
    try {
      const query = req.query as unknown as UserReportHistoryQuery;
      res.set("Cache-Control", "private, no-store").json(await UserService.getReportHistory(req.params.id, query));
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch report history", "USER_REPORT_HISTORY_FAILED");
    }
  }

  static async getScheduleHistory(req: AuthRequest, res: Response) {
    try {
      const query = req.query as unknown as UserScheduleHistoryQuery;
      res.set("Cache-Control", "private, no-store").json(await UserService.getScheduleHistory(req.params.id, query));
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch schedule history", "USER_SCHEDULE_HISTORY_FAILED");
    }
  }

  static async getFieldWorkers(req: AuthRequest, res: Response) {
    try {
      const workers = await UserService.getFieldWorkers();
      res.json(workers);
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch field workers", "USER_FETCH_FAILED");
    }
  }

  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const query = (req.query || {}) as QueryFilters;
      const result = await UserService.getAllUsers(query);
      res.json(result);
    } catch (error) {
      handleControllerError(res, error, "Failed to fetch users", "USER_FETCH_FAILED");
    }
  }

  static async createUser(req: AuthRequest, res: Response) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      handleControllerError(res, error, "Failed to create user", "USER_CREATE_FAILED");
    }
  }

  static async updateUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.updateUser(id, req.body, req.user?.id);
      res.json(user);
    } catch (error) {
      handleControllerError(res, error, "Failed to update user", "USER_UPDATE_FAILED");
    }
  }

  static async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user?.id;
      const result = await UserService.deleteUser(id, requestingUserId);
      res.json(result);
    } catch (error) {
      handleControllerError(res, error, "Failed to delete user", "USER_DELETE_FAILED");
    }
  }
}
