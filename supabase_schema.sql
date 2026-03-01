-- SQL Schema for Bulk Messenger Pro

-- 1. Profiles (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'sub-admin', 'user')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  credits INTEGER DEFAULT 100,
  api_key TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Contacts
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  batch TEXT,
  class TEXT,
  course TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, whatsapp_number)
);

-- 3. Campaigns
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  message_template TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
  total_messages INTEGER DEFAULT 0,
  sent_messages INTEGER DEFAULT 0,
  failed_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Message Logs
CREATE TABLE message_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts ON DELETE SET NULL,
  whatsapp_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  whatsapp_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. API Usage Tracking
CREATE TABLE api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their message logs" ON message_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their api usage" ON api_usage FOR SELECT USING (auth.uid() = user_id);
