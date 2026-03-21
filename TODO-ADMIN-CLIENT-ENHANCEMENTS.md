# TODO: Admin/Client Auth and Role-Based UI Enhancements

## Goal

Implement enhanced sign-up/login flow, role-based admin access, client onboarding sync, admin broadcast notifications, and project-scoped client workspace filtering.

## 1. Landing page options

- [ ] Add landing page with two primary actions:
  - Sign up (client only)
  - Log in (admin + client)
- [ ] Ensure Sign up and Log in routes are separate and have distinct behavior.

## 2. Role system for admin users

- [ ] Seed initial Product Manager user in DB (data migration or seed script).
- [ ] Create admin "Team" page UI to manage team members and roles.
- [ ] Add role model features: permissions to pages/features (e.g., analytics, attendance, docs).
- [ ] In admin role creation/assignment flow, allow email/password + page access rights.
- [ ] On admin login, show sidebar with only allowed items.
- [ ] Enforce access control on server/API and client routes.

## 3. Client sign-up onboarding

- [ ] Sign up route creates a client user with matched schema.
- [ ] On successful sign-up, insert into Leads in admin panel (API + DB linkage).
- [ ] On client project creation, reflect project in admin project list.
- [ ] Validate admin panel data sync paths for leads/projects; add API tests.

## 4. Admin broadcast notifications

- [ ] Add broadcast notifications UI to admin panel.
- [ ] Provide selector for audience: admins, clients, or both.
- [ ] Store audience type in notifications data.
- [ ] Ensure client panel sees client-targeted notifications; admin sees admin/all.

## 5. Client workspace filters + project association

- [ ] For client modules (meetings, documents, messages, milestones, team, invoices, budgets, CRs, support), add project filter at top:
  - All projects
  - Specific project
- [ ] Enforce creation links to selected project (mandatory selection) for these entities.
- [ ] Backend: include projectId in create APIs and validate project membership.
- [ ] UI: filter lists by selected project.

## 6. Non-functional and supporting tasks

- [ ] Auth and session handling across admin/client login flows.
- [ ] Database migration for roles, permissions, leads link, notification audience metadata.
- [ ] Update tests (unit + e2e) for new flows.
- [ ] Update documentation and release notes.

## Prioritization (Phase 1)

1. Landing page + login/signup routing
2. Seeding product manager + role management skeleton
3. Client sign-up + admin leads sync
4. Project-based client filters
5. Admin broadcast audience controls

---

> Once this plan is accepted, implement in phases with PR per major section.
