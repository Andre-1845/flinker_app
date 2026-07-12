---
name: Authentication System
description: Real auth with email + Google OAuth, role-based signup (worker/company), protected routes, auto profile/wallet/reputation creation
type: feature
---
- Email + password auth via Lovable Cloud
- Google OAuth via @lovable.dev/cloud-auth-js
- Signup requires role selection: worker or company
- Email confirmation required (no auto-confirm)
- DB trigger `handle_new_user` auto-creates: profile, user_role, wallet, reputation_scores
- AuthContext provides: user, session, userRole, signOut
- ProtectedRoute component with optional allowedRoles
- Worker routes: /dashboard, /profile, /wallet
- Company routes: /company-dashboard, /company-profile, /company-wallet
- Shared routes: /gigs, /matches, /schedule, /training
- Onboarding links to /login?signup=worker or /login?signup=company
