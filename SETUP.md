# Database Setup - Supabase

## Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Copy URL and Anon Key

## Step 2: Create Table
Run this SQL in Supabase SQL Editor:

```sql
-- Create users_settings table
CREATE TABLE IF NOT EXISTS public.users_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  agent_name TEXT DEFAULT 'My Assistant',
  agent_instructions TEXT DEFAULT 'You are a helpful assistant.',
  api_key_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own data)
CREATE POLICY "Users can manage own settings" ON public.users_settings
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own chat" ON public.chat_history
  FOR ALL USING (auth.uid()::text = user_id);
```

## Step 3: Add Environment Variables
Add to Vercel:
- NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
