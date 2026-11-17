# pretest30 — NTC Evaluation System

Personnel evaluation system for วิทยาลัยเทคนิคน่าน. It is used as a teaching project for students, so **keep code simple and readable** and favor plain Vuetify over clever abstractions. Put Thai comments in the places students are likely to edit.

## Stack & running

- `frontend/`: Nuxt 4 + **Vuetify 4** (vite-plugin-vuetify, autoImport), axios
- `backend/`: Express + mysql2 + bcrypt + JWT, nodemon (`index.js`)
- `database/pretest30.sql`: init script loaded by MySQL on first start of an empty volume
- Run everything with `docker compose -f Docker-compose.yml up -d --build` **from `D:\skill96`**. An older copy of this project at `D:\pretest30-main` uses the same container names; if page edits don't show up, run `docker inspect Frontend_Container` and check the bind-mount source is `D:\skill96rontend`.

| Service | Container | URL |
|---|---|---|
| Frontend | Frontend_Container | http://localhost:3002 (host 3002 → container 3000; host 3000 is used by another project) |
| Backend | Backend_Container | http://localhost:3001/api |
| phpMyAdmin | PMA_Container | http://localhost:8080 |
| MySQL | MYSQL_Container | internal `mysql:3306` only (no host port: the old `3305:3307` mapping was wrong and 3305 is taken by another process). Root password `1234`, database `pretest30` |

- Backend CORS allows `http://localhost:3000` and `http://localhost:3002` (`backend/index.js`).
- The frontend and backend source folders are bind-mounted, so edits hot-reload without a rebuild.
- If a new top-level folder doesn't hot-reload (e.g. `components/`, `middleware/`), run `docker restart Frontend_Container`.
- In Git Bash, `docker exec ... /app/...` paths get mangled; prefix with `MSYS_NO_PATHCONV=1`. When testing the API with curl, send Thai text from a UTF-8 file (`--data-binary @file`), not inline, or login fails with "รหัสผ่านไม่ถูกต้อง".

## Roles & test accounts (all passwords `123456`)

Login needs username + password + the matching role (ประเภทสมาชิก).

| Role | Username | Frontend pages | API prefix |
|---|---|---|---|
| ฝ่ายบุคลากร | `staff1` | `pages/Staff/` | `/api/Staff` |
| ผู้รับการประเมินผล | `testman1` | `pages/Evaluatee/` | `/api/Eva` |
| กรรมการประเมิน | `testcom1` | `pages/Committee/` | `/api/Commit` |

`staff1` was inserted directly into the Docker volume. It is not in `pretest30.sql`, so it disappears if the volume is recreated (it was re-added by hand when the stack moved to `D:\skill96`; copy the bcrypt hash of another `123456` account and set role `ฝ่ายบุคลากร`).

### Forced password change on first login (ผู้รับการประเมินผล only)
- `tb_member.must_change_pw` (1 = must change, 0 = done; default 1). `testman1` starts at 1; `testcom1` and `staff1` are 0 and are never forced.
- `/api/auth/login` returns `must_change_pw`; the frontend then goes to `pages/Evaluatee/change_password.vue` (no layout). `frontend/middleware/force-change-pw.global.ts` redirects other `/Evaluatee/*` pages there while `localStorage.must_change_pw === '1'`.
- Backend: `PUT /api/auth/change-password` (old + new password, min 6, must differ) sets the flag to 0. `requirePasswordChanged` in `middleware/authmiddleware.js` returns 403 on every `/api/Eva/*` call until then.
- Flag is set back to 1 when Staff creates an account or resets a password (`Staff/member.js`); `/api/auth/regis` (self sign-up) and changing the password in `edit_eva` set it to 0.
- After testing the flow, reset `testman1` (password `123456`, `must_change_pw=1`) so the demo works again.

## Frontend conventions (pages that have been redesigned)

The redesigned pages are `pages/index.vue` (login), all of `pages/Staff/`, all of `pages/Evaluatee/`, and all of `pages/Committee/` (blue `color="#007fff"` headers, `bg-blue-lighten-5` topic titles, matching the Committee app-bar colour in `layouts/default.vue`). Only `pages/regis.vue` still uses the old style.

Every redesigned page follows the same pattern:
1. `<PageHeader title subtitle icon color />` from `components/PageHeader.vue`. The default color is `blue-grey` (Staff); Evaluatee pages use `color="#7d0c14"`; Committee pages use `color="#007fff"`.
2. Form card: `v-card rounded="xl" elevation="2"`, fields with `variant="outlined"`, a primary save button with `prepend-icon`, and `variant="tonal"` for cancel.
3. Table card: compact outlined search field, `v-table hover`, `v-chip` for statuses/scores, and icon buttons (`icon="mdi-pencil"` / `icon="mdi-delete"`, `variant="tonal"`).
4. Back buttons: `color="blue-grey" variant="outlined" prepend-icon="mdi-arrow-left"`.
5. Script: declare `const headers = { Authorization: \`Bearer ${token}\` }` once and reuse it. Keep the existing `alert()`/`confirm()` UX.
6. Dates: `new Date(d).toLocaleDateString('th-TH')`. For `type="date"` inputs, use `value.slice(0, 10)` when editing.
7. Use Vuetify utility classes instead of custom CSS. Use `d-print-none` / `d-print-block` for print pages.

### Vuetify 4 gotchas
- Typography uses MD3 names. `text-h1..h6`, `text-subtitle-*` and `text-body-1/2` **don't exist**. Use `text-display-*`, `text-headline-*`, `text-title-*`, `text-body-large|medium|small` and `text-label-*`.
- `v-avatar` crops images (cover). For logos that must show in full, use a `v-sheet rounded="circle"` with a sized `v-img` inside.
- `<center>` is not valid (it causes Vue warnings). Use `class="text-center"`.

### Login page (`pages/index.vue`)
It has no layout and no Google Fonts (use the default font). Logo is `/img/logo2.png`. It has a live clock, a greeting based on the time of day, and "remember username" (localStorage `remember_username`). Animations are Vuetify `v-slide-*-transition appear` plus small CSS keyframes.

## Known issues (not fixed yet)
- `/api/Eva/table` (`backend/routes/Eva/table.js`) uses `select *`, which sends the password hash to the client.
- Registration (`/api/auth/regis`) fails without a profile picture (`pic_user` is NOT NULL).
- The Staff `score_member-[id]` page shows each indicator 3 times (duplicate rows from the backend query).
- `tb_system` data has `round_sys` and `year_sys` swapped.
- In `pages/Staff/indicate.vue`, the มี/ไม่มี field is labeled "ประเภทสมาชิก" (copied from another form; its real meaning is unclear).
- Login uses `alert()`. Browser automation must avoid triggering it: log in via `fetch('/api/auth/login')` and set `localStorage.token` instead.
