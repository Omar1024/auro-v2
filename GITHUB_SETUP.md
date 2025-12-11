# 🚀 GitHub Repository Setup Guide

## Step 1: Configure Git (One-time setup)

Run these commands in your terminal (replace with your actual info):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Or** set it only for this repository:

```bash
cd F:\Dev\Projects\Auro\Aurov2\Aurov2
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Fill in:
   - **Repository name**: `auro-v2` (or your preferred name)
   - **Description**: "Anonymous Q&A platform built with Next.js and Supabase"
   - **Visibility**: Choose **Private** or **Public**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 3: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd F:\Dev\Projects\Auro\Aurov2\Aurov2

# Make initial commit (if you haven't already)
git add .
git commit -m "Initial commit: Auro v2 - Anonymous Q&A platform"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Step 4: Verify Connection

```bash
# Check remote URL
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/REPO_NAME.git (fetch)
# origin  https://github.com/YOUR_USERNAME/REPO_NAME.git (push)
```

## 🔐 Important: Environment Variables

**Before pushing**, make sure your `.env` file is in `.gitignore` (it already is ✅).

If you need to share environment variables with your team:
1. Create a `.env.example` file with placeholder values
2. **Never commit** actual `.env` files with real API keys

Example `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 📝 Future Commits

After setup, use these commands for future updates:

```bash
# Stage changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub
git push
```

## 🔄 Branching Strategy (Optional)

For production deployments, consider:

```bash
# Create a production branch
git checkout -b production

# Push production branch
git push -u origin production
```

## ✅ Checklist

- [ ] Git user name and email configured
- [ ] GitHub repository created
- [ ] Remote origin added
- [ ] Initial commit made
- [ ] Code pushed to GitHub
- [ ] `.env` file is NOT committed (check with `git status`)

---

**Need help?** Check [GitHub Docs](https://docs.github.com/en/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-locally-hosted-code-to-github)

