# Pet Global ID Landing Page

Premium landing page for **Pet Global ID** (WoofTroop) — pet supplies retailer in Indonesia. Bahasa Indonesia UI + AI chatbot ("Poppy") powered by DeepSeek.

## Local development

```bash
npm install
npm start
```

Visit http://localhost:3000

## Environment variables

Copy `.env.example` to `.env` and set:

- `DEEPSEEK_API_KEY` — your DeepSeek API key
- `DEEPSEEK_MODEL` — default `deepseek-chat`
- `DEEPSEEK_BASE_URL` — default `https://api.deepseek.com/v1`
- `PORT` — default `3000` (Railway sets this automatically)

## Deploy to Railway (via GitHub)

1. **Create GitHub repo** and push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial landing page"
   git branch -M main
   git remote add origin https://github.com/YOUR_USER/petglobalid-landing.git
   git push -u origin main
   ```

2. **Railway setup:**
   - Go to https://railway.app → New Project → Deploy from GitHub repo
   - Select this repository
   - Railway auto-detects Node.js via Nixpacks and runs `npm start`

3. **Set env vars in Railway:**
   - Go to your project → Variables tab → Add:
     - `DEEPSEEK_API_KEY` = your key
     - `DEEPSEEK_MODEL` = `deepseek-chat`
     - `DEEPSEEK_BASE_URL` = `https://api.deepseek.com/v1`

4. **Generate public URL:**
   - Settings → Networking → Generate Domain
   - You'll get something like `petglobalid-production.up.railway.app`

## Features

- Hero with pet imagery + dual CTA
- Brand marquee (60+ brands)
- Category showcase (4 main + 7 secondary)
- Interactive "Find the Right Food" quiz (3 steps → recommendations)
- Featured products grid
- Why Us pillars (4)
- Testimonials
- AI Chatbot ("Poppy") — DeepSeek-powered, in Bahasa Indonesia
- Newsletter + WhatsApp CTA
- Full footer with payment/shipping partners
- Floating chat button + modal + embedded chat preview

## Architecture

- `server.js` — Express server, serves `/public`, proxies `/api/chat` to DeepSeek
- `public/index.html` — single-page landing with Tailwind CDN + Alpine.js
- API key stays server-side (never touches the browser)
