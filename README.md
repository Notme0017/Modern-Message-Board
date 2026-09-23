# Modern Message Board

A message board built with Express, PostgreSQL, and Passport.js authentication. Users can sign up, log in, post messages, and unlock additional privileges (membership, admin) via passcodes.

## Features

- **User authentication** — sign up, log in, and log out using Passport's local strategy with hashed passwords (bcrypt)
- **Session management** — sessions persisted in PostgreSQL via `connect-pg-simple`, so logins survive server restarts
- **Message board** — authenticated users can post messages; all visitors can view them
- **Membership tier** — users can unlock "member" status with a shared passcode, revealing message authorship and timestamps
- **Admin tier** — members can further unlock admin status with a separate passcode, gaining the ability to delete any message
- **Server-side validation** — form input validated with `express-validator` (required fields, length limits, password confirmation, uniqueness checks)
- **Custom styling** — a light grey/reddish theme, with each form visually distinguished by color

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js, Express |
| Templating | EJS |
| Database | PostgreSQL (`pg`) |
| Auth | Passport.js (local strategy) |
| Sessions | `express-session` + `connect-pg-simple` |
| Password hashing | bcrypt |
| Validation | express-validator |
| Styling | Plain CSS |

## Project Structure

```
.
├── controllers/
│   ├── authController.js       # signup / login / logout handlers
│   ├── encryption.js           # bcrypt hashing / comparison helpers
│   ├── messageController.js    # create / delete messages, membership, admin
│   ├── passportController.js   # Passport local strategy, serialize/deserialize
│   └── validators.js           # express-validator chains for each form
├── db/
│   ├── pool.js                 # PostgreSQL connection pool
│   ├── populatedb.js           # schema setup script
│   └── queries.js              # all raw SQL queries
├── public/
│   └── styles.css              # site-wide styling
├── routes/
│   ├── indexRouter.js          # auth + page routes
│   └── messageRouter.js        # message create/delete routes
├── views/
│   ├── partials/
│   │   ├── errors.ejs          # shared validation error list
│   │   └── nav.ejs             # top navigation bar
│   ├── admin.ejs                # become-admin passcode form
│   ├── error.ejs                 # generic error page
│   ├── index.ejs                  # message list / home page
│   ├── log-in.ejs
│   ├── membership.ejs            # join-membership passcode form
│   ├── new-message.ejs
│   └── sign-up.ejs
├── app.js
├── package.json
└── .env                          # environment variables (not committed)
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A running PostgreSQL instance (local or hosted)

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd Modern-Message-Board
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/modern_message_board
COOKIE_SECRET=some-long-random-string
```

> Adjust variable names above to match whatever your `db/pool.js` and passcode-lookup logic actually expect.

### 3. Set up the database

Run the seed script to create the required tables (`users`, `messages`, `user_sessions`):

```bash
node db/populatedb.js <your-connection-string>
```

### 4. Start the server

```bash
node app.js
```

By default, the app runs on:

```
http://localhost:8080
```

## Usage

1. **Sign up** for an account from the nav bar.
2. **Log in** with your new credentials.
3. **Post a message** from the "New Message" link.
4. **Join membership** using the membership passcode to reveal message authors and timestamps.
5. **Become an admin** (members only) using the admin passcode to gain message-deletion privileges.

## Database Schema

**`users`**
| Column | Type |
|---|---|
| id | INTEGER, primary key |
| firstname | VARCHAR(255) |
| lastname | VARCHAR(255) |
| username | VARCHAR(255), unique, not null |
| password | VARCHAR(255), not null (bcrypt hash) |
| membership | BOOLEAN, default false |
| admin | BOOLEAN, default false |

**`messages`**
| Column | Type |
|---|---|
| id | INTEGER, primary key |
| title | VARCHAR(255) |
| message | TEXT |
| user_id | INTEGER, references `users(id)` |
| time | TIMESTAMPTZ, default now() |

**`user_sessions`**
Standard `connect-pg-simple` session table (`sid`, `sess`, `expire`).

## Notes

- Passwords are hashed with bcrypt before storage — plaintext passwords are never saved.
- Session cookies are configured with a short expiry for testing; adjust `cookie.maxAge` in `app.js` for production use.
- Membership and admin status are stored per-user in the database, so they persist across sessions.
