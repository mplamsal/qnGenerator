# ExamForge — MVP

ExamForge is a small MVP to create, preview and print school question papers.

Quick start:

1. Install dependencies: `npm install`
2. Create a Supabase project and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in a `.env` file.
3. Run dev server: `npm run dev`

Now the project uses Vercel-style serverless functions (folder `api/`) for auth and persistence. To run locally:

1. Ensure `DATABASE_URL` in your environment points to a Postgres instance (e.g. the local Docker container).
2. Install dependencies and generate Prisma client:

```bash
npm install
npx prisma generate
```

3. Run Vite frontend:

```bash
npm run dev
```

4. Run Vercel dev to serve serverless functions locally (optional):

```bash
npm i -g vercel
vercel dev
```

Frontend will call serverless endpoints under `/api` by default. Configure `VITE_API_BASE` to change this base path.

Included:
- React + Vite + TypeScript
- TailwindCSS
- Supabase integration
- Basic routing and pages
- PDF preview (client-side) using `@react-pdf/renderer`

See `db/schema.sql` and `db/seed.sql` for the database schema and seed data to run in Supabase.
