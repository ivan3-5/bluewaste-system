# Activity Log Feature

The **Activity Log** provides an immutable, server-side audit trail of significant user and administrative actions across the BlueWaste System.

## Architecture Overview

### 1. Database Model (`ActivityLog`)
Defined in `backend/prisma/schema.prisma` (and mirrored in `web/prisma/schema.prisma`):
- **Actor fields**: `userId` (nullable FK to `User` with `onDelete: SetNull`), `userName` (snapshot of actor name), `userRole` (`LGU_ADMIN`, `FIELD_WORKER`, `CITIZEN`, `ANONYMOUS`, `SYSTEM`).
- **Action fields**: `action` (specific event identifier, e.g. `USER_LOGIN`, `REPORT_VERIFIED`), `category` (`ActivityCategory` enum: `AUTH`, `USER`, `REPORT`, `SCHEDULE`, `ZONE`, `SYSTEM`), `description` (human-readable summary).
- **Context fields**: `entityType`, `entityId`, `metadata` (JSON), `createdAt` (server-side UTC timestamp).
- **Indexes**: Indexed on `createdAt DESC`, `userId`, `userRole`, `category`, `action`, `(entityType, entityId)`, and `(category, createdAt DESC)`.

### 2. Backend Service & Security
- **Service** (`backend/src/services/activity-log.service.ts`):
  - `ActivityLogService.log(...)` records events server-side after operations succeed, never throwing to break primary workflows.
  - `sanitizeMetadata(...)` recursively strips sensitive keys (`password`, `token`, `accessToken`, `refreshToken`, `secret`, `otp`, `codeHash`, `authorization`, `cookie`, `apiKey`, `jwt`, `sessionId`, `privateKey`).
  - `ActivityLogService.getLogs(...)` and `getFilterOptions(...)` provide validated, paginated, and filterable queries.
- **Validation** (`backend/src/validators/activity-log.validator.ts`):
  - Zod schemas validate and sanitize `page`, `limit` (max 100), `search`, `userId` (UUID), `userRole`, `category`, `action`, `startDate`, and `endDate`.
- **Routes** (`backend/src/routes/activity-log.routes.ts`):
  - `GET /api/v1/activity-logs` (and `/api/activity-logs` alias)
  - `GET /api/v1/activity-logs/filters`
  - Protected by `authenticate` and `authorize("LGU_ADMIN")`.
  - No `POST`, `PUT`, `PATCH`, or `DELETE` endpoints exist—activity logs cannot be modified or deleted through the application.

### 3. Tracked Operations
Activity logging is integrated into backend controllers (`auth.controller.ts`, `user.controller.ts`, `report.controller.ts`, `schedule.controller.ts`, `reportingZone.controller.ts`):
- **Authentication (`AUTH`)**: `USER_LOGIN`, `USER_LOGOUT`, `USER_REGISTERED`, `USER_EMAIL_VERIFIED`
- **User Management (`USER`)**: `PROFILE_UPDATED`, `USER_CREATED`, `USER_UPDATED`, `USER_ACTIVATED`, `USER_DEACTIVATED`
- **Waste Reports (`REPORT`)**: `REPORT_SUBMITTED`, `REPORT_VERIFIED`, `REPORT_REJECTED`, `REPORT_STATUS_UPDATED`, `REPORT_ASSIGNED`, `SPAM_REPORT_RESTORED`, `REPORT_DELETED`
- **Cleanup Schedules (`SCHEDULE`)**: `SCHEDULE_CREATED`, `SCHEDULE_UPDATED`, `SCHEDULE_STATUS_UPDATED`, `SCHEDULE_DELETED`
- **Reporting Zones (`ZONE`)**: `REPORTING_ZONE_CREATED`, `REPORTING_ZONE_UPDATED`, `REPORTING_ZONE_DELETED`

### 4. Admin Dashboard UI
- **Page**: `web/src/app/dashboard/activity-logs/page.tsx` (with `loading.tsx` skeleton).
- **Data Hook**: `web/src/hooks/useActivityLogs.ts` (`useActivityLogs`, `useActivityLogFilters`).
- **Navigation**: Linked in `Sidebar.tsx` and `Header.tsx` for `LGU_ADMIN` users.
- **Capabilities**: Debounced search, filters by user, role, category, activity type, and date range, pagination, responsive desktop table & mobile cards, empty states, and full light/dark mode support.

### 5. Verification
Run backend integration tests:
```bash
npm test --workspace=backend
```
The suite in `backend/tests/integration/activity-log.test.ts` covers RBAC enforcement, immutability (no write/delete endpoints), query validation, metadata sanitization, and server-side logging integration.
