# CoachLab Frontend - What Is Implemented

This document summarizes what is implemented in the current frontend codebase.

## 1) Core App Structure

- React app bootstrapped with Vite.
- Routing configured with React Router.
- Public and protected route handling in place.
- Global toast notification system mounted at app root.

Implemented in:
- src/main.jsx
- src/App.jsx
- src/components/ProtectedRoute.jsx
- src/components/Toast.jsx

## 2) Routes Implemented

Public routes:
- /login
- /signup
- /setup

Protected routes:
- /dashboard
- /teams
- /users
- /settings

Default behavior:
- / and unknown routes redirect based on auth state.

Implemented in:
- src/App.jsx

## 3) Authentication and Session Handling

Implemented:
- Email/password login flow.
- Workspace signup (workspace + admin creation) flow.
- Logout flow.
- Auth state persisted via localStorage (accessToken, user, workspace).
- Zustand auth store with loading/error support.

Axios/API behavior implemented:
- Authorization header injection from localStorage access token.
- Automatic token refresh on 401 using /auth/refresh.
- Request retry after successful refresh.
- CSRF token bootstrap from /csrf/ and inclusion for non-GET requests.
- CSRF retry logic on CSRF-specific 403 responses.

Implemented in:
- src/store/authStore.js
- src/services/authService.js
- src/services/api.js
- src/config/api.js

## 4) Dashboard Layout and Navigation

Implemented:
- Shared authenticated layout with header, sidebar, and logout action.
- Role-based sidebar filtering (AGENT cannot see Settings menu).
- Responsive sidebar open/close behavior.

Implemented in:
- src/components/DashboardLayout.jsx

## 5) Pages Implemented

### Login Page
- Form validation for email/password.
- Submit action wired to auth store login.
- Success/error toast feedback.
- Redirect to dashboard on success.

Implemented in:
- src/pages/LoginPage.jsx

### Signup Page
- Workspace creation form with validation.
- Industry and timezone selection.
- Password/confirm password validation.
- Submit action wired to workspace creation.
- Redirect to dashboard on success.

Implemented in:
- src/pages/SignupPage.jsx

### Dashboard Page
- Dashboard shell with greeting and cards/sections.
- Pulls workspace data from backend via fetchWorkspace.
- Shows timeline/client sections using workspace-provided data when available.
- Uses fallback values when specific metrics are missing.

Implemented in:
- src/pages/DashboardPage.jsx

### Teams Page
- Team list fetch and render.
- Create team modal.
- Edit team flow.
- Delete team flow (ADMIN-only).
- Team management access for ADMIN and MANAGER roles.

Implemented in:
- src/pages/TeamsPage.jsx
- src/services/teamService.js

### Users Page
- User list fetch and table render.
- Role/status badges and last-login display.
- Invite dialog UI shell shown for ADMIN users.

Implemented in:
- src/pages/UsersPage.jsx
- src/services/userService.js

Note:
- Invite dialog submit is currently UI-only (no invite API call is wired from this page).

### Settings Page
- Fetch workspace details and settings.
- Render workspace information (read-only fields).
- Render permission toggles from settings.permissions.
- Save updated settings (ADMIN-only interaction).

Implemented in:
- src/pages/SettingsPage.jsx
- src/services/workspaceService.js

## 6) Reusable UI Components Implemented

- Button
- Input
- Card (with header/title/content helpers)
- Modal
- Spinner
- Toast
- ProtectedRoute
- DashboardLayout

Implemented in:
- src/components/Button.jsx
- src/components/Input.jsx
- src/components/Card.jsx
- src/components/Modal.jsx
- src/components/Spinner.jsx
- src/components/Toast.jsx
- src/components/ProtectedRoute.jsx
- src/components/DashboardLayout.jsx

## 7) Service Layer and API Endpoints Wired

Auth endpoints wired:
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- POST /auth/accept-invite

Workspace endpoints wired:
- POST /workspaces
- GET /workspaces/me
- GET /settings
- PATCH /settings

User endpoints wired:
- GET /me
- GET /users
- PATCH /users/:id (service method available)
- DELETE /users/:id (service method available)

Team endpoints wired:
- GET /teams
- POST /teams
- PATCH /teams/:id
- DELETE /teams/:id

CSRF endpoint wired:
- GET /csrf/

Implemented in:
- src/config/api.js
- src/services/authService.js
- src/services/workspaceService.js
- src/services/userService.js
- src/services/teamService.js
- src/services/api.js

## 8) Current Gaps / Partial Areas

- Users page invite form is not connected to an invite API call yet.
- Some dashboard metrics/sections are placeholders that depend on backend data availability.
- Google sign-in/sign-up buttons are present as UI elements but not wired to OAuth flow.

## 9) Build and Run

Scripts available:
- npm run dev
- npm run build
- npm run preview
- npm run lint

Defined in:
- package.json
