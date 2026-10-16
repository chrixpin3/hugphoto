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

The first administrator is created automatically (from `ADMIN_USERNAME` /
`ADMIN_PASSWORD`, default **`Admin`** / **`admin@123`**) the first time a login
is attempted and no admin account exists yet. The provided `.env.local` bootstraps
**`clickmedia`** / **`clickmedia@12`**.

You can also create it explicitly before starting the server:

```bash
npm run init-admin
```

> The password is hashed with bcrypt (12 rounds) before it is written to MongoDB —
> the plaintext is never stored. Change the password after your first sign-in from
> **Settings → Change password**, and never keep the defaults in production.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `AUTH_SECRET` | Yes in production | 16+ char secret used to sign session cookies. |
| `AUTH_SESSION_MAX_AGE` | No | Session lifetime in seconds (default `604800`, 7 days). |
| `MAX_UPLOAD_MB` | No | Max size per image in MB (default `15`). |
| `ADMIN_USERNAME` | No | Bootstrap admin username (default `Admin`). |
| `ADMIN_PASSWORD` | No | Bootstrap admin password (default `admin@123`). |
| `CLOUDINARY_CLOUD_NAME` | No | Enables Cloudinary storage when set with the two keys below. |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret. |
| `CLOUDINARY_FOLDER` | No | Cloudinary folder prefix (default `hug-photos`). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | WhatsApp number (no `+`) for the floating chat button; falls back to `lib/site.ts`. |
| `NEXT_PUBLIC_SITE_URL` | No | Public base URL used in metadata (default `http://localhost:3000`). |

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

- `/` — home (hero, about, services, featured work, contact)
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
| `npm run init-admin` | Create the initial administrator account. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run the TypeScript compiler without emitting. |

## Production notes

- Set `AUTH_SECRET` to a long random value and change the default admin password.
- Use Cloudinary (or another object store) rather than local filesystem uploads.
- The app requires a reachable MongoDB instance at build/run time for pages that
  read data; pages degrade gracefully if the database is temporarily unavailable.
