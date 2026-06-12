import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import { authenticate, optionalAuth } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  createScheduleSchema,
  updateScheduleSchema,
  updateScheduleStatusSchema,
  scheduleFilterSchema,
} from "../validators/schedule.validator";

const router = Router();

// Public / optional auth routes
router.get("/upcoming", optionalAuth, ScheduleController.getUpcoming);

// Worker's assigned schedules
router.get(
  "/my-schedules",
  authenticate,
  authorize("FIELD_WORKER"),
  ScheduleController.getMySchedules,
);

// Admin CRUD
router.post(
  "/",
  authenticate,
  authorize("LGU_ADMIN"),
  validate(createScheduleSchema),
  ScheduleController.create,
);

router.get(
  "/",
  authenticate,
  authorize("LGU_ADMIN"),
  validate(scheduleFilterSchema, "query"),
  ScheduleController.getSchedules,
);

// Single schedule routes
router.get(
  "/:id",
  authenticate,
  authorize("LGU_ADMIN", "FIELD_WORKER"),
  ScheduleController.findById,
);

router.put(
  "/:id",
  authenticate,
  authorize("LGU_ADMIN"),
  validate(updateScheduleSchema),
  ScheduleController.update,
);

router.put(
  "/:id/status",
  authenticate,
  authorize("LGU_ADMIN", "FIELD_WORKER"),
  validate(updateScheduleStatusSchema),
  ScheduleController.updateStatus,
);

router.delete(
  "/:id",
  authenticate,
  authorize("LGU_ADMIN"),
  ScheduleController.delete,
);

export default router;
