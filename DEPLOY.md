# Deploy guide — Dutch Learning App

## Step 1 — Install dependencies locally

```bash
npm install
```

## Step 2 — Create your Supabase project (free)

1. Go to https://supabase.com and sign up / log in
2. Click **New Project** → choose a name (e.g. "dutch-learning") → set a DB password → click Create
3. Wait ~1 minute for it to spin up
4. Go to **SQL Editor** (left sidebar) → paste the entire contents of `supabase/schema.sql` → click **Run**
   - This creates the tables AND inserts 10 sample cards + 3 theory sections

## Step 3 — Get your Supabase credentials

In your Supabase project → **Settings → API**:
- Copy **Project URL** (looks like `https://xxxx.supabase.co`)
- Copy **anon / public** key

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Step 4 — Run locally to verify

```bash
npm run dev
```

Open http://localhost:3000 — you should see the dashboard with cards and theory.

## Step 5 — Deploy to Vercel (free)

### One-time setup

1. Push this repo to GitHub:
   ```bash
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/dutch-learning.git
   git push -u origin master
   ```

2. Go to https://vercel.com → **Add New Project** → import your GitHub repo

3. Vercel auto-detects Next.js — just click **Deploy**

4. After deploy, go to **Settings → Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (same values as your `.env.local`)

5. Go to **Deployments** → click **Redeploy** to pick up the env vars

Your app is now live at `https://dutch-learning-xxxx.vercel.app` 🎉

### Future deploys

```bash
git add .
git commit -m "your message"
git push
```

Vercel redeploys automatically on every push to `master`.

---

## Adding more cards

Option A — Supabase table editor (easiest):
- supabase.com → your project → **Table Editor** → cards → Insert row

Option B — SQL:
```sql
insert into cards (dutch, english, example_nl, example_en, category)
values ('de kat', 'the cat', 'De kat slaapt op de bank.', 'The cat sleeps on the couch.', 'animals');
```

## Adding theory sections

Same as cards — use the Table Editor or SQL. The `slug` must be unique and URL-safe (e.g. `plural-nouns`).

---

## Future ideas

- Add Supabase Auth to support multiple users
- Add a `@tailwindcss/typography` plugin for nicely styled theory prose
- Add `react-markdown` to render markdown in theory sections
- Add a streak tracker (store daily review counts)
