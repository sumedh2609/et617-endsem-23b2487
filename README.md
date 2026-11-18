# प्रक्षेपण प्रयोगशाळा / Projectile Inquiry Lab

**Identity Token: 23B2487 | Card: P5-T10-L5-C2**. See [DESIGN.md](DESIGN.md) for D1–D3.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Optional AI coach

Copy `.env.example` to `.env` and set `VITE_GEMINI_API_KEY` or `VITE_OPENAI_API_KEY`. Without a key, or if the API call fails, the coach uses its built-in offline analyzer, so the app works fully offline and on Vercel.

## Deploy (Vercel)

Framework preset **Vite**, build command `npm run build`, output directory `dist`.
