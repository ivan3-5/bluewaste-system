import { Router, Response, NextFunction } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate, AuthRequest } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userReportHistorySchema,
  userScheduleHistorySchema,
} from "../validators/user.validator";

const router = Router();

router.get(
  "/field-workers",
  authenticate,
  authorize("LGU_ADMIN"),
  UserController.getFieldWorkers,
);
router.get(
  "/",
  authenticate,
  authorize("LGU_ADMIN"),
  UserController.getAllUsers,
);
router.post(
  "/",
  authenticate,
  authorize("LGU_ADMIN"),
  validate(createUserSchema),
  UserController.createUser,
);
router.put(
  "/:id",
  authenticate,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role === "LGU_ADMIN" || req.user?.id === req.params.id) {
      if (req.user?.role !== "LGU_ADMIN") {
        delete req.body.role;
        delete req.body.isActive;
      }
      return next();
    }
    return res.status(403).json({ error: "Insufficient permissions." });
  },
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema),
  UserController.updateUser,
);
router.get(
  "/:id",
  authenticate,
  authorize("LGU_ADMIN"),
  validate(userIdParamSchema, "params"),
  UserController.getUserById,
);
router.get(
  "/:id/reports",
  authenticate,
  authorize("LGU_ADMIN"),
  validate(userIdParamSchema, "params"),
  validate(userReportHistorySchema, "query"),
  UserController.getReportHistory,
);
router.get(
  "/:id/schedules",
  authenticate,
  authorize("LGU_ADMIN"),
  validate(userIdParamSchema, "params"),
  validate(userScheduleHistorySchema, "query"),
  UserController.getScheduleHistory,
);
router.delete(
  "/:id",
  authenticate,
  authorize("LGU_ADMIN"),
  validate(userIdParamSchema, "params"),
  UserController.deleteUser,
);

export default router;
