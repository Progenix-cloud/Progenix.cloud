# Task Completion & Client Project Filtering Implementation

## Approved Plan Summary

- Enhance admin task workflow: Mark completed -> review -> approve -> auto-mark attendance.
- Standardize client pages: Project filter default "All", all items project-scoped.

## Steps (Backend first, then UI)

### 1. ✅ [DONE] Planning & Analysis

- Analyzed files, APIs, existing review/attendance logic.

### 2. Backend Enhancements

- [ ] Edit app/api/tasks/[taskId]/[action]/route.ts: On complete/approve, auto-mark Attendance for assigned user on task date (full day present).
- [ ] Verify/update lib/db.ts: markAttendanceForUser(userId, date) -> upsert Attendance {status:'present', date, checkIn:startOfDay, checkOut:endOfDay}.
- [ ] Prisma: Ensure Attendance model has taskId? (optional relation), generate/push if changes.
- [ ] API validates: projectId required/valid for client on creates (meetings, CRs/support, budget items).

### 3. Admin UI Fixes

- [ ] app/admin/task-review/page.tsx: Ensure approve triggers attendance mark (already calls complete).
- [ ] Add/edit admin task list (app/admin/task-scheduling/page.tsx or new tasks/page.tsx): Button "Submit for Review" -> status='submitted'.
- [ ] app/admin/attendance/page.tsx: Link show completed tasks.

### 4. Client Filtering Standardization

- [✅] app/client/support/page.tsx: Add project Select default null, filter getChangeRequests(projectId), create require projectId.
- [✅] app/client/budget/page.tsx: Add project Select, SWR with projectId, filter charts/data.
- [ ] Standardize others (invoices, meetings, etc.): Default "All Projects" (projectId=null fetches all), filter lists.
  - Priority: notifications, feedback if no filter.

### 5. Testing & Completion

- [ ] Prisma generate/push.
- [ ] Test workflow: Admin submit -> PM approve -> task complete + attendance.
- [ ] Client pages: Load all default, filter, create with project.
- [ ] attempt_completion.

Current Step: 2. Backend (confirm files first).
