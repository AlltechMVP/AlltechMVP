# Deploy Notes

## Vercel Environments
- **Production**: branch `main`
- **Preview**: any PR/branch

Add the following Environment Variables in Vercel Project Settings → Environment Variables:
- `VITE_SUPABASE_URL` (All: Production, Preview, Development)
- `VITE_SUPABASE_ANON_KEY` (All)

> Never add `SUPABASE_SERVICE_ROLE` to Vercel client envs.

## Build & Cache
- `index.html` is `no-store` to allow fast rollouts.
- Hashed assets under `/assets` are long-cached and immutable.
