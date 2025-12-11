# ⚡ Quick Start Guide

## 🎯 Two Files You Need

### 1. **Database Setup** → `supabase/COMPLETE_SETUP.sql`
Run this ONCE in Supabase SQL Editor. It sets up everything.

### 2. **Deployment Guide** → `DEPLOYMENT_CHECKLIST.md`  
Follow this step-by-step for production deployment.

---

## 🚀 Deploy in 3 Steps

### Step 1: Database (5 min)
```sql
-- Copy entire file: supabase/COMPLETE_SETUP.sql
-- Paste in Supabase SQL Editor
-- Click RUN
-- Done! ✅
```

### Step 2: Set Admin (1 min)
```sql
-- In Supabase SQL Editor:
UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL';
```

### Step 3: Deploy (10 min)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

---

## 📋 Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## ✅ Test Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📚 Full Documentation

- **Deployment**: `DEPLOYMENT_CHECKLIST.md`
- **Cleanup Details**: `CLEANUP_SUMMARY.md`

---

**That's it!** 🎉

Your Auro platform is ready to deploy.


