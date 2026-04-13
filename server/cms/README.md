# YGO CMS (Next.js)

Next.js admin CMS for MongoDB user management.

## Features

- Admin-only login for dashboard access
- Create users with username, email, and password
- Create and manage `news` posts with unique slugs
- Manage public `background` image items
- Manage public `cover` image items
- Manage `deck` items (`name`, `owner`, `main`, `extra`, `side`)
- Password strength validation using `zxcvbn`
- Password recovery flow with token-based reset
- MongoDB persistence via `mongoose`

## Setup

1. Create env file:

   ```bash
   cp server/cms/.env.example configuration/.env.local
   ```

2. Set values in `configuration/.env.local`:

   - `MONGODB_URI`
   - `SESSION_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open:

   - `http://localhost:3000/login` for admin login
   - `http://localhost:3000/recover` for password recovery

## Notes

- The first admin account is auto-created from env vars if no admin exists.
- Recovery route returns reset URL in API response for local/dev usage.
- `npm run cms:seed:dummy-users` always creates a fixed test account:
  - username: `dummy_test`
  - email: `dummy_test@ygo.local`
  - password: `DummyUser123!`
- The seed script also creates additional timestamped dummy users with the same password.
