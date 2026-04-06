# Henry Everywhere - MVP

Your personal AI agent platform.

## Quick Start

### 1. Get Keys

**Clerk Auth:**
1. Go to https://clerk.com
2. Create app
3. Copy Publishable Key and Secret Key

**OpenAI (optional):**
1. Go to https://platform.openai.com
2. Create API key

### 2. Set Environment

Edit `.env.local` with your keys:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "MVP"
git remote add origin https://github.com/YOUR_USERNAME/henry-everywhere.git
git push -u origin main

# Deploy to Vercel
# 1. Go to https://vercel.com
# 2. Import GitHub repo
# 3. Add env variables in Vercel dashboard
# 4. Deploy!
```

## Features

✅ User authentication (Clerk)  
✅ Custom agent name & instructions  
✅ Chat interface with history  
✅ OpenAI integration (bring your own key)  
✅ Clean UI with Tailwind  

## Pricing (to add later)

- Personal: £24.95/mo
- Connect Stripe for payments

---

Built by Henry Everywhere 🦊
