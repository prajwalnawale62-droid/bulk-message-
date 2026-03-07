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
  ArrowLeft,
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
type View = 'landing' | 'dashboard' | 'contacts' | 'messaging' | 'history' | 'plans' | 'settings' | 'admin' | 'login' | 'pricing' | 'contact' | 'guide';

// --- Constants ---
const THEME = {
  primary: '#5D3FD3', // Deep Royal Purple
  secondary: '#9966CC', // Amethyst
  accent: '#4B0082', // Dark Violet
  light: '#E6E6FA', // Soft Lavender
  dark: '#050505', // Deep Night
};

// --- Components ---

const TechtaireLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-royal-purple via-amethyst to-soft-lavender rounded-xl blur-md opacity-30 animate-pulse" />
    <div className="relative w-full h-full bg-deep-night rounded-xl border border-white/10 flex items-center justify-center overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-royal-purple/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white relative z-10 drop-shadow-[0_0_8px_rgba(93,63,211,0.8)]">
        <path d="M3 8L12 3L21 8L12 13L3 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 16L12 21L21 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-royal-purple to-transparent opacity-50" />
    </div>
  </div>
);

const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -50, x: '-50%' }}
    animate={{ opacity: 1, y: 20, x: '-50%' }}
    exit={{ opacity: 0, y: -50, x: '-50%' }}
    className={cn(
      "fixed top-0 left-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-4 min-w-[320px]",
      type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
    )}
  >
    {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
    <span className="font-bold tracking-tight">{message}</span>
    <button onClick={onClose} className="ml-auto p-1 hover:bg-white/5 rounded-lg transition-colors">
      <X size={18} />
    </button>
  </motion.div>
);

const TrialTimer = ({ expiry }: { expiry: string }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(expiry).getTime() - new Date().getTime();
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  if (timeLeft <= 0) return (
    <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
      <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Expired</span>
    </div>
  );

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="px-3 py-1 bg-amethyst/10 border border-amethyst/20 rounded-full flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-amethyst rounded-full animate-pulse" />
      <span className="text-[10px] font-black text-amethyst uppercase tracking-widest">
        {minutes}:{seconds.toString().padStart(2, '0')} Left
      </span>
    </div>
  );
};

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
              Techtaire
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
        <span className="text-5xl font-black text-white">{plan.price === '0' ? 'Free' : `₹${plan.price}`}</span>
        {plan.amount > 1 && <span className="text-soft-lavender/40">/month</span>}
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
  useEffect(() => {
  document.title = "Techtaire";
}, []);
  const [view, setView] = useState<View>('landing');
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [logoClicks, setLogoClicks] = useState(0);
  const isAdmin = user?.email === 'prajwalnawale3040@gmail.com';
  const isExpired = profile?.plan === 'free_trial' && profile?.trial_expiry && new Date(profile.trial_expiry) < new Date();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handlePayment = async (plan: any) => {
    if (!user) {
      setView('login');
      return;
    }
    if (plan.amount === 0) {
      if (confirm("Activate 1-Minute Free Trial?")) {
        activateFreeTrial();
      }
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const activateFreeTrial = async () => {
    if (!user) return;
    try {
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 1); // 1 minute expiry

      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan: 'free_trial',
          credits: 100,
          trial_expiry: expiry.toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      showNotify("Free Trial Activated! You have 1 minute of demo access.", 'success');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      showNotify("Failed to activate free trial: " + err.message, 'error');
    }
  };

  const processRazorpay = async () => {
    if (!selectedPlan || !user) return;
    try {
      const response = await axios.post('/api/payment/create-order', {
        amount: selectedPlan.amount,
        planName: selectedPlan.name,
        userId: user.id
      });

      const { id: orderId, currency, amount, key } = response.data;

      const options = {
        key,
        amount,
        currency,
        name: "Techtaire",
        description: `Upgrade to ${selectedPlan.name} Plan`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Update subscription in database
            const { error } = await supabase
              .from('profiles')
              .update({ 
                plan: selectedPlan.name.toLowerCase().replace(' ', '_'),
                credits: selectedPlan.name === 'Enterprise' ? 1000000 : 10000,
                trial_expiry: null // Remove trial expiry on payment
              })
              .eq('id', user.id);

            if (error) throw error;

            showNotify(`Welcome to ${selectedPlan.name}! Your subscription is now active.`, 'success');
            setShowPaymentModal(false);
            
            // Log the order
            await supabase.from('orders').insert({
              user_id: user.id,
              plan_name: selectedPlan.name,
              amount: selectedPlan.amount,
              status: 'completed',
              razorpay_order_id: orderId,
              razorpay_payment_id: response.razorpay_payment_id
            });

            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: [THEME.primary, THEME.secondary, '#ffffff']
            });

            setTimeout(() => window.location.reload(), 3000);
          } catch (err: any) {
            console.error("Subscription update error:", err);
            showNotify("Payment successful, but failed to update subscription. Please contact support.", 'error');
          }
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

    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session) {
          setView('dashboard');
        }
        setLoading(false); // Always set loading to false after session check
      } catch (err) {
        console.error("Session check error:", err);
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      setUser(session?.user ?? null);
      
      if (!session) {
        setProfile(null);
        setView('landing');
        setLoading(false);
      } else {
        // If we just signed in or session was found, go to dashboard
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setView('dashboard');
          setLoading(false); // Ensure loading is false when session is found
        }
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
            const trialExpiry = new Date();
            trialExpiry.setDate(trialExpiry.getDate() + 7);
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: user.id, 
                email: user.email, 
                plan: 'trial', 
                credits: 50,
                trial_expiry: trialExpiry.toISOString(),
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
      <AnimatePresence>
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>
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
              <TechtaireLogo className="w-12 h-12" />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-black glow-text tracking-tighter"
                >
                  Techtaire
                </motion.span>
              )}
            </div>

            <nav className="px-6 space-y-3">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} isOpen={isSidebarOpen} />
              <SidebarItem icon={Users} label="Contacts" active={view === 'contacts'} onClick={() => setView('contacts')} isOpen={isSidebarOpen} disabled={isExpired} />
              <SidebarItem icon={SendHorizontal} label="Messaging" active={view === 'messaging'} onClick={() => setView('messaging')} isOpen={isSidebarOpen} disabled={isExpired} />
              <SidebarItem icon={History} label="History" active={view === 'history'} onClick={() => setView('history')} isOpen={isSidebarOpen} disabled={isExpired} />
              <SidebarItem icon={LampIcon as any} label="Guide" active={view === 'guide'} onClick={() => setView('guide')} isOpen={isSidebarOpen} />
              <SidebarItem icon={CreditCard} label="Plans" active={view === 'plans'} onClick={() => setView('plans')} isOpen={isSidebarOpen} />
              <SidebarItem icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} isOpen={isSidebarOpen} disabled={isExpired} />
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
                {profile?.plan === 'free_trial' && profile?.trial_expiry && (
                  <TrialTimer expiry={profile.trial_expiry} />
                )}
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-white">{user?.email}</span>
                  <span className="text-[10px] text-amethyst font-black uppercase tracking-widest">
                    {profile?.plan || 'Free'} Plan
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
                  {view === 'dashboard' && <DashboardView user={user} profile={profile} setView={setView} />}
                  {view === 'contacts' && <ContactsView user={user} />}
                  {view === 'messaging' && <MessagingView profile={profile} user={user} />}
                  {view === 'history' && <HistoryView user={user} />}
                  {view === 'guide' && <GuideView setView={setView} />}
                  {view === 'plans' && <PricingPage setView={setView} isDashboard onSelect={handlePayment} />}
                  {view === 'settings' && <SettingsView profile={profile} />}
                  {view === 'admin' && <AdminView user={user} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowPaymentModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg glass-panel p-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-royal-purple via-amethyst to-royal-purple" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight mb-2">Complete Payment</h3>
                <p className="text-soft-lavender/40">Upgrade to {selectedPlan?.name} Plan</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-amethyst">₹{selectedPlan?.price}</p>
                <p className="text-[10px] text-soft-lavender/20 uppercase tracking-widest">Secure Transaction</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-6">
                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Smartphone size={16} className="text-amethyst" />
                  Direct UPI Payment
                </h4>
                
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-2xl">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9551522030-3@ibl%26pn=Techtaire%26am=${selectedPlan?.price}%26cu=INR`} 
                      alt="UPI QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href={`upi://pay?pa=9551522030-3@ibl&pn=Techtaire&am=${selectedPlan?.price}&cu=INR`}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Pay_Logo.svg" alt="GPay" className="w-full h-full" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Google Pay</span>
                  </a>
                  <a 
                    href={`upi://pay?pa=9551522030-3@ibl&pn=Techtaire&am=${selectedPlan?.price}&cu=INR`}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 bg-[#5f259f] rounded-full flex items-center justify-center p-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="w-full h-full invert" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">PhonePe</span>
                  </a>
                </div>

                <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-soft-lavender/40 uppercase mb-1">UPI ID</p>
                    <p className="text-sm font-bold text-white select-all">9551522030-3@ibl</p>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                
                <p className="text-[10px] text-soft-lavender/40 text-center italic">
                  * After payment, your plan will be activated automatically within minutes.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-deep-night px-4 text-soft-lavender/20 font-black tracking-widest">OR</span>
                </div>
              </div>

              <button 
                onClick={processRazorpay}
                className="w-full py-5 btn-premium flex items-center justify-center gap-3 group"
              >
                <CreditCard size={20} className="group-hover:rotate-12 transition-transform" />
                <span>Pay via Razorpay / Cards</span>
              </button>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-soft-lavender/40 text-center leading-relaxed">
                  After direct UPI payment, please share the screenshot with our support team or enter the UTR number in settings for auto-verification.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-6 right-6 text-soft-lavender/20 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const SidebarItem = ({ icon: Icon, label, active, onClick, isOpen, disabled }: { icon: any, label: string, active: boolean, onClick: () => void, isOpen: boolean, disabled?: boolean }) => (
  <button
    onClick={disabled ? () => alert("Your free trial has expired. Please upgrade to continue.") : onClick}
    className={cn(
      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-500 group relative",
      active 
        ? "bg-royal-purple text-white shadow-lg shadow-royal-purple/20" 
        : "text-soft-lavender/40 hover:bg-white/5 hover:text-white",
      disabled && "opacity-30 grayscale cursor-not-allowed"
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
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className={cn("relative transition-colors duration-1000", isDarkMode ? "bg-deep-night" : "bg-[#1a0b2e]")}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-24 px-10 flex items-center justify-between z-[60] bg-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <TechtaireLogo />
          <span className="text-2xl font-black text-white tracking-tighter">Techtaire</span>
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
            <button 
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 rounded-2xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
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
            <p className="text-soft-lavender/60">Join thousands of businesses scaling their growth with Techtaire.</p>
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
                  Hello! I'm your Techtaire AI assistant. How can I help you today?
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

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
              onClick={() => setShowDemo(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl aspect-video glass-panel overflow-hidden shadow-[0_0_100px_rgba(93,63,211,0.3)]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-royal-purple via-amethyst to-royal-purple" />
              <div className="absolute top-6 right-6 z-10">
                <button 
                  onClick={() => setShowDemo(false)}
                  className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-royal-purple transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="w-full h-full bg-black flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-royal-purple/20 to-transparent pointer-events-none" />
                
                <div className="text-center z-10">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-24 h-24 bg-royal-purple rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(93,63,211,0.5)] cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Zap size={48} className="text-white fill-white ml-2" />
                  </motion.div>
                  <motion.h3 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-black text-white mb-4 tracking-tight"
                  >
                    Experience Techtaire
                  </motion.h3>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-soft-lavender/60 text-lg max-w-md mx-auto"
                  >
                    Watch how we transform your WhatsApp marketing with AI-powered automation.
                  </motion.p>
                </div>

                {/* Video UI Overlays */}
                <div className="absolute top-8 left-8 flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Live Demo</span>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-black to-transparent">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between text-[10px] font-black text-soft-lavender/40 uppercase tracking-widest">
                      <span>Automating Campaign...</span>
                      <span>72% Complete</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-royal-purple to-amethyst"
                          animate={{ width: ['0%', '72%', '100%'] }}
                          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-white/10" />
                          ))}
                        </div>
                        <span className="text-xs font-mono text-soft-lavender/40">1.2k Watching</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-20 px-10 border-t border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-royal-purple rounded-xl flex items-center justify-center">
                <Send size={20} className="text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">Techtaire</span>
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
          © 2026 Techtaire. All rights reserved. Made with 💜 for marketers.
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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // The onAuthStateChange listener in App will handle the view change, 
        // but we set it here as well for immediate feedback.
        if (data.session) {
          setView('dashboard');
        }
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
          <div className="flex flex-col items-center gap-6">
            <TechtaireLogo className="w-24 h-24" />
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              onClick={handleLogoClick}
              className="cursor-pointer"
            >
              <BearCharacter animation={isFocused ? 'point' : 'sleep'} />
            </motion.div>
          </div>
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
              {isSignUp ? 'Join the Pack' : 'Welcome Back'}
            </h2>
            <p className="text-soft-lavender/40">
              {isSignUp ? 'Start your journey with Techtaire today.' : 'The bear is waiting for you to light up the screen.'}
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
            <div className="flex items-center justify-between mb-10">
              <button 
                onClick={() => setView('landing')}
                className="flex items-center gap-2 text-soft-lavender/40 hover:text-white transition-colors group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Back</span>
              </button>
              <TechtaireLogo className="w-10 h-10 lg:hidden" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-royal-purple rounded-xl flex items-center justify-center">
                  <Lock size={20} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {isSignUp ? 'Create Account' : 'Secure Access'}
                </h3>
              </div>
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
    { name: 'Free Trial', price: '0', amount: 0, features: ['1 Minute Access', 'Demo Messaging', 'Basic AI', 'Limited Contacts'], isDemo: true },
    { name: 'Demo', price: '1', amount: 1, features: ['Full Access for 1 Day', 'Priority Support', 'AI Enhancement', 'Unlimited Contacts'], isDemo: true },
    { name: 'Monthly', price: '2,499', amount: 2499, features: ['Unlimited Messages', 'AI Enhancement', 'Priority Support', 'File Attachments', 'Advanced Analytics'] },
    { name: 'Yearly', price: '17,999', amount: 17999, features: ['Everything in Monthly', '2 Months Free', 'Dedicated Account Manager', 'Custom API Integration', 'White Label Reports'] }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} isPremium={i >= 2} onSelect={onSelect} />
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

function ContactsView({ user }: { user: any }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isBatch, setIsBatch] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [newContact, setNewContact] = useState({ name: '', whatsapp_number: '', batch: '', course: '' });

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setContacts(data);
    setLoading(false);
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete contact: " + error.message);
    } else {
      fetchContacts();
    }
  };

  const handleEditContact = (contact: any) => {
    setEditingContact(contact);
    setIsBatch(false);
    setNewContact({
      name: contact.name,
      whatsapp_number: contact.whatsapp_number,
      batch: contact.batch || '',
      course: contact.course || ''
    });
    setShowAddModal(true);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingContact) {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: newContact.name,
          whatsapp_number: newContact.whatsapp_number.replace(/\D/g, ''),
          batch: newContact.batch,
          course: newContact.course
        })
        .eq('id', editingContact.id);

      if (error) {
        alert(error.message);
      } else {
        setShowAddModal(false);
        setEditingContact(null);
        setNewContact({ name: '', whatsapp_number: '', batch: '', course: '' });
        fetchContacts();
      }
      return;
    }

    if (isBatch) {
      // Bulk insert for batch
      const numbers = newContact.whatsapp_number.split(/[\n,]+/).map(n => n.trim().replace(/\D/g, '')).filter(n => n.length >= 10);
      if (numbers.length === 0) {
        alert("Please enter at least one valid WhatsApp number.");
        return;
      }

      const contactsToInsert = numbers.map(num => ({
        user_id: user.id,
        name: newContact.name, // Using batch name as contact name or we could use "Student"
        whatsapp_number: num,
        batch: newContact.name,
        course: newContact.course,
        status: 'active'
      }));

      const { error } = await supabase.from('contacts').insert(contactsToInsert);
      if (error) {
        console.error("Add Batch Error:", error);
        alert(error.message);
      } else {
        setShowAddModal(false);
        setNewContact({ name: '', whatsapp_number: '', batch: '', course: '' });
        fetchContacts();
      }
    } else {
      const contactToInsert = {
        ...newContact,
        user_id: user.id,
        whatsapp_number: newContact.whatsapp_number.replace(/\D/g, ''),
        status: 'active'
      };

      const { error } = await supabase.from('contacts').insert([contactToInsert]);
      if (error) {
        console.error("Add Contact Error:", error);
        alert(error.message);
      } else {
        setShowAddModal(false);
        setNewContact({ name: '', whatsapp_number: '', batch: '', course: '' });
        fetchContacts();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const dataBuffer = evt.target?.result;
        const wb = XLSX.read(dataBuffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        console.log("Excel Data Parsed:", data);

        if (data.length === 0) {
          alert("No data found in Excel file.");
          return;
        }

        // Map and insert
        const formattedData = data.map((row: any) => {
          // Find name column
          const name = row.Name || row.name || row.StudentName || row.Student || row['Student Name'] || row['Full Name'] || row.FullName || 'Unknown';
          
          // Find number column
          const rawNumber = row.Number || row.number || row.Phone || row.phone || row.WhatsApp || row['WhatsApp Number'] || row['Phone Number'] || row.Contact || row.Mobile || '';
          const whatsapp_number = String(rawNumber).replace(/\D/g, '');
          
          // Find batch/course
          const batch = row.Batch || row.batch || row.Class || row.class || row.Group || row.group || '';
          const course = row.Course || row.course || row.Subject || row.subject || '';

          return {
            user_id: user.id,
            name,
            whatsapp_number,
            batch,
            course,
            status: 'active'
          };
        }).filter(c => c.whatsapp_number && c.whatsapp_number.length >= 10);

        console.log("Formatted Data for Insert:", formattedData);

        if (formattedData.length === 0) {
          alert("No valid contacts found. Please ensure the Excel has 'Name' and 'Number' columns. (Numbers must be at least 10 digits)");
          return;
        }

        const { error } = await supabase.from('contacts').insert(formattedData);
        if (error) {
          console.error("Import Error:", error);
          alert("Database Error: " + error.message);
        } else {
          alert(`Successfully imported ${formattedData.length} contacts`);
          fetchContacts();
        }
      } catch (err: any) {
        console.error("Excel Parsing Error:", err);
        alert("Failed to parse Excel file. Please ensure it's a valid .xlsx or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL contacts? This cannot be undone.")) return;
    const { error } = await supabase.from('contacts').delete().eq('user_id', user.id);
    if (error) alert(error.message);
    else fetchContacts();
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.whatsapp_number.includes(searchTerm) ||
    c.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button 
            onClick={() => { setIsBatch(false); setShowAddModal(true); }}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Add Contact</span>
          </button>
          <button 
            onClick={() => { setIsBatch(true); setShowAddModal(true); }}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Database size={20} />
            <span>Add Batch</span>
          </button>
          <button 
            onClick={handleDeleteAll}
            className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl font-bold text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2"
          >
            <Trash2 size={20} />
            <span>Delete All</span>
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
            ) : filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-soft-lavender/40">
                  No contacts found.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
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
                      <button 
                        onClick={() => handleEditContact(contact)}
                        className="p-2 hover:bg-white/10 rounded-lg text-soft-lavender/40 hover:text-white"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-soft-lavender/40 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md glass-panel p-10"
          >
            <h3 className="text-2xl font-black text-white mb-8 tracking-tight">
              {isBatch ? 'Add New Batch' : 'Add New Contact'}
            </h3>
            <form onSubmit={handleAddContact} className="space-y-6">
              {isBatch ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Batch Name</label>
                    <input 
                      type="text" 
                      required
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
                      placeholder="e.g. Class 10th A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Course/Subject</label>
                    <input 
                      type="text" 
                      value={newContact.course}
                      onChange={(e) => setNewContact({ ...newContact, course: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
                      placeholder="e.g. Mathematics"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">WhatsApp Numbers (One per line or comma separated)</label>
                    <textarea 
                      required
                      value={newContact.whatsapp_number}
                      onChange={(e) => setNewContact({ ...newContact, whatsapp_number: e.target.value })}
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all resize-none"
                      placeholder="919876543210&#10;919876543211"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      required
                      value={newContact.whatsapp_number}
                      onChange={(e) => setNewContact({ ...newContact, whatsapp_number: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
                      placeholder="e.g. 919876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Batch (Optional)</label>
                    <input 
                      type="text" 
                      value={newContact.batch}
                      onChange={(e) => setNewContact({ ...newContact, batch: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
                      placeholder="e.g. Class 10th A"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingContact(null); }}
                  className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-premium"
                >
                  {editingContact ? 'Update' : 'Save'} {isBatch ? 'Batch' : 'Contact'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function MessagingView({ profile, user }: { profile: any, user: any }) {
  const [message, setMessage] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [contactCount, setContactCount] = useState(0);

  const isExpired = profile?.plan === 'free_trial' && profile?.trial_expiry && new Date(profile.trial_expiry) < new Date();
  
  useEffect(() => {
    if (user) fetchBatches();
  }, [user]);

  const fetchBatches = async () => {
    const { data } = await supabase.from('contacts').select('batch').eq('user_id', user.id);
    if (data) {
      const uniqueBatches = Array.from(new Set(data.map(c => c.batch).filter(Boolean)));
      setBatches(uniqueBatches);
    }
  };

  useEffect(() => {
    if (user) fetchContactCount();
  }, [user, selectedBatch]);

  const fetchContactCount = async () => {
    let query = supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (selectedBatch !== 'all') {
      query = query.eq('batch', selectedBatch);
    }
    const { count } = await query;
    setContactCount(count || 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (isExpired) {
      alert("Your free trial has expired. Please upgrade to continue.");
      return;
    }
    if (!message && !attachment) return;
    if (!user) return;
    
    if (!profile.whatsapp_api_key || !profile.whatsapp_phone_number_id) {
      alert("Please configure your WhatsApp API settings first.");
      return;
    }

    setSending(true);
    try {
      // 1. Fetch user's contacts
      let query = supabase
        .from('contacts')
        .select('whatsapp_number')
        .eq('user_id', user.id);
      
      if (selectedBatch !== 'all') {
        query = query.eq('batch', selectedBatch);
      }

      const { data: contacts } = await query;
      
      if (!contacts || contacts.length === 0) {
        alert("No contacts found to send to.");
        setSending(false);
        return;
      }

      // Plan Restrictions
      let contactsToSend = contacts;
      if (profile.plan === 'demo') {
        if (contacts.length > 50) {
          alert("Demo plan is limited to 50 contacts. Only first 50 will be processed.");
          contactsToSend = contacts.slice(0, 50);
        }
      }

      const maxMessages = profile.plan === 'demo' ? 10 : Infinity;
      if (profile.plan === 'demo') {
        alert("Demo plan is limited to 10 messages total per campaign.");
      }

      // 2. Send messages
      let successCount = 0;
      for (let i = 0; i < contactsToSend.length; i++) {
        if (successCount >= maxMessages) break;
        
        const contact = contactsToSend[i];
        try {
          await axios.post('/api/whatsapp/send', {
            to: contact.whatsapp_number,
            message,
            apiKey: profile.whatsapp_api_key,
            phoneNumberId: profile.whatsapp_phone_number_id,
            attachmentUrl: attachmentPreview
          });
          successCount++;
        } catch (e) {
          console.error(`Failed to send to ${contact.whatsapp_number}`, e);
        }
      }

      // 3. Log campaign
      await supabase.from('campaigns').insert([{
        user_id: user.id,
        name: `Campaign ${new Date().toLocaleString()}`,
        message,
        status: 'completed',
        total_messages: contactsToSend.length,
        sent_messages: successCount
      }]);

      alert(`Campaign completed! Sent to ${successCount}/${contactsToSend.length} contacts.`);
      setMessage('');
      setAttachment(null);
      setAttachmentPreview(null);
    } catch (error: any) {
      alert("Failed to start campaign: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        {isExpired && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
            <AlertCircle className="text-red-400" size={24} />
            <div>
              <p className="text-white font-bold">Free Trial Expired</p>
              <p className="text-sm text-soft-lavender/60">Your 1-minute demo has ended. Please upgrade to a paid plan to continue messaging.</p>
            </div>
          </div>
        )}

        <div className="glass-panel p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-white tracking-tight">Compose Message</h3>
            <button 
              onClick={handleEnhance}
              disabled={isEnhancing || !message || isExpired}
              className="flex items-center gap-2 text-xs font-black text-amethyst uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
            >
              <Sparkles size={14} className={isEnhancing ? "animate-pulse" : ""} />
              <span>{isEnhancing ? "Enhancing..." : "AI Enhance"}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-soft-lavender/40 uppercase tracking-widest">Select Target Batch</label>
                <select 
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  disabled={isExpired}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amethyst transition-all"
                >
                  <option value="all" className="bg-deep-night">All Contacts ({contactCount})</option>
                  {batches.map(b => (
                    <option key={b} value={b} className="bg-deep-night">{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isExpired}
              placeholder="Type your message here..."
              className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-amethyst transition-all resize-none disabled:opacity-50"
            />
          </div>
          
          {attachmentPreview && (
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-white/10 group">
              {attachment?.type.startsWith('image/') ? (
                <img src={attachmentPreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <FileUp size={32} className="text-soft-lavender/20" />
                </div>
              )}
              <button 
                onClick={() => { setAttachment(null); setAttachmentPreview(null); }}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <label className={cn(
                "p-3 bg-white/5 rounded-xl text-soft-lavender/40 hover:text-white transition-colors cursor-pointer",
                isExpired && "opacity-50 cursor-not-allowed"
              )}>
                <Paperclip size={20} />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" disabled={isExpired} />
              </label>
              <button disabled={isExpired} className="p-3 bg-white/5 rounded-xl text-soft-lavender/40 hover:text-white transition-colors disabled:opacity-50"><Smartphone size={20} /></button>
            </div>
            <button 
              onClick={handleSend}
              disabled={sending || (!message && !attachment) || isExpired}
              className="btn-premium flex items-center gap-3 px-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <RefreshCw className="animate-spin" size={20} /> : <SendHorizontal size={20} />}
              <span>{sending ? "Sending..." : "Send Campaign"}</span>
            </button>
          </div>
          
          {profile.plan === 'demo' && (
            <p className="text-[10px] text-amethyst font-bold uppercase tracking-widest text-center">
              Demo Plan Active: 10 Messages / 50 Contacts Limit
            </p>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass-panel p-8">
          <h3 className="text-xl font-black text-white tracking-tight mb-6">Live Preview</h3>
          <div className="bg-[#0b141a] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="bg-[#075e54] p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">T</div>
              <div>
                <div className="text-white font-bold text-sm">Techtaire</div>
                <div className="text-white/60 text-[10px]">Online</div>
              </div>
            </div>
            <div className="h-[400px] p-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat overflow-y-auto">
              <div className="bg-[#dcf8c6] p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm relative">
                {attachmentPreview && attachment?.type.startsWith('image/') && (
                  <img src={attachmentPreview} className="w-full rounded-lg mb-2" alt="Attachment" />
                )}
                {attachmentPreview && attachment?.type.startsWith('video/') && (
                  <video src={attachmentPreview} className="w-full rounded-lg mb-2" controls />
                )}
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

function HistoryView({ user }: { user: any }) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign record?")) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchCampaigns();
  };

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
              <tr key={c.id} className="hover:bg-white/5 transition-colors group">
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
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-soft-lavender/40 hover:text-white"><BarChart3 size={16} /></button>
                    <button 
                      onClick={() => handleDeleteCampaign(c.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-soft-lavender/40 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
  const [whatsappConfig, setWhatsappConfig] = useState({
    api_key: profile?.whatsapp_api_key || '',
    phone_number_id: profile?.whatsapp_phone_number_id || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        whatsapp_api_key: whatsappConfig.api_key,
        whatsapp_phone_number_id: whatsappConfig.phone_number_id
      })
      .eq('id', profile.id);
    
    if (error) alert(error.message);
    else alert("Settings saved successfully!");
    setSaving(false);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div className="glass-panel p-10 space-y-8">
        <h3 className="text-xl font-black text-white tracking-tight">WhatsApp API Configuration</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Access Token</label>
            <input 
              type="password" 
              value={whatsappConfig.api_key}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, api_key: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
              placeholder="EAAB..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Phone Number ID</label>
            <input 
              type="text" 
              value={whatsappConfig.phone_number_id}
              onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phone_number_id: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
              placeholder="123456789..."
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-premium w-full"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>

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
          {profile?.trial_expiry && (
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Trial Status</p>
              <p className="text-sm text-emerald-400/80">
                Your free trial expires on {new Date(profile.trial_expiry).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <button className="w-full py-4 bg-royal-purple text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-royal-purple/20 transition-all">Upgrade Subscription</button>
        </div>
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
  plan TEXT DEFAULT 'trial',
  credits INTEGER DEFAULT 50,
  trial_expiry TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  whatsapp_api_key TEXT,
  whatsapp_phone_number_id TEXT,
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

const DashboardView = ({ user, profile, setView }: { user: any, profile: any, setView: (v: View) => void }) => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    messagesSent: 0,
    activeCampaigns: 0,
    deliveryRate: '98.5%'
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Total Contacts
        const { count: contactCount } = await supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // 2. Campaigns Stats
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        const totalSent = campaigns?.reduce((acc, c) => acc + (c.sent_messages || 0), 0) || 0;
        const activeCount = campaigns?.filter(c => c.status === 'pending' || c.status === 'sending').length || 0;

        setStats({
          totalContacts: contactCount || 0,
          messagesSent: totalSent,
          activeCampaigns: activeCount,
          deliveryRate: '98.5%'
        });

        // 3. Recent Activity
        const activity = campaigns?.slice(0, 4).map(c => ({
          title: `Campaign "${c.name}" ${c.status}`,
          time: new Date(c.created_at).toLocaleTimeString(),
          icon: SendHorizontal,
          color: c.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
        })) || [];
        setRecentActivity(activity);

        // 4. Mock Chart Data based on real stats
        setChartData([
          { name: 'Mon', sent: Math.floor(totalSent * 0.1), delivered: Math.floor(totalSent * 0.09) },
          { name: 'Tue', sent: Math.floor(totalSent * 0.15), delivered: Math.floor(totalSent * 0.14) },
          { name: 'Wed', sent: Math.floor(totalSent * 0.12), delivered: Math.floor(totalSent * 0.11) },
          { name: 'Thu', sent: Math.floor(totalSent * 0.2), delivered: Math.floor(totalSent * 0.19) },
          { name: 'Fri', sent: Math.floor(totalSent * 0.18), delivered: Math.floor(totalSent * 0.17) },
          { name: 'Sat', sent: Math.floor(totalSent * 0.1), delivered: Math.floor(totalSent * 0.09) },
          { name: 'Sun', sent: Math.floor(totalSent * 0.15), delivered: Math.floor(totalSent * 0.14) },
        ]);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <RefreshCw className="animate-spin text-amethyst" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="glass-panel p-6 flex items-center justify-between border-amethyst/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amethyst/10 rounded-2xl flex items-center justify-center text-amethyst">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Current Subscription</p>
            <h3 className="text-xl font-black text-white uppercase">{profile?.plan || 'Free Trial'}</h3>
            {profile?.plan === 'free_trial' && (
              <p className="text-[10px] text-amber-400 font-bold animate-pulse">DEMO EXPIRES IN 1 MINUTE</p>
            )}
          </div>
        </div>
        <button 
          onClick={() => setView('plans')}
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Upgrade Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <DashboardStat label="Total Contacts" value={stats.totalContacts.toLocaleString()} icon={Users} color="bg-blue-600" />
        <DashboardStat label="Messages Sent" value={stats.messagesSent.toLocaleString()} icon={SendHorizontal} color="bg-royal-purple" />
        <DashboardStat label="Delivery Rate" value={stats.deliveryRate} icon={CheckCircle2} color="bg-emerald-600" />
        <DashboardStat label="Active Campaigns" value={stats.activeCampaigns.toString()} icon={Zap} color="bg-amethyst" />
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
            {recentActivity.length === 0 ? (
              <p className="text-soft-lavender/40 text-center py-10">No recent activity</p>
            ) : (
              recentActivity.map((item, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-all">
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-amethyst transition-colors">{item.title}</p>
                    <p className="text-xs text-soft-lavender/40">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="w-full py-4 mt-8 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
            View All Activity
          </button>
        </motion.div>
      </div>
    </div>
  );
};

function GuideView({ setView }: { setView: (v: View) => void }) {
  const steps = [
    {
      title: "1. Create Meta Developer App",
      description: "Go to developers.facebook.com, create a 'Business' type app, and add the 'WhatsApp' product to it.",
      icon: Globe
    },
    {
      title: "2. Get API Credentials",
      description: "In your Meta App dashboard, go to WhatsApp > API Setup. Copy your 'Temporary Access Token' (or create a permanent one) and 'Phone Number ID'.",
      icon: Lock
    },
    {
      title: "3. Configure Techtaire",
      description: "Go to Settings in Techtaire and paste your Access Token and Phone Number ID. Click 'Save Configuration' to link your account.",
      icon: Settings
    },
    {
      title: "4. Manage Contacts & Batches",
      description: "In the Contacts tab, you can add individual students or upload an entire batch using Excel. Organize them into batches for targeted messaging.",
      icon: Users
    },
    {
      title: "5. Compose & Send",
      description: "Use the Messaging tab to write your message. You can select a specific batch or send to all contacts. Use AI Enhance for professional results.",
      icon: Send
    },
    {
      title: "6. Track Performance",
      description: "Monitor your campaign progress in the History tab. See delivery rates and manage previous campaign records.",
      icon: History
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-4xl font-black text-white mb-4">How Techtaire Works</h2>
        <p className="text-soft-lavender/60">Follow these simple steps to start scaling your student communication.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 space-y-6 group hover:border-amethyst/50 transition-all"
          >
            <div className="w-14 h-14 bg-amethyst/20 rounded-2xl flex items-center justify-center text-amethyst group-hover:scale-110 transition-transform">
              <step.icon size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">{step.title}</h3>
              <p className="text-soft-lavender/60 leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-10 bg-amethyst/5 border-amethyst/20">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <h3 className="text-2xl font-black text-white">Plan Restrictions & Limits</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-500/20 rounded-full text-emerald-400"><Check size={12} /></div>
                <p className="text-sm text-soft-lavender/80"><span className="text-white font-bold">Free Trial:</span> 1 minute of full access to explore the dashboard. Messaging is disabled after 1 minute.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-500/20 rounded-full text-emerald-400"><Check size={12} /></div>
                <p className="text-sm text-soft-lavender/80"><span className="text-white font-bold">Demo Plan (₹1):</span> Limited to 10 messages per campaign and 50 contacts total. Valid for 1 day.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 bg-emerald-500/20 rounded-full text-emerald-400"><Check size={12} /></div>
                <p className="text-sm text-soft-lavender/80"><span className="text-white font-bold">Premium Plans:</span> Unlimited messaging, advanced AI, and priority support.</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-64">
            <button onClick={() => setView('plans')} className="w-full btn-premium py-4">Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
