# Polyworld Studio — Creator UI

A minimal React app that lets anyone create a Polyworld Studio with one click.

Type a name, hit **Create**, watch the AI team spin up, then join the Telegram group.

---

## What it does

1. Sends `POST /projects` to Orchestra with the studio name
2. Polls `GET /projects/{id}` every 3 seconds
3. Shows each bot going green as it provisions (Writer, Researcher, etc.)
4. Displays the Telegram invite link the moment the studio is ready

The whole flow takes about 10–30 seconds.

---

## Local setup

```bash
git clone https://github.com/kangaroocast/creators-web
cd creators-web
npm install
cp .env.example .env.local
```

Edit `.env.local` and set your admin key:
```
VITE_ADMIN_KEY=your_orchestra_admin_key
```

Then:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Configuration

| Variable | Description |
|---|---|
| `VITE_ADMIN_KEY` | Orchestra `X-Admin-Key`. Lives in `.env.local` (gitignored). |

The Orchestra API URL (`https://orchestra-zpdkdua3hq-uc.a.run.app`) is hardcoded in `src/App.tsx`. Change it there if you point at a different environment.

---

## Stack

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev) for dev server and builds
- Zero CSS frameworks — inline styles only
- Zero routing — single page

---

## Project structure

```
src/
  App.tsx        — the whole app (one component)
  main.tsx       — React root mount
  vite-env.d.ts  — Vite type shims
```
