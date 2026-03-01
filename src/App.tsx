import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Plus,
  FileUp,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Smartphone,
  ChevronRight,
  UserPlus,
  Edit2,
  Trash2,
  Check,
  Shield,
  ShieldCheck,
  Zap,
  Database,
  Calendar,
  BarChart3,
  Mail,
  MessageSquare,
  Lock,
  ArrowRight,
  Star,
  Globe,
  Award,
  Heart,
  MousePointer2,
  Lightbulb as LampIcon,
  Moon,
  Sun,
  Paperclip,
  SendHorizontal
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { cn } from './lib/utils';
import { enhanceMessage } from './services/aiService';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

// --- Types ---
type View = 'landing' | 'dashboard' | 'contacts' | 'messaging' | 'history' | 'plans' | 'settings' | 'admin' | 'login' | 'pricing' | 'contact';

// --- Constants ---
const THEME = {
  primary: '#5D3FD3', // Deep Royal Purple
  secondary: '#9966CC', // Amethyst
  accent: '#4B0082', // Dark Violet
  light: '#E6E6FA', // Soft Lavender
  dark: '#050505', // Deep Night
};

// --- Components ---

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'A') {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <motion.div 
        className="custom-cursor"
        animate={{ 
          x: position.x - 8, 
          y: position.y - 8,
          scale: isHovering ? 1.5 : 1
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 250, mass: 0.5 }}
      />
      <motion.div 
        className="custom-cursor-follower"
        animate={{ 
          x: position.x - 16, 
          y: position.y - 16,
          scale: isHovering ? 2 : 1
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.8 }}
      />
    </>
  );
};

const Particles = () => {
  const particles = useMemo(() => Array.from({ length: 20 }), []);
  return (
    <div className="particles-container">
      {particles.map((_, i) => (
        <div 
          key={i} 
          className="particle" 
          style={{ 
            left: `${Math.random() * 100}%`,
            '--duration': `${10 + Math.random() * 20}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            animationDelay: `${Math.random() * 10}s`
          } as any} 
        />
      ))}
    </div>
  );
};

const BearCharacter = ({ animation = 'wave' }: { animation?: 'wave' | 'walk' | 'sleep' | 'point' }) => {
  return (
    <motion.div 
      className="relative w-32 h-32"
      animate={animation === 'sleep' ? { y: [0, 5, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity }}
    >
      {/* Simple Bear SVG */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        {/* Ears */}
        <circle cx="30" cy="30" r="12" fill="#8B4513" />
        <circle cx="70" cy="30" r="12" fill="#8B4513" />
        <circle cx="30" cy="30" r="6" fill="#A0522D" />
        <circle cx="70" cy="30" r="6" fill="#A0522D" />
        {/* Body */}
        <ellipse cx="50" cy="70" rx="35" ry="25" fill="#8B4513" />
        {/* Head */}
        <circle cx="50" cy="45" r="30" fill="#8B4513" />
        {/* Muzzle */}
        <circle cx="50" cy="55" r="12" fill="#DEB887" />
        <circle cx="50" cy="50" r="3" fill="#000" />
        {/* Eyes */}
        {animation === 'sleep' ? (
          <>
            <path d="M35 40 Q40 35 45 40" stroke="#000" strokeWidth="2" fill="none" />
            <path d="M55 40 Q60 35 65 40" stroke="#000" strokeWidth="2" fill="none" />
          </>
        ) : (
          <>
            <circle cx="40" cy="40" r="3" fill="#000" />
            <circle cx="60" cy="40" r="3" fill="#000" />
          </>
        )}
        {/* Arms */}
        <motion.path 
          d="M20 65 Q10 75 20 85" 
          stroke="#8B4513" 
          strokeWidth="10" 
          strokeLinecap="round" 
          animate={animation === 'wave' ? { rotate: [0, -20, 0] } : {}}
          style={{ originX: '20px', originY: '65px' }}
        />
        <path d="M80 65 Q90 75 80 85" stroke="#8B4513" strokeWidth="10" strokeLinecap="round" />
      </svg>
      {animation === 'sleep' && (
        <motion.div 
          className="absolute -top-4 right-0 text-amethyst font-bold text-xl"
          animate={{ y: [-10, -30], opacity: [0, 1, 0], scale: [0.5, 1.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Zzz
        </motion.div>
      )}
    </motion.div>
  );
};

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);
  const [isLightOn, setIsLightOn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLampClick = () => {
    setIsLightOn(true);
    setTimeout(onComplete, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-deep-night flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="relative"
          >
            <div className="w-32 h-32 bg-royal-purple rounded-3xl flex items-center justify-center relative overflow-hidden group">
              <Send size={64} className="text-white relative z-10" />
              <motion.div 
                className="absolute inset-0 border-4 border-amethyst rounded-3xl"
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <motion.h1 
              className="text-4xl font-bold mt-8 glow-text tracking-tighter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              BulkMsg Pro
            </motion.h1>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="bear"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full flex flex-col items-center justify-center"
          >
            <motion.div 
              className="absolute top-1/4 left-1/2 -translate-x-1/2"
              animate={isLightOn ? { scale: [1, 1.2, 10], opacity: [1, 1, 0] } : {}}
              transition={{ duration: 1.5 }}
            >
              <motion.div 
                className={cn(
                  "p-8 rounded-full transition-all duration-500 cursor-pointer relative z-20",
                  isLightOn ? "bg-white shadow-[0_0_100px_#fff]" : "bg-slate-900 border border-slate-800 hover:border-amethyst"
                )}
                onClick={handleLampClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <LampIcon size={48} className={isLightOn ? "text-royal-purple" : "text-slate-600"} />
                {!isLightOn && (
                  <motion.div 
                    className="absolute -inset-4 border-2 border-amethyst/30 rounded-full"
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </motion.div>

            <motion.div 
              className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
              initial={{ x: '100vw' }}
              animate={{ x: '-50%' }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <BearCharacter animation="point" />
              <motion.p 
                className="text-xl font-medium text-soft-lavender/60 italic"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👉 "Click the lamp to power the platform"
              </motion.p>
            </motion.div>

            {isLightOn && (
              <motion.div 
                className="absolute inset-0 bg-white z-[101]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
      className="glass-panel p-8 group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-royal-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-16 h-16 bg-royal-purple/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-royal-purple group-hover:text-white transition-all duration-500">
        <Icon size={32} className="text-amethyst group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amethyst transition-colors">{title}</h3>
      <p className="text-soft-lavender/60 leading-relaxed">{description}</p>
      
      <motion.div 
        className="absolute bottom-0 left-0 h-1 bg-royal-purple"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
      />
    </motion.div>
  );
};

const PricingCard = ({ plan, isPremium = false, onSelect }: { plan: any, isPremium?: boolean, onSelect: (plan: any) => void, key?: any }) => {
  const handleSelect = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [THEME.primary, THEME.secondary, THEME.light]
    });
    onSelect(plan);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "glass-panel p-10 flex flex-col relative overflow-hidden",
        isPremium ? "border-amethyst/50 shadow-[0_0_50px_rgba(153,102,204,0.2)]" : ""
      )}
    >
      {isPremium && (
        <div className="absolute top-6 right-6 bg-amethyst text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold text-soft-lavender/60 mb-2 uppercase tracking-widest">{plan.name}</h3>
      <div className="flex items-baseline gap-2 mb-8">
        <span className="text-5xl font-black text-white">₹{plan.price}</span>
        <span className="text-soft-lavender/40">/month</span>
      </div>
      
      <div className="space-y-4 mb-10 flex-1">
        {plan.features.map((feature: string, i: number) => (
          <div key={i} className="flex items-center gap-3 text-sm text-soft-lavender/80">
            <CheckCircle2 size={18} className="text-amethyst shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSelect}
        className={cn(
          "w-full py-4 rounded-2xl font-bold transition-all duration-500",
          isPremium 
            ? "bg-gradient-to-r from-royal-purple to-dark-violet text-white shadow-lg shadow-royal-purple/20 hover:shadow-royal-purple/40" 
            : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
        )}
      >
        Select Plan
      </button>
    </motion.div>
  );
};

const DashboardStat = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: any, color: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="glass-panel p-6 flex items-center gap-6"
  >
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-xs font-bold text-soft-lavender/40 uppercase tracking-widest mb-1">{label}</p>
      <motion.p 
        className="text-2xl font-black text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {value}
      </motion.p>
    </div>
  </motion.div>
);

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [logoClicks, setLogoClicks] = useState(0);
  const isAdmin = user?.email === 'prajwalnawale3040@gmail.com';

  const handlePayment = async (plan: any) => {
    if (plan.amount === 0) {
      alert("You are already on the free plan!");
      return;
    }

    try {
      const response = await axios.post('/api/payment/create-order', {
        amount: plan.amount,
        planName: plan.name,
        userId: user.id
      });

      const { id: orderId, currency, amount, key } = response.data;

      const options = {
        key,
        amount,
        currency,
        name: "BulkMsg Pro",
        description: `Upgrade to ${plan.name} Plan`,
        order_id: orderId,
        handler: function (response: any) {
          alert("Payment Successful! Your subscription will be activated shortly.");
          // The webhook will handle the activation, but we can refresh profile here too
          setTimeout(() => window.location.reload(), 2000);
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: THEME.primary,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment Error:", error);
      alert("Failed to initiate payment: " + (error.response?.data?.error || error.message));
    }
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setProfile(null);
        setView('landing');
      } else {
        setView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setProfile(data);
          } else if (!error || error.code === 'PGRST116') { // PGRST116 is "no rows returned"
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: user.id, 
                email: user.email, 
                plan: 'free', 
                credits: 100,
                created_at: new Date().toISOString()
              }])
              .select()
              .single();
            
            if (newProfile) setProfile(newProfile);
            if (insertError) console.error("Profile creation error:", insertError);
          } else {
            if (error.code === '42P01') {
              alert("Database table 'profiles' is missing. Please run the SQL setup commands in your Supabase SQL Editor.");
            }
            console.error("Profile fetch error:", error);
          }
        } catch (err) {
          console.error("Unexpected error in fetchProfile:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-deep-night flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">Configuration Required</h1>
          <p className="text-soft-lavender/40 mb-8">
            Please set your Supabase environment variables in the Secrets panel to continue.
          </p>
          <div className="space-y-2 text-left bg-black/50 p-4 rounded-xl border border-white/5 mb-8">
            <code className="text-xs text-amethyst block">VITE_SUPABASE_URL</code>
            <code className="text-xs text-amethyst block">VITE_SUPABASE_ANON_KEY</code>
          </div>
          <button 
            onClick={() => {
              const sql = `
-- 0. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 100,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan_id TEXT,
  amount NUMERIC,
  currency TEXT,
  payment_status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT,
  whatsapp_number TEXT,
  batch TEXT,
  course TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  total_messages INTEGER DEFAULT 0,
  sent_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (auth.jwt() ->> 'email' = 'prajwalnawale3040@gmail.com');
              `;
              console.log(sql);
              alert("SQL Setup commands have been logged to the console. Please run them in your Supabase SQL Editor.");
            }}
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-soft-lavender/60 hover:text-white hover:bg-white/10 transition-all"
          >
            Get SQL Setup Commands
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-night flex items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-4 border-royal-purple/20 border-t-royal-purple rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!isIntroComplete && view === 'landing') {
    return <IntroAnimation onComplete={() => setIsIntroComplete(true)} />;
  }

  return (
    <div className="min-h-screen bg-deep-night text-soft-lavender font-sans selection:bg-royal-purple/30">
      <CustomCursor />
      <Particles />
      
      {/* Scroll Progress */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-purple to-amethyst z-[100] origin-left"
        style={{ scaleX }}
      />

      {view === 'landing' ? (
        <LandingPage setView={setView} onSelect={handlePayment} />
      ) : view === 'login' ? (
        <LoginPage setView={setView} />
      ) : (
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className={cn(
            "fixed left-0 top-0 h-full bg-deep-night/80 backdrop-blur-xl border-r border-white/5 transition-all duration-500 z-50",
            isSidebarOpen ? "w-72" : "w-24"
          )}>
            <div className="p-8 flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-royal-purple rounded-2xl flex items-center justify-center shadow-lg shadow-royal-purple/20">
                <Send size={24} className="text-white" />
              </div>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-black glow-text tracking-tighter"
                >
                  BulkMsg
                </motion.span>
              )}
            </div>

            <nav className="px-6 space-y-3">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} isOpen={isSidebarOpen} />
              <SidebarItem icon={Users} label="Contacts" active={view === 'contacts'} onClick={() => setView('contacts')} isOpen={isSidebarOpen} />
              <SidebarItem icon={SendHorizontal} label="Messaging" active={view === 'messaging'} onClick={() => setView('messaging')} isOpen={isSidebarOpen} />
              <SidebarItem icon={History} label="History" active={view === 'history'} onClick={() => setView('history')} isOpen={isSidebarOpen} />
              <SidebarItem icon={CreditCard} label="Plans" active={view === 'plans'} onClick={() => setView('plans')} isOpen={isSidebarOpen} />
              <SidebarItem icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} isOpen={isSidebarOpen} />
              {isAdmin && <SidebarItem icon={Shield} label="Admin" active={view === 'admin'} onClick={() => setView('admin')} isOpen={isSidebarOpen} />}
            </nav>

            <div className="absolute bottom-8 left-0 w-full px-6">
              <button 
                onClick={() => supabase.auth.signOut()}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-soft-lavender/40 hover:bg-red-500/10 hover:text-red-400 transition-all group"
              >
                <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                {isSidebarOpen && <span className="font-bold">Sign Out</span>}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className={cn(
            "flex-1 transition-all duration-500",
            isSidebarOpen ? "ml-72" : "ml-24"
          )}>
            <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-deep-night/50 backdrop-blur-xl sticky top-0 z-40">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-3 hover:bg-white/5 rounded-2xl text-soft-lavender/40 transition-colors"
                >
                  {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h2 className="text-2xl font-black text-white capitalize tracking-tight">{view}</h2>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-white">{user?.email}</span>
                  <span className="text-[10px] text-amethyst font-black uppercase tracking-widest">
                    {profile?.plan || 'Free'} Plan • {profile?.credits?.toLocaleString() || '0'} Credits
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-royal-purple/20 border border-royal-purple/30 flex items-center justify-center shadow-inner">
                  <span className="text-lg font-black text-amethyst">{user?.email?.[0].toUpperCase()}</span>
                </div>
              </div>
            </header>

            <div className="p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.02, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {view === 'dashboard' && <DashboardView />}
                  {view === 'contacts' && <ContactsView />}
                  {view === 'messaging' && <MessagingView profile={profile} />}
                  {view === 'history' && <HistoryView />}
                  {view === 'plans' && <PricingPage setView={setView} isDashboard onSelect={handlePayment} />}
                  {view === 'settings' && <SettingsView profile={profile} />}
                  {view === 'admin' && <AdminView user={user} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

const SidebarItem = ({ icon: Icon, label, active, onClick, isOpen }: { icon: any, label: string, active: boolean, onClick: () => void, isOpen: boolean }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-500 group relative",
      active 
        ? "bg-royal-purple text-white shadow-lg shadow-royal-purple/20" 
        : "text-soft-lavender/40 hover:bg-white/5 hover:text-white"
    )}
  >
    <Icon size={22} className={cn(
      "transition-transform duration-500",
      active ? "scale-110" : "group-hover:scale-110 group-hover:rotate-6"
    )} />
    {isOpen && <span className="font-bold tracking-tight">{label}</span>}
    {active && (
      <motion.div 
        layoutId="sidebar-active"
        className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
      />
    )}
  </button>
);

// --- Page Components ---

const LandingPage = ({ setView, onSelect }: { setView: (v: View) => void, onSelect: (plan: any) => void }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className={cn("relative transition-colors duration-1000", isDarkMode ? "bg-deep-night" : "bg-[#1a0b2e]")}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-24 px-10 flex items-center justify-between z-[60] bg-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-royal-purple rounded-xl flex items-center justify-center shadow-lg shadow-royal-purple/20">
            <Send size={20} className="text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">BulkMsg</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {['Features', 'Pricing', 'Testimonials', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-soft-lavender/60 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-soft-lavender/60 hover:text-white transition-all"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setView('login')}
            className="px-6 py-3 bg-royal-purple text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(93,63,211,0.4)] transition-all"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-royal-purple/20 blur-[120px] rounded-full animate-pulse" />
        
        <div className="relative z-10 text-center max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-royal-purple/10 border border-royal-purple/20 rounded-full text-amethyst text-xs font-black uppercase tracking-widest mb-8"
          >
            <Sparkles size={14} />
            <span>The Future of Bulk Messaging</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
            {"Scale Your Messaging. Automate Everything.".split(" ").map((word, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="inline-block mr-4"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xl text-soft-lavender/60 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Experience the most magical WhatsApp marketing platform. 
            Beautifully designed, powerfully automated, and incredibly smooth.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={() => setView('login')}
              className="btn-premium group"
            >
              Get Started Free
              <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button className="px-8 py-4 rounded-2xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Floating Bubbles */}
        <div className="absolute inset-0 pointer-events-none">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="absolute glass-panel p-4 flex items-center gap-3"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                opacity: 0,
                scale: 0.5
              }}
              animate={{ 
                y: [null, '-=50', '+=50'],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity,
                delay: i * 2
              }}
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <MessageSquare size={16} className="text-white" />
              </div>
              <div className="w-24 h-2 bg-white/10 rounded-full" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Magical Features</h2>
            <p className="text-soft-lavender/60 max-w-2xl mx-auto">Everything you need to dominate WhatsApp marketing, wrapped in a premium experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              index={0}
              icon={Send} 
              title="Bulk Messaging" 
              description="Send thousands of messages with a single click. High delivery rates, zero friction." 
            />
            <FeatureCard 
              index={1}
              icon={Calendar} 
              title="Campaign Scheduler" 
              description="Plan your campaigns weeks in advance. Set it, forget it, watch the results." 
            />
            <FeatureCard 
              index={2}
              icon={Filter} 
              title="Smart Filtering" 
              description="Advanced contact segmentation. Target the right people at the right time." 
            />
            <FeatureCard 
              index={3}
              icon={BarChart3} 
              title="Real-time Analytics" 
              description="Beautiful charts and deep insights into your campaign performance." 
            />
            <FeatureCard 
              index={4}
              icon={Zap} 
              title="API Integration" 
              description="Connect your existing tools with our powerful, developer-friendly API." 
            />
            <FeatureCard 
              index={5}
              icon={ShieldCheck} 
              title="Secure & Private" 
              description="Enterprise-grade security for your data and your customers' privacy." 
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing">
        <PricingPage setView={setView} onSelect={onSelect} />
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Loved by Marketers</h2>
            <p className="text-soft-lavender/60">Join thousands of businesses scaling their growth with BulkMsg Pro.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {[
              { name: "Alex Rivera", role: "Growth Lead @ TechFlow", text: "The smoothest messaging platform I've ever used. The automation is pure magic.", avatar: "AR" },
              { name: "Sarah Chen", role: "Founder @ Bloom", text: "Our conversion rates doubled in the first month. The analytics are incredibly deep.", avatar: "SC" },
              { name: "Marcus Thorne", role: "Marketing Director", text: "Enterprise-grade power with a consumer-grade experience. Simply brilliant.", avatar: "MT" }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 max-w-sm flex flex-col gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amethyst/20 rounded-full flex items-center justify-center text-amethyst font-black">{t.avatar}</div>
                  <div>
                    <h4 className="text-white font-bold">{t.name}</h4>
                    <p className="text-xs text-soft-lavender/40">{t.role}</p>
                  </div>
                </div>
                <p className="text-soft-lavender/80 italic leading-relaxed">"{t.text}"</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className="text-amethyst fill-amethyst" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact">
        <ContactPage />
      </section>

      {/* AI Assistant Bubble */}
      <div className="fixed bottom-10 right-10 z-[70]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="glass-panel w-80 h-[450px] mb-6 flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="bg-royal-purple p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <span className="text-white font-bold">AI Assistant</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/60 hover:text-white"><X size={20} /></button>
              </div>
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none text-sm text-soft-lavender/80">
                  Hello! I'm your BulkMsg AI assistant. How can I help you today?
                </div>
                <div className="bg-royal-purple/20 p-4 rounded-2xl rounded-tr-none text-sm text-white ml-8">
                  What are the pricing plans?
                </div>
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none text-sm text-soft-lavender/80">
                  We have three plans: Starter (Free), Professional (₹1,499), and Enterprise (₹4,999). Would you like to see the details?
                </div>
              </div>
              <div className="p-4 border-t border-white/5 flex gap-2">
                <input type="text" placeholder="Type a message..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-amethyst" />
                <button className="p-2 bg-royal-purple text-white rounded-xl"><SendHorizontal size={18} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-royal-purple rounded-full flex items-center justify-center text-white shadow-2xl shadow-royal-purple/40 relative"
        >
          {isChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
          {!isChatOpen && (
            <motion.div 
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-deep-night"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>
      </div>

      {/* Footer */}
      <footer className="py-20 px-10 border-t border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-royal-purple rounded-xl flex items-center justify-center">
                <Send size={20} className="text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">BulkMsg</span>
            </div>
            <p className="text-soft-lavender/40 text-sm leading-relaxed">
              The world's most magical WhatsApp bulk messaging platform.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-soft-lavender/40 text-sm">
              <li className="hover:text-amethyst cursor-pointer transition-colors">Features</li>
              <li className="hover:text-amethyst cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-amethyst cursor-pointer transition-colors">API</li>
              <li className="hover:text-amethyst cursor-pointer transition-colors">Security</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-soft-lavender/40 text-sm">
              <li className="hover:text-amethyst cursor-pointer transition-colors">About</li>
              <li className="hover:text-amethyst cursor-pointer transition-colors">Blog</li>
              <li className="hover:text-amethyst cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-amethyst cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-soft-lavender/40 text-sm">
              <li className="hover:text-amethyst cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-amethyst cursor-pointer transition-colors">Terms</li>
              <li className="hover:text-amethyst cursor-pointer transition-colors">Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center text-soft-lavender/20 text-xs">
          © 2026 BulkMsg Pro. All rights reserved. Made with 💜 for marketers.
        </div>
      </footer>
    </div>
  );
};

const LoginPage = ({ setView }: { setView: (v: View) => void }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks === 5) {
      const sql = `
-- 0. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 100,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan_id TEXT,
  amount NUMERIC,
  currency TEXT,
  payment_status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT,
  whatsapp_number TEXT,
  batch TEXT,
  course TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  total_messages INTEGER DEFAULT 0,
  sent_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (auth.jwt() ->> 'email' = 'prajwalnawale3040@gmail.com');
      `;
      console.log(sql);
      alert("SQL Setup commands have been logged to the console. Please run them in your Supabase SQL Editor.");
      setLogoClicks(0);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setView('dashboard');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-violet/20 to-deep-night" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-royal-purple/10 blur-[100px] rounded-full" />
      
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="hidden lg:flex flex-col items-center justify-center gap-12">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            onClick={handleLogoClick}
            className="cursor-pointer"
          >
            <BearCharacter animation={isFocused ? 'point' : 'sleep'} />
          </motion.div>
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
              {isSignUp ? 'Join the Pack' : 'Welcome Back'}
            </h2>
            <p className="text-soft-lavender/40">
              {isSignUp ? 'Start your journey with BulkMsg Pro today.' : 'The bear is waiting for you to light up the screen.'}
            </p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-12 relative overflow-hidden"
        >
          <div className={cn(
            "absolute inset-0 bg-royal-purple/5 transition-opacity duration-1000",
            isFocused ? "opacity-100" : "opacity-0"
          )} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-royal-purple rounded-xl flex items-center justify-center">
                <Lock size={20} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {isSignUp ? 'Create Account' : 'Secure Access'}
              </h3>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-lavender/20" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amethyst transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-lavender/20" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-amethyst transition-all"
                    placeholder="••••••••"
                  />
                  {password && (
                    <motion.div 
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Sparkles className="text-amethyst" size={18} />
                    </motion.div>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="btn-premium w-full flex items-center justify-center gap-3"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5 flex flex-col gap-4 text-center">
              <p className="text-sm text-soft-lavender/40">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-amethyst font-bold cursor-pointer hover:underline ml-1"
                >
                  {isSignUp ? 'Sign In' : 'Create one now'}
                </button>
              </p>
              <button 
                onClick={() => setView('landing')}
                className="text-xs text-soft-lavender/20 hover:text-soft-lavender/40 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const PricingPage = ({ setView, isDashboard = false, onSelect }: { setView: (v: View) => void, isDashboard?: boolean, onSelect: (plan: any) => void }) => {
  const plans = [
    { name: 'Starter', price: '0', amount: 0, features: ['100 Messages/day', 'Basic Analytics', 'Standard Support', 'Manual Import'] },
    { name: 'Professional', price: '1,499', amount: 1499, features: ['5,000 Messages/day', 'Advanced Analytics', 'Priority Support', 'API Access'] },
    { name: 'Enterprise', price: '4,999', amount: 4999, features: ['Unlimited Messages', 'Custom Integration', 'Dedicated Manager', 'White Label'] }
  ];

  return (
    <section className={cn("py-32 px-10 relative", isDashboard ? "py-0 px-0" : "")}>
      <div className="max-w-7xl mx-auto">
        {!isDashboard && (
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Premium Plans</h2>
            <p className="text-soft-lavender/60 max-w-2xl mx-auto">Choose the perfect plan for your business growth.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} isPremium={i === 1} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
    }, 3000);
  };

  return (
    <section className="py-32 px-10 relative flex flex-col items-center justify-center">
      <div className="text-center mb-20">
        <h2 className="text-5xl font-black text-white mb-6 tracking-tight">Get in Touch</h2>
        <p className="text-soft-lavender/60">Have a question? Send us a magical message.</p>
      </div>

      <div className="relative w-full max-w-2xl h-[500px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div 
              key="envelope"
              initial={{ opacity: 0, y: 50, rotate: -10 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              onClick={() => setIsOpen(true)}
              className="cursor-pointer relative group"
            >
              <div className="w-64 h-48 bg-royal-purple rounded-2xl shadow-[0_20px_50px_rgba(93,63,211,0.3)] flex items-center justify-center relative overflow-hidden">
                <Mail size={80} className="text-white group-hover:scale-110 transition-transform" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 skew-y-12 origin-top-left" />
              </div>
              <motion.div 
                className="absolute -top-4 -right-4 w-12 h-12 bg-amethyst rounded-full flex items-center justify-center text-white font-bold"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                !
              </motion.div>
            </motion.div>
          ) : isSubmitted ? (
            <motion.div 
              key="submitted"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, y: -200 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <SendHorizontal size={48} className="text-white" />
              </div>
              <h3 className="text-3xl font-black text-white">Message Sent!</h3>
              <p className="text-soft-lavender/60">Our team will get back to you soon.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -100 }}
              className="glass-panel p-10 w-full relative"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-soft-lavender/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Send Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Name</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amethyst transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Email</label>
                    <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amethyst transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Message</label>
                  <textarea required rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-amethyst transition-all resize-none" />
                </div>
                <button type="submit" className="btn-premium w-full">Send Magic Letter</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// --- Sub-Views ---

function ContactsView() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setContacts(data);
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // Map and insert
      const formattedData = data.map((row: any) => ({
        name: row.Name || row.name || 'Unknown',
        whatsapp_number: String(row.Number || row.number || row.Phone || row.phone || '').replace(/\D/g, ''),
        batch: row.Batch || row.batch || '',
        course: row.Course || row.course || '',
        status: 'active'
      })).filter(c => c.whatsapp_number);

      const { error } = await supabase.from('contacts').insert(formattedData);
      if (error) alert(error.message);
      else {
        alert(`Successfully imported ${formattedData.length} contacts`);
        fetchContacts();
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-lavender/20" size={18} />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-amethyst transition-all"
          />
        </div>
        <div className="flex gap-4">
          <label className="btn-premium flex items-center gap-2 cursor-pointer">
            <FileUp size={20} />
            <span>Import Excel</span>
            <input type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <Plus size={20} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Number</th>
              <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Batch/Course</th>
              <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <RefreshCw className="animate-spin text-amethyst mx-auto mb-4" size={32} />
                  <p className="text-soft-lavender/40">Loading contacts...</p>
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <Users className="text-soft-lavender/10 mx-auto mb-4" size={48} />
                  <p className="text-soft-lavender/40">No contacts found. Import some to get started.</p>
                </td>
              </tr>
            ) : (
              contacts
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.whatsapp_number.includes(searchTerm))
                .map((contact) => (
                <tr key={contact.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{contact.name}</div>
                  </td>
                  <td className="px-6 py-4 text-soft-lavender/60">{contact.whatsapp_number}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-soft-lavender/80">{contact.course}</div>
                    <div className="text-xs text-soft-lavender/40">{contact.batch}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full uppercase">Active</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-white/10 rounded-lg text-soft-lavender/40 hover:text-white"><Edit2 size={16} /></button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg text-soft-lavender/40 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessagingView({ profile }: { profile: any }) {
  const [message, setMessage] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [sending, setSending] = useState(false);

  const handleEnhance = async () => {
    if (!message) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceMessage(message, 'marketing', { emoji: true, grammar: true });
      setMessage(enhanced);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSend = async () => {
    if (!message) return;
    if (profile.credits <= 0) {
      alert("You don't have enough credits. Please upgrade your plan.");
      return;
    }
    setSending(true);
    // Mock sending for now
    setTimeout(() => {
      alert("Campaign started successfully!");
      setSending(false);
      setMessage('');
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div className="glass-panel p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-white tracking-tight">Compose Message</h3>
            <button 
              onClick={handleEnhance}
              disabled={isEnhancing || !message}
              className="flex items-center gap-2 text-xs font-black text-amethyst uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
            >
              <Sparkles size={14} className={isEnhancing ? "animate-pulse" : ""} />
              <span>{isEnhancing ? "Enhancing..." : "AI Enhance"}</span>
            </button>
          </div>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-amethyst transition-all resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <button className="p-3 bg-white/5 rounded-xl text-soft-lavender/40 hover:text-white transition-colors"><Paperclip size={20} /></button>
              <button className="p-3 bg-white/5 rounded-xl text-soft-lavender/40 hover:text-white transition-colors"><Smartphone size={20} /></button>
            </div>
            <button 
              onClick={handleSend}
              disabled={sending || !message}
              className="btn-premium flex items-center gap-3 px-10"
            >
              {sending ? <RefreshCw className="animate-spin" size={20} /> : <SendHorizontal size={20} />}
              <span>{sending ? "Sending..." : "Send Campaign"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass-panel p-8">
          <h3 className="text-xl font-black text-white tracking-tight mb-6">Live Preview</h3>
          <div className="bg-[#0b141a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="bg-[#075e54] p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">B</div>
              <div>
                <div className="text-white font-bold text-sm">BulkMsg Pro</div>
                <div className="text-white/60 text-[10px]">Online</div>
              </div>
            </div>
            <div className="h-[400px] p-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
              <div className="bg-[#dcf8c6] p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm relative">
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{message || "Your message will appear here..."}</p>
                <span className="text-[10px] text-slate-400 absolute bottom-1 right-2">12:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryView() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
      if (data) setCampaigns(data);
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="glass-panel overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5 bg-white/5">
            <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Campaign Name</th>
            <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Progress</th>
            <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Date</th>
            <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {loading ? (
            <tr><td colSpan={5} className="px-6 py-20 text-center"><RefreshCw className="animate-spin text-amethyst mx-auto" /></td></tr>
          ) : campaigns.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-20 text-center text-soft-lavender/40">No campaign history found.</td></tr>
          ) : (
            campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full uppercase">{c.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${(c.sent_messages / c.total_messages) * 100}%` }} />
                  </div>
                  <div className="text-[10px] text-soft-lavender/40 mt-1">{c.sent_messages} / {c.total_messages} sent</div>
                </td>
                <td className="px-6 py-4 text-soft-lavender/60 text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-soft-lavender/40 hover:text-white"><BarChart3 size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function SettingsView({ profile }: { profile: any }) {
  return (
    <div className="max-w-2xl space-y-8">
      <div className="glass-panel p-10 space-y-8">
        <h3 className="text-xl font-black text-white tracking-tight">Account Settings</h3>
        <div className="space-y-6">
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <p className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest mb-1">Current Plan</p>
              <p className="text-lg font-black text-white uppercase">{profile?.plan || 'Free'}</p>
            </div>
            <div className="w-10 h-10 bg-amethyst/20 rounded-xl flex items-center justify-center text-amethyst">
              <Award size={24} />
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <p className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest mb-1">Available Credits</p>
              <p className="text-lg font-black text-white">{profile?.credits?.toLocaleString() || '0'}</p>
            </div>
            <div className="w-10 h-10 bg-royal-purple/20 rounded-xl flex items-center justify-center text-royal-purple">
              <Zap size={24} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <button className="w-full py-4 bg-royal-purple text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-royal-purple/20 transition-all">Upgrade Subscription</button>
          <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all">Buy Extra Credits</button>
        </div>
      </div>

      <div className="glass-panel p-10 space-y-6">
        <h3 className="text-xl font-black text-white tracking-tight">Security</h3>
        <button className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3">
          <Lock size={20} />
          <span>Change Password</span>
        </button>
      </div>
    </div>
  );
}

function AdminView({ user }: { user: any }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const handleUserSearch = async () => {
    if (!searchEmail) return;
    const { data } = await supabase.from('profiles').select('*').eq('email', searchEmail).single();
    setFoundUser(data);
  };

  const handleManualUpgrade = async (plan: string, credits: number) => {
    if (!foundUser) return;
    const { error } = await supabase.from('profiles').update({ plan, credits }).eq('id', foundUser.id);
    if (error) alert(error.message);
    else {
      alert("User upgraded successfully!");
      handleUserSearch();
    }
  };

  const showSqlSetup = () => {
    const sql = `
-- 0. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 100,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan_id TEXT,
  amount NUMERIC,
  currency TEXT,
  payment_status TEXT DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT,
  whatsapp_number TEXT,
  batch TEXT,
  course TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  total_messages INTEGER DEFAULT 0,
  sent_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (auth.jwt() ->> 'email' = 'prajwalnawale3040@gmail.com');
    `;
    console.log(sql);
    alert("SQL Setup commands have been logged to the console. Please run them in your Supabase SQL Editor.");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn("px-6 py-4 text-sm font-black uppercase tracking-widest transition-all", activeTab === 'orders' ? "text-amethyst border-b-2 border-amethyst" : "text-soft-lavender/40 hover:text-white")}
          >
            Automatic Orders
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={cn("px-6 py-4 text-sm font-black uppercase tracking-widest transition-all", activeTab === 'users' ? "text-amethyst border-b-2 border-amethyst" : "text-soft-lavender/40 hover:text-white")}
          >
            Manual Upgrade
          </button>
        </div>
        <button 
          onClick={showSqlSetup}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-soft-lavender/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <Database size={14} />
          <span>Database Setup (SQL)</span>
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Plan</th>
                <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center"><RefreshCw className="animate-spin text-amethyst mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-soft-lavender/40">No orders found.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-soft-lavender/60">{o.id}</td>
                    <td className="px-6 py-4 text-white font-bold">{o.user_id}</td>
                    <td className="px-6 py-4 text-amethyst font-bold uppercase text-xs">{o.plan_id}</td>
                    <td className="px-6 py-4 text-white font-black">₹{o.amount}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 text-[10px] font-black rounded-full uppercase",
                        o.payment_status === 'paid' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      )}>
                        {o.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="max-w-2xl space-y-8">
          <div className="glass-panel p-10 space-y-6">
            <h3 className="text-xl font-black text-white tracking-tight">Search User</h3>
            <div className="flex gap-4">
              <input 
                type="email" 
                placeholder="user@example.com" 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-amethyst"
              />
              <button onClick={handleUserSearch} className="btn-premium px-8">Search</button>
            </div>
          </div>

          {foundUser && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-black text-white">{foundUser.email}</h4>
                  <p className="text-soft-lavender/40">Current Plan: <span className="text-amethyst font-bold uppercase">{foundUser.plan}</span></p>
                  <p className="text-soft-lavender/40">Credits: <span className="text-white font-bold">{foundUser.credits}</span></p>
                </div>
                <div className="w-16 h-16 bg-royal-purple/20 rounded-2xl flex items-center justify-center text-amethyst">
                  <UserPlus size={32} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleManualUpgrade('professional', 150000)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-amethyst transition-all text-left group">
                  <div className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest mb-1">Upgrade to</div>
                  <div className="text-lg font-black text-white group-hover:text-amethyst">Professional</div>
                  <div className="text-xs text-soft-lavender/40">150,000 Credits</div>
                </button>
                <button onClick={() => handleManualUpgrade('enterprise', 1000000)} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-amethyst transition-all text-left group">
                  <div className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest mb-1">Upgrade to</div>
                  <div className="text-lg font-black text-white group-hover:text-amethyst">Enterprise</div>
                  <div className="text-xs text-soft-lavender/40">1,000,000 Credits</div>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

const DashboardView = () => {
  const [chartData] = useState([
    { name: 'Mon', sent: 4000, delivered: 3800 },
    { name: 'Tue', sent: 3000, delivered: 2900 },
    { name: 'Wed', sent: 2000, delivered: 1950 },
    { name: 'Thu', sent: 2780, delivered: 2700 },
    { name: 'Fri', sent: 1890, delivered: 1800 },
    { name: 'Sat', sent: 2390, delivered: 2300 },
    { name: 'Sun', sent: 3490, delivered: 3400 },
  ]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <DashboardStat label="Total Contacts" value="12,458" icon={Users} color="bg-blue-600" />
        <DashboardStat label="Messages Sent" value="85,241" icon={SendHorizontal} color="bg-royal-purple" />
        <DashboardStat label="Delivery Rate" value="98.2%" icon={CheckCircle2} color="bg-emerald-600" />
        <DashboardStat label="Active Campaigns" value="14" icon={Zap} color="bg-amethyst" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-panel p-10"
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Analytics Overview</h3>
              <p className="text-soft-lavender/40 text-sm">Real-time performance metrics</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Weekly</button>
              <button className="px-4 py-2 bg-royal-purple rounded-xl text-xs font-bold transition-all">Monthly</button>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: THEME.dark, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sent" stroke={THEME.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorSent)" />
                <Area type="monotone" dataKey="delivered" stroke={THEME.secondary} strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-10 flex flex-col"
        >
          <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Recent Activity</h3>
          <div className="space-y-8 flex-1">
            {[
              { type: 'sent', title: 'Campaign "Summer Sale" Sent', time: '2 mins ago', icon: SendHorizontal, color: 'text-emerald-400' },
              { type: 'user', title: 'New Contact Batch Imported', time: '1 hour ago', icon: Users, color: 'text-blue-400' },
              { type: 'alert', title: 'Plan Expiring Soon', time: '3 hours ago', icon: AlertCircle, color: 'text-amber-400' },
              { type: 'payment', title: 'Payment Successful', time: '5 hours ago', icon: CreditCard, color: 'text-purple-400' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <item.icon size={18} className={item.color} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-amethyst transition-colors">{item.title}</p>
                  <p className="text-xs text-soft-lavender/40">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 mt-8 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
            View All Activity
          </button>
        </motion.div>
      </div>
    </div>
  );
};
