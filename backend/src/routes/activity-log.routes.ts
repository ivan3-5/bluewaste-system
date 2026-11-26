import { Router } from "express";
import { ActivityLogController } from "../controllers/activity-log.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { activityLogQuerySchema } from "../validators/activity-log.validator";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("LGU_ADMIN"),
  validate(activityLogQuerySchema, "query"),
  ActivityLogController.getLogs,
);

router.get(
  "/filters",
  authenticate,
  authorize("LGU_ADMIN"),
  ActivityLogController.getFilterOptions,
);

export default router;
