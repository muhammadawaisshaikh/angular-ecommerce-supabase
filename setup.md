# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/angular-ecommerce-supabase.git
cd angular-ecommerce-supabase
npm install
```

### 2. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Wait for setup to complete

### 3. Get Credentials
- Go to **Settings** → **API** in your Supabase dashboard
- Copy **Project URL** and **Anon Key**

### 4. Update Environment Files
Update these files with your Supabase credentials:

**`src/environments/environment.ts`** (Development)
```typescript
supabase: {
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
}
```

**`src/environments/environment.prod.ts`** (Production)
```typescript
supabase: {
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
}
```

### 5. Setup Database
- Go to **SQL Editor** in Supabase
- Copy content from `database-setup-guest-orders.sql` (recommended)
- Run the SQL commands

### 6. Start Development
```bash
npm start
```

Visit `http://localhost:4200` in your browser!

---

**Need help?** Check the full [README.md](README.md) for detailed instructions. 