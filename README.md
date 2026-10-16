# HUG Photos

A professional photography portfolio and content-management platform. The public
site showcases photographs, tells the studio's story, and accepts enquiries. A
password-protected admin dashboard lets the photographer upload, curate, and
publish work, read contact messages, edit the website name, contact details and
social links, and change the login password.

## Tech stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS v4** (CSS-first theme tokens in `app/globals.css`)
- **MongoDB** via **Mongoose**
- **JWT session cookies** signed with `jose`; passwords hashed with `bcryptjs`
- **Cloudinary** (optional) or the local filesystem for image storage
- **Zod** for request validation

## Requirements

- Node.js 20.9+ (developed on Node 24)
- A MongoDB instance (local `mongod` or a MongoDB Atlas cluster)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   At minimum set `MONGODB_URI`. In production you must also set a strong
   `AUTH_SECRET` (the app refuses to start sessions without one in production).

3. Start the development server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

4. Open the admin area at http://localhost:3000/admin/login.

### Initial administrator

The first administrator is created automatically the first time a login is
attempted and no administrator account exists yet — but only if **both**
`ADMIN_INITIAL_USERNAME` and `ADMIN_INITIAL_PASSWORD` are set (server-side env
vars; `ADMIN_USERNAME`/`ADMIN_PASSWORD` still work as legacy aliases). There is
**no default password**: if the variables are unset, seeding is skipped and
login is refused until an administrator exists.

You can also create the account explicitly before starting the server:

```bash
npm run init-admin
```

The script never overwrites an existing administrator (pass `--allow-multiple`
only if you really want to add a second account).

> The password is hashed with bcrypt (12 rounds) before it is written to MongoDB —
> the plaintext is never stored. Change the password after your first sign-in from
> **Settings → Change password**, and never keep bootstrap credentials in production.

### Recovering / resetting the administrator password

- **From the dashboard:** sign in, open **Settings → Change password**.
- **If you forgot the password** and still have server access, set
  `ADMIN_INITIAL_PASSWORD` to the new value and run the one-time script with a
  temporary username override only if the account is missing. For an existing
  account the script refuses to overwrite it — reset the hash directly instead:

  ```bash
  node --env-file-if-exists=.env.local -e "const m=require('mongoose'),b=require('bcryptjs');(async()=>{await m.connect(process.env.MONGODB_URI);const A=m.models.Admin||m.model('Admin',new m.Schema({username:String,passwordHash:String},{timestamps:true}));const r=await A.updateOne({username:process.env.ADMIN_INITIAL_USERNAME||'clickmedia'},{passwordHash:await b.hash(process.env.ADMIN_INITIAL_PASSWORD,12)});console.log(r.modifiedCount?'Password reset.':'No such admin.');await m.disconnect();})()"
  ```

Failed sign-in attempts are rate-limited (5 failures per username+IP locks the
combination out for 15 minutes) to slow down brute-force attacks.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `AUTH_SECRET` | Yes in production | 16+ char secret used to sign session cookies. |
| `AUTH_SESSION_MAX_AGE` | No | Session lifetime in seconds (default `604800`, 7 days). |
| `MAX_UPLOAD_MB` | No | Max size per image in MB (default `15`). |
| `ADMIN_INITIAL_USERNAME` | No | Bootstrap admin username (3+ chars). Seeding is skipped if unset. |
| `ADMIN_INITIAL_PASSWORD` | No | Bootstrap admin password (8+ chars). Seeding is skipped if unset. |
| `CLOUDINARY_CLOUD_NAME` | No | Enables Cloudinary storage when set with the two keys below. |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret. |
| `CLOUDINARY_FOLDER` | No | Cloudinary folder prefix (default `hug-photos`). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | WhatsApp number (no `+`) for the floating chat button; falls back to `lib/site.ts`. |
| `NEXT_PUBLIC_SITE_URL` | No | Public base URL used in metadata. Falls back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL`/`VERCEL_URL`, then `http://localhost:3000`. |

## Image storage

- **Local (default):** if the three Cloudinary variables are absent, uploads are
  written to `public/uploads/` and served from `/uploads/...`. This folder is
  git-ignored (the folder itself is kept via `.gitkeep`). This is fine for local
  development but **not** for serverless or ephemeral hosts.
- **Cloudinary:** set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
  `CLOUDINARY_API_SECRET` to store uploads on Cloudinary instead. Recommended for
  production.

Uploads accept JPEG, PNG, WebP, AVIF, and GIF. Images are never stored inside
MongoDB — only their URLs and metadata are.

## Routes

Public:

- `/` — home (hero, about, services, featured work, contact). The work sections
  show photographs flagged **Featured** in the dashboard, falling back to the
  most recent published uploads when none are featured.
- `/gallery` — full photo gallery with a fullscreen lightbox
- `/about` — studio information
- `/contact` — enquiry form (messages are stored in MongoDB)

Admin:

- `/admin/login` — sign in
- `/admin/dashboard` — upload, manage photos, read messages, settings

API:

- `GET /api/photos` — public gallery (`?page=`, `?pageSize=`, `?category=`, `?featured=true&limit=`)
- `POST /api/contact` — submit an enquiry
- `/api/admin/*` — authenticated session, uploads, photo/message management,
  website & contact/social settings (`GET`/`PUT /api/admin/settings`), password
- `GET /api/admin/upload-signature` — signed parameters for direct-to-Cloudinary uploads

## Website settings

From the dashboard **Settings** tab you can manage the website name, telephone,
email, WhatsApp number and location, plus social links (Instagram, Facebook,
TikTok, YouTube, LinkedIn and an "other" link). These values are stored in the
singleton `Setting` document and are rendered on the public site — the footer,
contact page and floating WhatsApp button. Blank fields fall back to the
defaults in `lib/site.ts`. Only absolute `http(s)://` URLs are accepted for
social links.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Produce a production build. |
| `npm run start` | Run the production build. |
| `npm run db` | Start a persistent local MongoDB (data in `.data/mongodb`). |
| `npm run check-db` | Verify the MongoDB connection and print a safe summary (collections, admin usernames). |
| `npm run init-admin` | Create the initial administrator account (never overwrites existing ones). |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run the TypeScript compiler without emitting. |

## Deploying to Vercel

1. Import the repository into Vercel (the project builds with `npm run build`).
2. Add these **Environment Variables** in *Project → Settings → Environment
   Variables* (Production and Preview), then redeploy:

   | Variable | Value |
   | --- | --- |
   | `MONGODB_URI` | Your Atlas connection string (see notes below). |
   | `AUTH_SECRET` | A long random string (e.g. `openssl rand -base64 48`). |
   | `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard. |
   | `CLOUDINARY_API_KEY` | From your Cloudinary dashboard. |
   | `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard. |
   | `NEXT_PUBLIC_SITE_URL` | `https://clickmedia-eta.vercel.app` (or your domain). |

3. After the redeploy, sign in at `/admin/login` and change the admin password
   from **Settings → Change password**.

Notes:

- **MongoDB Atlas:** in the Atlas dashboard open *Database Access → Database
  Users*, edit the user, set a new password (copy it immediately — Atlas never
  shows it again), then build the connection string:
  `mongodb+srv://USER:NEW_PASSWORD@cluster0.e4pmp4y.mongodb.net/hugphotos?retryWrites=true&w=majority`
  (URL-encode any special characters in the password). Always include the
  database name `/hugphotos` — without it MongoDB writes to the default `test`
  database. Under *Network Access*, allow your host (for Vercel the simplest
  option is `0.0.0.0/0`). Verify with `npm run check-db`; a `bad auth` error
  (Atlas code 8000) means the username or password is still wrong.
- **Uploads bypass the serverless body limit.** Vercel caps request bodies at
  **4.5MB**. The dashboard therefore requests a short-lived signature from
  `/api/admin/upload-signature` and uploads the file **directly to Cloudinary**
  from the browser, then sends only the resulting URL/metadata to
  `/api/admin/photos`. The `MAX_UPLOAD_MB` setting is a client-side hint; the
  effective ceiling is your Cloudinary plan's per-file limit (10MB on the free
  plan). With Cloudinary configured, the multipart `POST /api/admin/photos` path
  is still available but is limited by Vercel's 4.5MB request cap.

## Production notes

- Set `AUTH_SECRET` to a long random value and change the default admin password.
- Use Cloudinary (or another object store) rather than local filesystem uploads.
- The app requires a reachable MongoDB instance at build/run time for pages that
  read data; pages degrade gracefully if the database is temporarily unavailable.
