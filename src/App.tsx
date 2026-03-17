import React, { useState, useEffect, useRef, useMemo } from 'react';
import emailjs from '@emailjs/browser';
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
  Bot,
  FileSpreadsheet,
  ClipboardList,
  PenTool,
  Rocket,
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
  Lamp,
  Moon,
  Sun,
  Paperclip,
  SendHorizontal,
  Bell,
  Smile,
  MessageCircle
} from 'lucide-react';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { cn } from './lib/utils';
import { enhanceMessage } from './services/aiService';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { AIChatbot } from './components/AIChatbot';
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

const LEGAL_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    content: `TechTaire Message respects your privacy and is committed to protecting the information of users who access and use this website.

Information We Collect:
- Name or contact details if provided by the user
- Phone numbers used for sending messages
- Message content entered into the platform
- Device information such as browser type and operating system
- IP address and basic usage data

The collected information may be used to operate the messaging platform, improve functionality, prevent misuse, and maintain system security.

Our platform may use the WhatsApp Business API provided by Meta Platforms for messaging services.`
  },
  terms: {
    title: "Terms and Conditions",
    content: `- Users must use the platform only for legal and responsible purposes.
- Sending spam, abusive, or harmful content is prohibited.
- Users must not attempt to hack, damage, or disrupt the platform.
- We reserve the right to suspend users who violate these terms.
- The service is provided 'as is' without guarantees of uninterrupted operation.`
  },
  copyright: {
    title: "Copyright Notice",
    content: `© 2026 TechTaire Message – Trio Developers.
All Rights Reserved. All website content including code, design, graphics, and text are the intellectual property of TechTaire Message and Trio Developers.`
  },
  trade: {
    title: "Trade Terms and Conditions",
    content: `- The platform may be used for business or personal messaging purposes.
- Users must not promote illegal products or services.
- Fraudulent marketing or spam campaigns are prohibited.
- Users are responsible for the content they send through the platform.`
  },
  disclaimer: {
    title: "Disclaimer",
    content: `The information and services provided on this website are offered 'as is'. We do not guarantee uninterrupted or error-free operation.`
  },
  about: {
    title: "About Us",
    content: `Trio Developers is a small team focused on building modern web applications and digital tools such as TechTaire Message.

Instagram: https://www.instagram.com/trio_developers_?igsh=c3MxNjkyNjNjZ2Vr
Email: triodevelopers003@gmail.com
Mobile: +91 9551522030`
  }
};

const MESSAGE_TEMPLATES = [
  { id: 1, title: 'Welcome', content: "Hello! Welcome to our service. We're excited to have you on board. Feel free to reach out anytime!" },
  { id: 2, title: 'Offer', content: "🎉 Special Offer! Get 20% off on all our services today only. Limited time deal — don't miss out!" },
  { id: 3, title: 'Reminder', content: "Hi! This is a friendly reminder about your upcoming appointment. Please confirm your availability." },
  { id: 4, title: 'Follow Up', content: "Hello! Just following up on our previous conversation. Please let us know if you need any assistance." },
  { id: 5, title: 'Thank You', content: "Thank you for choosing us! Your trust means everything to us. We look forward to serving you again." },
  { id: 6, title: 'Order Confirmation', content: "Your order has been confirmed! 🎊 We will process it shortly and keep you updated on the status." },
  { id: 7, title: 'Payment Reminder', content: "Gentle reminder: Your payment is due soon. Please complete the payment to avoid any interruption." },
  { id: 8, title: 'Promotional', content: "🚀 Exciting news! We have launched new features just for you. Check it out and let us know your feedback!" },
];

// --- Components ---

const TechtaireLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06B6D4" />
        <stop offset="1" stopColor="#2DD4BF" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path 
      d="M50 5L93.3 30V80L50 105L6.7 80V30L50 5Z" 
      fill="url(#logo-grad)" 
      filter="url(#glow)"
      className="opacity-20"
    />
    <path 
      d="M50 15L80.3 32.5V72.5L50 90L19.7 72.5V32.5L50 15Z" 
      stroke="url(#logo-grad)" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      filter="url(#glow)"
    />
    <path 
      d="M50 35L63 42.5V57.5L50 65L37 57.5V42.5L50 35Z" 
      fill="url(#logo-grad)"
    />
  </svg>
);

const SplashScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <TechtaireLogo className="w-32 h-32 mb-6" />
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-4xl font-black text-white tracking-tighter mb-8"
        >
          TechTaire
        </motion.h1>
        
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 bg-amethyst"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-400" />,
    error: <AlertCircle size={18} className="text-red-400" />,
    info: <Clock size={18} className="text-blue-400" />,
    warning: <AlertCircle size={18} className="text-amber-400" />
  };

  const colors = {
    success: "border-emerald-500",
    error: "border-red-500",
    info: "border-blue-500",
    warning: "border-amber-500"
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className={cn(
        "flex items-center gap-3 px-6 py-4 bg-deep-night/90 backdrop-blur-xl border-l-4 rounded-r-2xl shadow-2xl min-w-[300px]",
        colors[type]
      )}
    >
      {icons[type]}
      <p className="text-sm font-bold text-white">{message}</p>
      <button onClick={onClose} className="ml-auto text-soft-lavender/40 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
};

const WelcomePopup = ({ userName, onStart }: { userName: string, onStart: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full glass-panel p-10 text-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-amethyst/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="w-20 h-20 bg-amethyst/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(153,102,204,0.3)]">
            <Sparkles size={40} className="text-amethyst" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4">Welcome to TechTaire, {userName}! 🎉</h2>
          <p className="text-soft-lavender/60 mb-10">
            We're glad to have you here. Start by adding your contacts!
          </p>
          <button 
            onClick={onStart}
            className="w-full btn-premium py-4 text-lg"
          >
            Get Started
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

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
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-deep-night flex flex-col items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          filter: ["blur(10px)", "blur(0px)"]
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        <div className="relative">
          <TechtaireLogo className="w-40 h-40 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]" />
          <motion.div 
            className="absolute inset-0 rounded-full bg-royal-purple/20 blur-3xl -z-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-12 text-center"
        >
          <h1 className="text-5xl font-black text-white tracking-tighter glow-text">Teachtaire</h1>
          <p className="text-soft-lavender/40 uppercase tracking-[0.3em] text-[10px] mt-2 font-black">WhatsApp Bulk Sender</p>
        </motion.div>
      </motion.div>
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

const LegalModal = ({ type, onClose }: { type: 'privacy' | 'terms' | 'copyright' | 'trade' | 'disclaimer' | 'about', onClose: () => void }) => {
  const content = LEGAL_CONTENT[type];
  
  const renderContent = () => {
    if (type === 'about') {
      return (
        <div className="space-y-6">
          <p>Trio Developers is a small team focused on building modern web applications and digital tools such as TechTaire Message.</p>
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold w-20">Instagram:</span>
              <a 
                href="https://www.instagram.com/trio_developers_?igsh=c3MxNjkyNjNjZ2Vr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-amethyst hover:underline"
              >
                @trio_developers_
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-bold w-20">Email:</span>
              <a href="mailto:triodevelopers003@gmail.com" className="text-amethyst hover:underline">
                triodevelopers003@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-bold w-20">Mobile:</span>
              <a href="tel:+919551522030" className="text-amethyst hover:underline">
                +91 9551522030
              </a>
            </div>
          </div>
        </div>
      );
    }
    return <div className="whitespace-pre-wrap">{content.content}</div>;
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl glass-panel p-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-royal-purple via-amethyst to-royal-purple" />
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl text-soft-lavender/40 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <h3 className="text-3xl font-black text-white tracking-tight mb-8">{content.title}</h3>
        <div className="text-soft-lavender/60 leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
          {renderContent()}
        </div>
      </motion.div>
    </div>
  );
};

const Footer = ({ onOpenModal }: { onOpenModal: (type: 'privacy' | 'terms' | 'copyright' | 'trade' | 'disclaimer' | 'about') => void }) => {
  return (
    <footer className="fixed bottom-4 right-4 z-[60] flex items-center gap-6 px-6 py-2 pointer-events-auto">
      <button 
        onClick={() => onOpenModal('privacy')}
        className="text-[10px] font-bold text-soft-lavender/40 hover:text-white transition-colors uppercase tracking-widest"
      >
        Privacy Policy
      </button>
      <button 
        onClick={() => onOpenModal('terms')}
        className="text-[10px] font-bold text-soft-lavender/40 hover:text-white transition-colors uppercase tracking-widest"
      >
        Terms & Conditions
      </button>
      <button 
        onClick={() => onOpenModal('copyright')}
        className="text-[10px] font-bold text-soft-lavender/40 hover:text-white transition-colors uppercase tracking-widest"
      >
        Copyright Notice
      </button>
    </footer>
  );
};

const PricingCard = ({ plan, isPremium = false, onSelect, buttonText = "Select Plan" }: { plan: any, isPremium?: boolean, onSelect: (plan: any) => void, buttonText?: string, key?: any }) => {
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
        {buttonText}
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

  useEffect(() => {
    localStorage.setItem('techtaire_active_view', view);
  }, [view]);

  useEffect(() => {
    document.title = "Techtaire";
    emailjs.init("TnTWjrOj2IKmPB-LV");
  }, []);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [logoClicks, setLogoClicks] = useState(0);
  const isAdmin = user?.email === 'prajwalnawale3040@gmail.com';
  const isExpired = profile?.plan === 'free_trial' && profile?.trial_expiry && new Date(profile.trial_expiry) < new Date();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'error' | 'info' | 'warning' }[]>([]);
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | 'copyright' | null>(null);

  const showNotify = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && !loading) {
      const hasSeenWelcome = localStorage.getItem(`welcome_${user.id}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [user, loading]);

  const handleWelcomeStart = () => {
    if (user) {
      localStorage.setItem(`welcome_${user.id}`, 'true');
    }
    setShowWelcome(false);
  };

  const handlePayment = async (plan: any) => {
    if (!user) {
      setView('login');
      return;
    }
    if (plan.amount === 0) {
      if (profile?.plan === 'free_trial') {
        showNotify("You are already on the Free Trial plan.", "info");
        return;
      }
      if (confirm("Activate 1-Minute Free Trial? This is a demo plan to explore features.")) {
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
              plan_id: selectedPlan.name.toLowerCase().replace(' ', '_'),
              amount: selectedPlan.amount,
              currency: 'INR',
              payment_status: 'completed',
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
        // Always start at landing page as per user request
        setView('landing');
        setLoading(false);
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
        // Only switch to landing if we are not already there
        // This avoids resetting the view if the user is just browsing the landing page
      } else {
        // Only switch to dashboard if it's an explicit SIGNED_IN event from the login page
        // We check localStorage to see if we were in the middle of a login process
        const isLoggingIn = localStorage.getItem('techtaire_logging_in') === 'true';
        if (event === 'SIGNED_IN' && isLoggingIn) {
          setView('dashboard');
          localStorage.removeItem('techtaire_logging_in');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLegalModal(null);
        setShowPaymentModal(false);
        setLogoClicks(0);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      } else if (!error || error.code === 'PGRST116') {
        const trialExpiry = new Date();
        trialExpiry.setMinutes(trialExpiry.getMinutes() + 1);
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id, 
            email: user.email, 
            plan: 'free_trial', 
            credits: 100,
            trial_expiry: trialExpiry.toISOString(),
            created_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (newProfile) setProfile(newProfile);
        if (insertError) console.error("Profile creation error:", insertError);
      }
    } catch (err) {
      console.error("Unexpected error in fetchProfile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();

      // Subscribe to profile changes
      const profileSubscription = supabase
        .channel(`profile:${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          console.log('Profile updated real-time:', payload.new);
          setProfile(payload.new);
        })
        .subscribe();

      return () => {
        profileSubscription.unsubscribe();
      };
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
  trial_expiry TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  whatsapp_api_key TEXT,
  whatsapp_phone_number_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

  return (
    <div className="min-h-screen bg-deep-night text-soft-lavender font-sans selection:bg-royal-purple/30">
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      <AnimatePresence>
        {showWelcome && user && (
          <WelcomePopup 
            userName={profile?.email?.split('@')[0] || user.email.split('@')[0]} 
            onStart={handleWelcomeStart} 
          />
        )}
      </AnimatePresence>

      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast 
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <CustomCursor />
      <Particles />
      
      {/* Scroll Progress */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-purple to-amethyst z-[100] origin-left"
        style={{ scaleX }}
      />

      {view === 'landing' ? (
        <LandingPage setView={setView} user={user} setLegalModal={setLegalModal} />
      ) : view === 'login' ? (
        <LoginPage setView={setView} />
      ) : (
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className={cn(
            "fixed left-0 top-0 h-full bg-deep-night/80 backdrop-blur-xl border-r border-white/5 transition-all duration-500 z-50",
            isSidebarOpen ? "w-72" : "w-24"
          )}>
            <div className="p-8 flex items-center justify-center mb-12">
              <TechtaireLogo className="w-12 h-12" />
            </div>

            <nav className="px-6 space-y-3">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} isOpen={isSidebarOpen} />
              <SidebarItem icon={Users} label="Contacts" active={view === 'contacts'} onClick={() => setView('contacts')} isOpen={isSidebarOpen} disabled={isExpired} />
              <SidebarItem icon={SendHorizontal} label="Messaging" active={view === 'messaging'} onClick={() => setView('messaging')} isOpen={isSidebarOpen} disabled={isExpired} />
              <SidebarItem icon={History} label="History" active={view === 'history'} onClick={() => setView('history')} isOpen={isSidebarOpen} disabled={isExpired} />
              <SidebarItem icon={Lamp as any} label="Guide" active={view === 'guide'} onClick={() => setView('guide')} isOpen={isSidebarOpen} />
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
                  {view === 'contacts' && <ContactsView user={user} showNotify={showNotify} />}
                  {view === 'messaging' && <MessagingView profile={profile} user={user} showNotify={showNotify} />}
                  {view === 'history' && <HistoryView user={user} showNotify={showNotify} />}
                  {view === 'guide' && <GuideView setView={setView} />}
                  {view === 'plans' && <PricingPage setView={setView} isDashboard onSelect={handlePayment} currentPlan={profile?.plan} />}
                  {view === 'settings' && <SettingsView profile={profile} onUpdate={fetchProfile} onOpenModal={(type) => setLegalModal(type)} showNotify={showNotify} />}
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
      {user && <AIChatbot />}

      <Footer onOpenModal={(type) => setLegalModal(type)} />

      <AnimatePresence>
        {legalModal && (
          <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
        )}
      </AnimatePresence>
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

const FeedbackModal = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      await emailjs.send("service_ayw8b3e", "template_xd2qfba", {
        name: name,
        title: category,
        message: message,
        email: email
      }, "TnTWjrOj2IKmPB-LV");
      
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-panel w-full max-w-md p-8 relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-soft-lavender/40 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-royal-purple/10 rounded-2xl flex items-center justify-center text-royal-purple">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">We'd Love to Hear From You! 💬</h3>
            <p className="text-sm text-soft-lavender/40">Share your suggestions, issues, or comments</p>
          </div>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Thank you!</h4>
            <p className="text-soft-lavender/60">Your feedback has been sent! ✅</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Name</label>
              <input 
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-royal-purple/50 focus:bg-white/10 transition-all outline-none"
                placeholder="Your Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Email</label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-royal-purple/50 focus:bg-white/10 transition-all outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-royal-purple/50 focus:bg-white/10 transition-all outline-none appearance-none"
              >
                <option value="Suggestion">Suggestion</option>
                <option value="Issue">Issue</option>
                <option value="Comment">Comment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Message</label>
                <span className={cn(
                  "text-[10px] font-bold",
                  message.length > 450 ? "text-amber-500" : "text-soft-lavender/20"
                )}>
                  {message.length}/500
                </span>
              </div>
              <textarea 
                required
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-royal-purple/50 focus:bg-white/10 transition-all outline-none resize-none"
                placeholder="Tell us what's on your mind..."
              />
            </div>

            {status === 'error' && (
              <p className="text-xs font-bold text-rose-500 text-center">
                Something went wrong. Please try again. ❌
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-royal-purple text-white rounded-2xl font-black text-lg hover:shadow-[0_0_30px_rgba(93,63,211,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

const LandingPage = ({ setView, user, setLegalModal }: { setView: (v: View) => void, user: any, setLegalModal: (m: 'privacy' | 'terms' | 'copyright' | null) => void }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const plans = [
    { 
      name: 'Demo Plan', 
      price: 'Free', 
      amount: 0, 
      features: ['1 Day Access', 'Demo Messaging', 'Basic AI Assistant', 'Limited Contacts'], 
      isDemo: true,
      description: 'Perfect for exploring our platform features.'
    },
    { 
      name: 'Professional', 
      price: '2,999', 
      amount: 2999, 
      features: ['Unlimited Messages', 'AI Enhancement', 'Priority Support', 'File Attachments', 'Advanced Analytics'],
      isPopular: true,
      description: 'The complete solution for growing businesses.'
    },
    { 
      name: 'Enterprise', 
      price: '17,999', 
      amount: 17999, 
      features: ['Everything in Professional', '2 Months Free', 'Dedicated Account Manager', 'Custom API Integration', 'White Label Reports'],
      description: 'Scale without limits with enterprise-grade power.'
    }
  ];

  const features = [
    { icon: Zap, title: "Bulk Messaging", desc: "Send messages to hundreds of contacts in one click" },
    { icon: Bot, title: "AI Enhanced", desc: "Use AI to craft perfect messages for your audience" },
    { icon: BarChart3, title: "Analytics", desc: "Track delivery rates and campaign performance" },
    { icon: Calendar, title: "Scheduled Messages", desc: "Schedule campaigns for the perfect time" },
    { icon: FileSpreadsheet, title: "Excel Import", desc: "Import contacts directly from Excel or CSV files" },
    { icon: ShieldCheck, title: "Secure & Private", desc: "Your data is safe and encrypted at all times" }
  ];

  const steps = [
    { icon: ClipboardList, title: "Add Contacts", desc: "Import or manually add your contacts" },
    { icon: PenTool, title: "Compose Message", desc: "Write or AI-generate your message" },
    { icon: Rocket, title: "Send Campaign", desc: "Send to all contacts instantly" }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    if (user) {
      setView('dashboard');
    } else {
      localStorage.setItem('techtaire_logging_in', 'true');
      setView('login');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-royal-purple/30 relative">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-royal-purple z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TechtaireLogo className="w-10 h-10" />
          <span className="text-xl font-black tracking-tighter">TechTaire</span>
        </div>
        <button 
          onClick={() => setView('login')}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all"
        >
          Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-royal-purple/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amethyst/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.1]"
          >
            TechTaire WhatsApp<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-purple to-amethyst">Bulk Messaging Tool</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-soft-lavender/60 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            The smartest way to send bulk WhatsApp messages to your contacts. Fast, reliable and AI powered.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={handleGetStarted}
              className="w-full md:w-auto px-12 py-5 bg-royal-purple text-white rounded-2xl font-black text-lg hover:shadow-[0_0_40px_rgba(93,63,211,0.4)] transition-all active:scale-95"
            >
              Get Started
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="w-full md:w-auto px-12 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-lg hover:bg-white/10 transition-all active:scale-95"
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Why Choose TechTaire?</h2>
            <div className="w-24 h-1.5 bg-royal-purple mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 group hover:border-royal-purple/30 transition-all"
              >
                <div className="w-16 h-16 bg-royal-purple/10 rounded-2xl flex items-center justify-center text-royal-purple mb-6 group-hover:scale-110 transition-transform">
                  <f.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-soft-lavender/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">How It Works</h2>
            <div className="w-24 h-1.5 bg-royal-purple mx-auto rounded-full" />
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="flex-1 flex flex-col items-center text-center max-w-sm"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-royal-purple to-amethyst rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-royal-purple/20">
                    <s.icon size={40} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{s.title}</h3>
                  <p className="text-soft-lavender/60 text-lg">{s.desc}</p>
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block text-royal-purple/20">
                    <ArrowRight size={48} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Simple Pricing</h2>
            <div className="w-24 h-1.5 bg-royal-purple mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <PricingCard 
                key={i}
                plan={plan}
                isPremium={plan.name === 'Enterprise'}
                buttonText="Get Started"
                onSelect={handleGetStarted}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">We'd Love to Hear From You! 💬</h2>
            <p className="text-xl text-soft-lavender/60 mb-12">Share your suggestions, issues, or comments with us</p>
            <button 
              onClick={() => setShowFeedback(true)}
              className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              Send Feedback
            </button>
          </motion.div>
        </div>
      </section>

      {/* Floating Feedback Button */}
      <motion.button 
        onClick={() => setShowFeedback(true)}
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-10 right-10 z-[100] w-16 h-16 bg-royal-purple text-white rounded-full flex items-center justify-center shadow-2xl shadow-royal-purple/40 group overflow-hidden"
      >
        <motion.div
          animate={{ 
            y: [0, -8, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <MessageCircle size={28} />
        </motion.div>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 px-4 py-2 bg-white text-black text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
          Send us your feedback!
        </div>
      </motion.button>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <TechtaireLogo className="w-10 h-10" />
              <span className="text-xl font-black tracking-tighter">TechTaire</span>
            </div>
            
            <p className="text-soft-lavender/40 text-center md:text-left">
              © 2026 TechTaire Message – Trio Developers. All Rights Reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-soft-lavender/60">
              <button onClick={() => setLegalModal('privacy')} className="hover:text-royal-purple transition-colors">Privacy Policy</button>
              <button onClick={() => setLegalModal('terms')} className="hover:text-royal-purple transition-colors">Terms & Conditions</button>
              <button onClick={() => setLegalModal('copyright')} className="hover:text-royal-purple transition-colors">Copyright Notice</button>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showFeedback && (
          <FeedbackModal onClose={() => setShowFeedback(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const LoginPage = ({ setView }: { setView: (v: View) => void }) => {
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setView('dashboard');
      }
    };
    checkUser();
  }, [setView]);

  const [isFocused, setIsFocused] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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
  trial_expiry TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  whatsapp_api_key TEXT,
  whatsapp_phone_number_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- 4. Create Login Logs Table
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  email TEXT,
  browser TEXT,
  ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own login logs" ON login_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own login logs" ON login_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (auth.jwt() ->> 'email' = 'prajwalnawale3040@gmail.com');
      `;
      console.log(sql);
      alert("SQL Setup commands have been logged to the console. Please run them in your Supabase SQL Editor.");
      setLogoClicks(0);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      if (isResettingPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        
        // Send custom reset email via our SMTP as well
        try {
          await axios.post('/api/email/send', {
            to: email,
            type: 'password_reset',
            data: {
              resetLink: `${window.location.origin}/reset-password`
            }
          });
        } catch (e) {
          console.error("Failed to send custom reset email", e);
        }

        alert("Password reset link sent to your email!");
        setIsResettingPassword(false);
        return;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Send welcome email using EmailJS
        if (data.user) {
          try {
            emailjs.send("service_ayw8b3e", "template_r5ujyud", {
              to_email: email,
              to_name: email.split('@')[0],
              app_name: "TechTaire"
            }, "TnTWjrOj2IKmPB-LV");
          } catch (e) {
            console.error("Failed to send welcome email via EmailJS", e);
          }

          // Also keep the existing backend welcome email if desired, 
          // but the user specifically asked for EmailJS.
          // I'll replace the existing one to avoid double emails if they are the same purpose.
          // Actually, I'll just add it as requested.
        }

        alert("Check your email for the confirmation link!");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Send login alert email and log login
        if (data.user) {
          const browserInfo = navigator.userAgent;
          const loginTime = new Date().toLocaleString();

          try {
            // Log to database
            await supabase.from('login_logs').insert({
              user_id: data.user.id,
              email: data.user.email,
              browser: browserInfo,
              ip: 'Client-side'
            });

            // Send email
            await axios.post('/api/email/send', {
              to: email,
              type: 'login_alert',
              data: {
                time: loginTime,
                browser: browserInfo,
                ip: 'Detected'
              }
            });
          } catch (e) {
            console.error("Failed to log login or send alert email", e);
          }
        }

        // The onAuthStateChange listener in App will handle the view change, 
        // but we set it here as well for immediate feedback.
        if (data.session || data.user) {
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
      
      {/* Back to Home Button */}
      <button 
        onClick={() => setView('landing')}
        className="absolute top-10 left-10 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-soft-lavender/60 hover:text-white transition-all z-50"
      >
        <ArrowLeft size={18} />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
      </button>
      
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
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Password</label>
                  {!isSignUp && !isResettingPassword && (
                    <button 
                      type="button"
                      onClick={() => setIsResettingPassword(true)}
                      className="text-[10px] font-black text-amethyst uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
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
                    <span>{isResettingPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5 flex flex-col gap-4 text-center">
              <p className="text-sm text-soft-lavender/40">
                {isSignUp ? 'Already have an account?' : isResettingPassword ? 'Remember your password?' : "Don't have an account?"} 
                <button 
                  onClick={() => {
                    if (isResettingPassword) {
                      setIsResettingPassword(false);
                    } else {
                      setIsSignUp(!isSignUp);
                    }
                  }}
                  className="text-amethyst font-bold cursor-pointer hover:underline ml-1"
                >
                  {isSignUp ? 'Sign In' : isResettingPassword ? 'Back to Login' : 'Create one now'}
                </button>
              </p>
              {!isResettingPassword && (
                <button 
                  onClick={() => setView('landing')}
                  className="text-xs text-soft-lavender/20 hover:text-soft-lavender/40 transition-colors"
                >
                  Back to Home
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const PricingPage = ({ setView, isDashboard = false, onSelect, currentPlan }: { setView: (v: View) => void, isDashboard?: boolean, onSelect: (plan: any) => void, currentPlan?: string }) => {
  const plans = [
    { 
      name: 'Demo Plan', 
      price: 'Free', 
      amount: 0, 
      features: ['1 Day Access', 'Demo Messaging', 'Basic AI Assistant', 'Limited Contacts'], 
      isDemo: true,
      description: 'Perfect for exploring our platform features.'
    },
    { 
      name: 'Professional', 
      price: '2,999', 
      amount: 2999, 
      features: ['Unlimited Messages', 'AI Enhancement', 'Priority Support', 'File Attachments', 'Advanced Analytics'],
      isPopular: true,
      description: 'The complete solution for growing businesses.'
    },
    { 
      name: 'Enterprise', 
      price: '17,999', 
      amount: 17999, 
      features: ['Everything in Professional', '2 Months Free', 'Dedicated Account Manager', 'Custom API Integration', 'White Label Reports'],
      description: 'Scale without limits with enterprise-grade power.'
    }
  ];

  const isCurrent = (plan: any) => {
    if (plan.amount === 0 && currentPlan === 'free_trial') return true;
    if (currentPlan === plan.name.toLowerCase().replace(' ', '_')) return true;
    return false;
  };

  return (
    <section className={cn("py-32 px-10 relative", isDashboard ? "py-0 px-0" : "")}>
      <div className="max-w-7xl mx-auto">
        {!isDashboard && (
          <div className="text-center mb-20">
            <h2 className="text-6xl font-black text-white mb-6 tracking-tight">Modern Pricing</h2>
            <p className="text-soft-lavender/60 max-w-2xl mx-auto text-lg">Choose the perfect plan for your business growth. Scale your messaging with confidence.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={cn(
                "glass-panel p-10 flex flex-col gap-8 relative group transition-all duration-500",
                plan.isPopular ? "border-amethyst/50 shadow-[0_20px_50px_rgba(155,89,182,0.15)] scale-105 z-10" : "hover:border-white/20"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amethyst text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                <p className="text-sm text-soft-lavender/40">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">₹{plan.price}</span>
                {plan.amount > 0 && <span className="text-soft-lavender/40 text-sm">/month</span>}
              </div>

              <div className="space-y-4 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm text-soft-lavender/80">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Check size={12} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onSelect(plan)}
                disabled={isCurrent(plan)}
                className={cn(
                  "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300",
                  isCurrent(plan) ? "bg-emerald-500/20 text-emerald-400 cursor-default" :
                  plan.isPopular ? "bg-amethyst text-white shadow-lg shadow-amethyst/20 hover:bg-amethyst/80" : "bg-white/5 text-white hover:bg-white/10"
                )}
              >
                {isCurrent(plan) ? 'Current Plan' : plan.amount === 0 ? 'Start Free' : 'Get Started'}
              </button>
            </motion.div>
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

function ContactsView({ user, showNotify }: { user: any, showNotify: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isBatch, setIsBatch] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [newContact, setNewContact] = useState({ name: '', whatsapp_number: '', batch: '', course: '', tags: '' });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;
    setLoading(true);
    
    // Try to load from Supabase
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      setContacts(data);
      localStorage.setItem(`techtaire_contacts_${user.id}`, JSON.stringify(data));
    } else {
      // Fallback to localStorage
      const saved = localStorage.getItem(`techtaire_contacts_${user.id}`);
      if (saved) {
        setContacts(JSON.parse(saved));
      }
    }
    setLoading(false);
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.whatsapp_number?.includes(searchTerm) ||
                             c.batch?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTag = selectedTag === 'all' || (c.tags && c.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [contacts, searchTerm, selectedTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contacts.forEach(c => {
      if (c.tags) {
        c.tags.split(',').forEach((t: string) => tags.add(t.trim()));
      }
    });
    return Array.from(tags);
  }, [contacts]);

  const detectDuplicates = (numbers: string[]) => {
    const existingNumbers = new Set(contacts.map(c => c.whatsapp_number));
    return numbers.filter(n => existingNumbers.has(n));
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
          course: newContact.course,
          tags: newContact.tags
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

      const duplicates = detectDuplicates(numbers);
      if (duplicates.length > 0) {
        if (!confirm(`${duplicates.length} numbers already exist. Do you want to skip them and add the rest?`)) return;
      }

      const finalNumbers = numbers.filter(n => !duplicates.includes(n));
      if (finalNumbers.length === 0) {
        alert("All numbers are already in your contacts.");
        return;
      }

      const contactsToInsert = finalNumbers.map(num => ({
        user_id: user.id,
        name: newContact.name || 'Student',
        whatsapp_number: num,
        batch: newContact.batch || 'Batch',
        course: newContact.course,
        tags: newContact.tags,
        status: 'active'
      }));

      const { error } = await supabase.from('contacts').insert(contactsToInsert);
      if (error) {
        console.error("Add Batch Error:", error);
        showNotify(error.message, "error");
      } else {
        showNotify("✅ Contact batch added successfully!", "success");
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
        showNotify(error.message, "error");
      } else {
        showNotify("✅ Contact added successfully!", "success");
        setShowAddModal(false);
        setNewContact({ name: '', whatsapp_number: '', batch: '', course: '' });
        fetchContacts();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const processData = async (data: any[]) => {
      if (data.length === 0) {
        showNotify("No data found in file.", "error");
        return;
      }

      const formattedData = data.map((row: any) => {
        // Auto-detect columns
        const keys = Object.keys(row);
        const nameKey = keys.find(k => /name|student|full.*name|contact.*person/i.test(k));
        const phoneKey = keys.find(k => /phone|number|mobile|contact|whatsapp/i.test(k));
        const batchKey = keys.find(k => /batch|class|group|section/i.test(k));
        const courseKey = keys.find(k => /course|subject|program/i.test(k));

        const name = nameKey ? row[nameKey] : 'Unknown';
        const rawNumber = phoneKey ? row[phoneKey] : '';
        const whatsapp_number = String(rawNumber).replace(/\D/g, '');
        const batch = batchKey ? row[batchKey] : '';
        const course = courseKey ? row[courseKey] : '';

        return {
          user_id: user.id,
          name: String(name).trim(),
          whatsapp_number,
          batch: String(batch).trim(),
          course: String(course).trim(),
          status: 'active'
        };
      }).filter(c => c.whatsapp_number && c.whatsapp_number.length >= 10);

      if (formattedData.length === 0) {
        showNotify("Invalid file format. Please ensure the file has Name and Phone Number columns.", "error");
        return;
      }

      try {
        const { error } = await supabase.from('contacts').insert(formattedData);
        if (error) throw error;
        
        // Update local state and storage
        const updatedContacts = [...formattedData, ...contacts];
        setContacts(updatedContacts);
        localStorage.setItem(`techtaire_contacts_${user.id}`, JSON.stringify(updatedContacts));
        
        showNotify(`✅ ${formattedData.length} contacts imported successfully!`, "success");
        fetchContacts();
      } catch (err: any) {
        showNotify("Import Error: " + err.message, "error");
      }
    };

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data);
        },
        error: (err) => {
          showNotify("Failed to parse CSV file: " + err.message, "error");
        }
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const dataBuffer = evt.target?.result;
          const wb = XLSX.read(dataBuffer, { type: 'array' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          processData(data);
        } catch (err: any) {
          showNotify("Failed to parse Excel file.", "error");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      showNotify("Invalid file format. Please use Excel or CSV file.", "error");
    }
    
    // Reset input
    e.target.value = '';
  };

  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete ALL contacts? This cannot be undone.")) return;
    const { error } = await supabase.from('contacts').delete().eq('user_id', user.id);
    if (error) showNotify(error.message, "error");
    else {
      showNotify("🗑️ All contacts deleted.", "warning");
      fetchContacts();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
        <div className="flex flex-1 gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-lavender/20" size={18} />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-amethyst transition-all"
            />
          </div>
          <select 
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-amethyst transition-all text-sm"
          >
            <option value="all">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
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
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white tracking-tight">
                {isBatch ? 'Add New Batch' : 'Add New Contact'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-soft-lavender/40 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>
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
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={newContact.tags}
                      onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
                      placeholder="e.g. VIP, Student"
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
                  <div className="space-y-2">
                    <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={newContact.tags}
                      onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
                      placeholder="e.g. VIP, Student"
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

function MessagingView({ profile, user, showNotify }: { profile: any, user: any, showNotify: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [message, setMessage] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [contactCount, setContactCount] = useState(0);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState('');
  const [sendingProgress, setSendingProgress] = useState('');

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/ai/generate-template', { prompt: aiPrompt });
      setGeneratedTemplate(response.data.template);
    } catch (error: any) {
      showNotify("Failed to generate. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTemplates(false);
        setShowEmojiPicker(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const [batches, setBatches] = useState<string[]>([]);

  const isExpired = profile?.plan === 'free_trial' && profile?.trial_expiry && new Date(profile.trial_expiry) < new Date();
  
  const charCount = message.length;
  const maxChars = 4096;
  const isWarning = charCount >= 3500 && charCount < 4000;
  const isDanger = charCount >= 4000;
  
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
      if (enhanced === message) {
        showNotify("AI could not enhance the message. Check your API key.", "error");
      } else {
        setMessage(enhanced);
        showNotify("Message enhanced successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showNotify("AI Enhancement failed.", "error");
    } finally {
      setIsEnhancing(false);
    }
  };

  const cleanPhoneNumber = (num: string) => {
    return num.replace(/\D/g, ''); // Remove all non-digits
  };

  const handleSend = async () => {
    if (isExpired) {
      alert("Your free trial has expired. Please upgrade to continue.");
      return;
    }
    if (!message && !attachment) return;
    if (!user) return;
    
    const ultramsgSaved = localStorage.getItem('techtaire_ultramsg_config');
    const ultramsg = ultramsgSaved ? JSON.parse(ultramsgSaved) : null;
    const hasUltra = ultramsg && ultramsg.url && ultramsg.token;

    const serverSaved = localStorage.getItem('techtaire_server_config');
    const isConnected = localStorage.getItem('techtaire_whatsapp_connected') === 'true';
    const server = serverSaved ? JSON.parse(serverSaved) : { url: 'https://techtaire-server-production.up.railway.app' };
    const hasServer = server && server.url && isConnected;

    if (!hasServer && !hasUltra && (!profile.whatsapp_api_key || !profile.whatsapp_phone_number_id)) {
      alert("Please configure WhatsApp Server or API settings first");
      return;
    }

    setSending(true);
    setSendingProgress('');
    try {
      if (isScheduled) {
        if (!scheduleDate || !scheduleTime) {
          alert("Please select both date and time for scheduling.");
          setSending(false);
          return;
        }

        const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
        if (scheduledAt < new Date()) {
          alert("Please select a future date and time");
          setSending(false);
          return;
        }

        await supabase.from('campaigns').insert([{
          user_id: user.id,
          name: `Scheduled Campaign ${new Date().toLocaleString()}`,
          message,
          status: 'scheduled',
          scheduled_at: scheduledAt.toISOString(),
          batch: selectedBatch,
          attachment_url: attachmentPreview,
          total_messages: contactCount,
          sent_messages: 0
        }]);

        showNotify(`🕐 Campaign scheduled for ${new Date(scheduleDate).toLocaleDateString()} at ${scheduleTime}`, "info");
        setMessage('');
        setAttachment(null);
        setAttachmentPreview(null);
        setIsScheduled(false);
        setScheduleDate('');
        setScheduleTime('');
        setSending(false);
        return;
      }

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
      if (profile.plan === 'free_trial') {
        if (contacts.length > 50) {
          alert("Free trial is limited to 50 contacts. Only first 50 will be processed.");
          contactsToSend = contacts.slice(0, 50);
        }
      }

      const maxMessages = profile.plan === 'free_trial' ? 10 : Infinity;
      if (profile.plan === 'free_trial') {
        alert("Free trial is limited to 10 messages total per campaign.");
      }

      // 2. Send messages
      let successCount = 0;
      let failCount = 0;
      let errorMessages: string[] = [];

      for (let i = 0; i < contactsToSend.length; i++) {
        if (successCount + failCount >= maxMessages) break;
        
        setSendingProgress(`Sending ${i + 1}/${contactsToSend.length}...`);
        
        const contact = contactsToSend[i];
        const cleanNumber = cleanPhoneNumber(contact.whatsapp_number);
        
        // Skip empty numbers
        if (!cleanNumber) {
          console.warn(`Skipping contact with empty WhatsApp number: ${contact.name}`);
          continue;
        }

        try {
          if (hasServer) {
            await axios.post('/api/whatsapp-server/send', {
              url: server.url,
              phone: cleanNumber,
              message: message
            });
          } else if (hasUltra) {
            const params = new URLSearchParams();
            params.append('token', ultramsg.token);
            params.append('to', cleanNumber);
            params.append('body', message);
            
            await axios.post(`${ultramsg.url}messages/chat`, params, {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
          } else {
            await axios.post('/api/whatsapp/send', {
              to: cleanNumber,
              message,
              apiKey: profile.whatsapp_api_key,
              phoneNumberId: profile.whatsapp_phone_number_id,
              attachmentUrl: attachmentPreview
            });
          }
          successCount++;
        } catch (e: any) {
          failCount++;
          const status = e.response?.status;
          const errorData = e.response?.data;
          let msg = errorData?.error?.message || errorData?.message || e.message;
          
          console.error(`Messaging Error for ${cleanNumber}:`, errorData || e.message);
          
          if (!errorMessages.includes(msg)) {
            errorMessages.push(msg);
          }
        }
      }

      // 3. Log campaign
      await supabase.from('campaigns').insert([{
        user_id: user.id,
        name: `Campaign ${new Date().toLocaleString()}`,
        message,
        status: failCount === 0 ? 'completed' : 'partially_completed',
        total_messages: contactsToSend.length,
        sent_messages: successCount
      }]);

      if (successCount > 0) {
        showNotify("Campaign sent successfully!", "success");
      }
      
      if (failCount > 0) {
        showNotify(`❌ Failed to send to ${failCount} contacts`, "error");
      }

      setMessage('');
      setAttachment(null);
      setAttachmentPreview(null);
      setSendingProgress('');
    } catch (error: any) {
      alert("Failed to start campaign: " + error.message);
    } finally {
      setSending(false);
      setSendingProgress('');
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
              <p className="text-sm text-soft-lavender/60">Your 1-minute trial has ended. Please upgrade to a paid plan to continue messaging.</p>
            </div>
          </div>
        )}

        <div className="glass-panel p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-white tracking-tight">Compose Message</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowTemplates(true)}
                disabled={isExpired}
                className="flex items-center gap-2 text-xs font-black text-soft-lavender uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
              >
                <Sparkles size={14} className="text-amethyst" />
                <span>Templates</span>
              </button>
              <button 
                onClick={handleEnhance}
                disabled={isEnhancing || !message || isExpired}
                className="flex items-center gap-2 text-xs font-black text-amethyst uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
              >
                <Sparkles size={14} className={isEnhancing ? "animate-pulse" : ""} />
                <span>{isEnhancing ? "Enhancing..." : "AI Enhance"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
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
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-soft-lavender/40 uppercase tracking-widest">Schedule Campaign</label>
                <div className="flex items-center gap-3 h-[46px] bg-white/5 border border-white/10 rounded-xl px-4">
                  <input 
                    type="checkbox" 
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-amethyst focus:ring-amethyst"
                  />
                  <span className="text-sm text-soft-lavender/60">Schedule for later</span>
                </div>
              </div>
            </div>

            {isScheduled && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-2 gap-4 pt-2"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-soft-lavender/40 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-amethyst" />
                    Date
                  </label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amethyst transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-soft-lavender/40 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} className="text-amethyst" />
                    Time
                  </label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-amethyst transition-all"
                  />
                </div>
              </motion.div>
            )}

            <div className="relative">
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                disabled={isExpired}
                placeholder="Type your message here..."
                className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-amethyst transition-all resize-none disabled:opacity-50"
              />
              <div className={cn(
                "absolute bottom-4 right-4 text-[10px] font-black transition-colors",
                isDanger ? "text-red-500" : isWarning ? "text-amber-500" : "text-soft-lavender/40"
              )}>
                {charCount} / {maxChars}
              </div>
            </div>
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
                <div className="relative">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    disabled={isExpired}
                    className="p-3 bg-white/5 rounded-xl text-soft-lavender/40 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Smile size={20} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-4 z-50">
                      <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                      <div className="relative">
                        <EmojiPicker 
                          onEmojiClick={onEmojiClick} 
                          theme={EmojiTheme.DARK}
                          width={300}
                          height={400}
                        />
                      </div>
                    </div>
                  )}
                </div>
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
              <span>{sending ? (sendingProgress || "Sending...") : "Send Campaign"}</span>
            </button>
          </div>
          
          {profile.plan === 'free_trial' && (
            <p className="text-[10px] text-amethyst font-black uppercase tracking-widest text-center">
              Free Trial Active: 10 Messages / 50 Contacts Limit
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

      <AnimatePresence>
        {showTemplates && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setShowTemplates(false); setShowAiChat(false); }} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-panel p-10 max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-black text-white tracking-tight">Message Templates</h3>
                  <button 
                    onClick={() => setShowAiChat(!showAiChat)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      showAiChat ? "bg-amethyst text-white shadow-[0_0_20px_rgba(153,102,255,0.4)]" : "bg-white/5 text-soft-lavender hover:bg-white/10"
                    )}
                  >
                    <Sparkles size={14} />
                    <span>AI Generate Template</span>
                  </button>
                </div>
                <button onClick={() => { setShowTemplates(false); setShowAiChat(false); }} className="p-2 hover:bg-white/10 rounded-xl text-soft-lavender/40 hover:text-white transition-all">
                  <X size={24} />
                </button>
              </div>

              {showAiChat && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-8 p-6 bg-royal-purple/5 border border-royal-purple/20 rounded-2xl space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-royal-purple/10 blur-3xl rounded-full -mr-16 -mt-16" />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amethyst uppercase tracking-widest">AI Template Generator</label>
                      <div className="flex gap-3">
                        <input 
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Describe your template... e.g. Write a festival offer message for my clothing store"
                          className="flex-1 bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white outline-none focus:border-amethyst transition-all text-sm"
                        />
                        <button 
                          onClick={handleAiGenerate}
                          disabled={isGenerating || !aiPrompt}
                          className="px-6 py-3 bg-royal-purple text-white rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(93,63,211,0.4)] transition-all disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Zap size={16} />
                              <span>Generate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {generatedTemplate && !isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="p-4 bg-black/60 border border-white/5 rounded-xl text-sm text-soft-lavender leading-relaxed whitespace-pre-wrap">
                          {generatedTemplate}
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              setMessage(generatedTemplate);
                              setShowTemplates(false);
                              setShowAiChat(false);
                              showNotify("AI Template applied!", "success");
                            }}
                            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                          >
                            <Check size={14} className="text-emerald-400" />
                            Use This Template
                          </button>
                          <button 
                            onClick={handleAiGenerate}
                            className="flex-1 py-3 bg-royal-purple/10 border border-royal-purple/20 rounded-xl text-xs font-black text-royal-purple uppercase tracking-widest hover:bg-royal-purple/20 transition-all flex items-center justify-center gap-2"
                          >
                            <RefreshCw size={14} />
                            Regenerate
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {MESSAGE_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setMessage(template.content);
                      setShowTemplates(false);
                      showNotify("Template applied!", "info");
                    }}
                    className="text-left p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-amethyst hover:bg-amethyst/5 transition-all group"
                  >
                    <h4 className="font-black text-white mb-2 group-hover:text-amethyst transition-colors">{template.title}</h4>
                    <p className="text-xs text-soft-lavender/40 line-clamp-3 leading-relaxed">{template.content}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HistoryView({ user, showNotify }: { user: any, showNotify: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
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
    if (error) showNotify(error.message, "error");
    else {
      showNotify("🗑️ Campaign record deleted.", "warning");
      fetchCampaigns();
    }
  };

  const handleCancelSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled campaign?")) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) showNotify(error.message, "error");
    else {
      showNotify("🕐 Scheduled campaign cancelled.", "info");
      fetchCampaigns();
    }
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
                <td className="px-6 py-4 font-bold text-white">
                  {c.name}
                  {c.status === 'scheduled' && (
                    <div className="text-[10px] text-amber-400 font-normal mt-1">
                      Scheduled for: {new Date(c.scheduled_at).toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 text-[10px] font-black rounded-full uppercase",
                    c.status === 'scheduled' ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                  )}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full", c.status === 'scheduled' ? "bg-amber-500" : "bg-emerald-500")} 
                      style={{ width: `${c.total_messages > 0 ? (c.sent_messages / c.total_messages) * 100 : 0}%` }} 
                    />
                  </div>
                  <div className="text-[10px] text-soft-lavender/40 mt-1">{c.sent_messages} / {c.total_messages} {c.status === 'scheduled' ? 'queued' : 'sent'}</div>
                </td>
                <td className="px-6 py-4 text-soft-lavender/60 text-sm">
                  {c.status === 'scheduled' ? new Date(c.scheduled_at).toLocaleDateString() : new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {c.status === 'scheduled' ? (
                      <button 
                        onClick={() => handleCancelSchedule(c.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-all"
                      >
                        <X size={14} />
                        Cancel Schedule
                      </button>
                    ) : (
                      <>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-soft-lavender/40 hover:text-white"><BarChart3 size={16} /></button>
                        <button 
                          onClick={() => handleDeleteCampaign(c.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-soft-lavender/40 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
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

function SettingsView({ profile, onUpdate, onOpenModal, showNotify }: { profile: any, onUpdate: () => void, onOpenModal: (type: any) => void, showNotify: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [whatsappConfig, setWhatsappConfig] = useState(() => {
    const saved = localStorage.getItem('techtaire_whatsapp_config');
    const parsed = saved ? JSON.parse(saved) : null;
    return {
      api_key: profile?.whatsapp_api_key || parsed?.api_key || '',
      phone_number_id: profile?.whatsapp_phone_number_id || parsed?.phone_number_id || ''
    };
  });
  const [ultramsgConfig, setUltramsgConfig] = useState(() => {
    const saved = localStorage.getItem('techtaire_ultramsg_config');
    return saved ? JSON.parse(saved) : { url: '', token: '' };
  });
  const [serverConfig, setServerConfig] = useState(() => {
    const saved = localStorage.getItem('techtaire_server_config');
    return saved ? JSON.parse(saved) : { url: 'https://techtaire-server-production.up.railway.app' };
  });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'pending' | 'connected'>('disconnected');
  const [polling, setPolling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testingUltra, setTestingUltra] = useState(false);
  const [ultraTestResult, setUltraTestResult] = useState<any>(null);

  const handleTestUltraMsg = async () => {
    if (!ultramsgConfig.url || !ultramsgConfig.token) {
      showNotify("Please enter both UltraMsg API URL and Token first.", "warning");
      return;
    }

    setTestingUltra(true);
    setUltraTestResult(null);
    try {
      const response = await axios.get(`${ultramsgConfig.url}instance/status?token=${ultramsgConfig.token}`);
      setUltraTestResult({ success: true, data: response.data });
      showNotify("✅ UltraMsg Connection Test Successful!", "success");
    } catch (e: any) {
      setUltraTestResult({ success: false, error: e.response?.data || e.message, status: e.response?.status });
      showNotify("❌ UltraMsg Connection Test Failed.", "error");
    } finally {
      setTestingUltra(false);
    }
  };

  const handleSaveUltra = () => {
    localStorage.setItem('techtaire_ultramsg_config', JSON.stringify(ultramsgConfig));
    showNotify("✅ UltraMsg settings saved successfully!", "success");
  };

  const checkStatus = async (url: string) => {
    try {
      const response = await axios.get(`/api/whatsapp-server/qr?url=${encodeURIComponent(url)}`);
      if (response.data.status === 'connected') {
        setConnectionStatus('connected');
        setQrCode(null);
        setPolling(false);
        localStorage.setItem('techtaire_whatsapp_connected', 'true');
      } else if (response.data.status === 'pending') {
        setConnectionStatus('pending');
        setQrCode(response.data.qr);
        setPolling(true);
      } else {
        setConnectionStatus('disconnected');
        setQrCode(null);
        setPolling(false);
        localStorage.removeItem('techtaire_whatsapp_connected');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error("Status check failed:", errorMsg);
      // Don't immediately stop polling on a single network error, maybe retry?
      // But for now, let's at least show the error clearly in console
      if (err.message === 'Network Error' || err.response?.status === 500) {
        // This might be a temporary server issue
      } else {
        setConnectionStatus('disconnected');
        setPolling(false);
      }
    }
  };

  useEffect(() => {
    if (serverConfig.url) {
      checkStatus(serverConfig.url);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (polling) {
      interval = setInterval(() => {
        checkStatus(serverConfig.url);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [polling, serverConfig.url]);

  const handleConnectWhatsApp = () => {
    localStorage.setItem('techtaire_server_config', JSON.stringify(serverConfig));
    setConnectionStatus('disconnected');
    setQrCode(null);
    setPolling(true);
    checkStatus(serverConfig.url);
  };

  const handleTestConnection = async () => {
    if (!whatsappConfig.api_key || !whatsappConfig.phone_number_id) {
      showNotify("Please enter both Access Token and Phone Number ID first.", "warning");
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const response = await axios.post('/api/whatsapp/send', {
        to: '919551522030', 
        message: 'Teachtaire Connection Test: Your WhatsApp API is now correctly configured! ✅',
        apiKey: whatsappConfig.api_key,
        phoneNumberId: whatsappConfig.phone_number_id
      });

      setTestResult({
        success: true,
        data: response.data
      });
      showNotify("✅ Connection Test Successful! Check your WhatsApp.", "success");
    } catch (e: any) {
      const errorData = e.response?.data || e.message;
      setTestResult({
        success: false,
        error: errorData,
        status: e.response?.status
      });
      showNotify("❌ Connection Test Failed. Check the error details.", "error");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          whatsapp_api_key: whatsappConfig.api_key,
          whatsapp_phone_number_id: whatsappConfig.phone_number_id
        })
        .eq('id', profile.id);
      
      if (error) throw error;
      
      // Persist to localStorage as well
      localStorage.setItem('techtaire_whatsapp_config', JSON.stringify(whatsappConfig));
      
      showNotify("✅ Settings saved successfully!", "success");
      onUpdate();
    } catch (err: any) {
      showNotify("Failed to save settings: " + err.message, "error");
    } finally {
      setSaving(false);
    }
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
            <p className="text-[10px] text-soft-lavender/40 mt-1 italic">
              Note: Temporary access tokens expire every 24 hours. For production, use a System User access token.
            </p>
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
          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn-premium flex-1"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
            <button 
              onClick={handleTestConnection}
              disabled={testing}
              className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
          </div>

          {testResult && (
            <div className={cn(
              "p-6 rounded-2xl border animate-in fade-in slide-in-from-top-4 duration-300",
              testResult.success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  testResult.success ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                  {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {testResult.success ? "Connection Successful" : `Connection Failed (${testResult.status || 'Error'})`}
                  </h4>
                  <p className="text-xs text-soft-lavender/60">
                    {testResult.success ? "Your WhatsApp API is correctly configured." : "There was an error connecting to the WhatsApp API."}
                  </p>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-4 overflow-x-auto">
                <pre className="text-[10px] font-mono text-soft-lavender/80">
                  {JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-10 space-y-8">
        <h3 className="text-xl font-black text-white tracking-tight">WhatsApp Server Configuration</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Server URL</label>
            <input 
              type="text" 
              value={serverConfig.url}
              onChange={(e) => setServerConfig({ ...serverConfig, url: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
              placeholder="https://your-server.com"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                connectionStatus === 'connected' ? "bg-emerald-500" : connectionStatus === 'pending' ? "bg-amber-500" : "bg-red-500"
              )} />
              <span className="text-sm font-bold text-white uppercase tracking-widest">
                {connectionStatus === 'connected' ? "Connected" : connectionStatus === 'pending' ? "Connecting..." : "Disconnected"}
              </span>
            </div>
            <button 
              onClick={handleConnectWhatsApp}
              disabled={polling || connectionStatus === 'connected'}
              className="px-6 py-2 bg-royal-purple text-white rounded-xl text-xs font-bold hover:bg-amethyst transition-all disabled:opacity-50"
            >
              {polling ? "Polling..." : connectionStatus === 'connected' ? "Connected" : "Connect WhatsApp"}
            </button>
          </div>

          {qrCode && (
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-3xl">
              <p className="text-xs font-black text-deep-night uppercase tracking-widest">Scan QR Code with WhatsApp</p>
              <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
              <p className="text-[10px] text-deep-night/40 italic text-center">
                Open WhatsApp &gt; Menu or Settings &gt; Linked Devices &gt; Link a Device
              </p>
            </div>
          )}

          {connectionStatus === 'connected' && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                <Check size={20} />
              </div>
              <div>
                <p className="text-white font-bold">✅ WhatsApp Connected!</p>
                <p className="text-xs text-soft-lavender/60">Your server is ready to send messages.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-10 space-y-8">
        <h3 className="text-xl font-black text-white tracking-tight">UltraMsg Configuration</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">UltraMsg API URL</label>
            <input 
              type="text" 
              value={ultramsgConfig.url}
              onChange={(e) => setUltramsgConfig({ ...ultramsgConfig, url: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
              placeholder="https://api.ultramsg.com/instanceXXXXX/"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">UltraMsg Token</label>
            <input 
              type="password" 
              value={ultramsgConfig.token}
              onChange={(e) => setUltramsgConfig({ ...ultramsgConfig, token: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-amethyst transition-all"
              placeholder="Enter your UltraMsg token"
            />
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSaveUltra}
              className="btn-premium flex-1"
            >
              Save Configuration
            </button>
            <button 
              onClick={handleTestUltraMsg}
              disabled={testingUltra}
              className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {testingUltra ? "Testing..." : "Test Connection"}
            </button>
          </div>

          {ultraTestResult && (
            <div className={cn(
              "p-6 rounded-2xl border animate-in fade-in slide-in-from-top-4 duration-300",
              ultraTestResult.success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  ultraTestResult.success ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                  {ultraTestResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                </div>
                <div>
                  <h4 className="font-bold text-white">
                    {ultraTestResult.success ? "UltraMsg Connected" : `UltraMsg Connection Failed`}
                  </h4>
                  <p className="text-xs text-soft-lavender/60">
                    {ultraTestResult.success ? "Your UltraMsg API is correctly configured." : "There was an error connecting to UltraMsg."}
                  </p>
                </div>
              </div>
            </div>
          )}
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
                Your free trial expires on {new Date(profile.trial_expiry).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <button className="w-full py-4 bg-royal-purple text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-royal-purple/20 transition-all">Upgrade Subscription</button>
        </div>
      </div>

      <div className="glass-panel p-10 space-y-8">
        <h3 className="text-xl font-black text-white tracking-tight">Information & Support</h3>
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => onOpenModal('trade')}
            className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-royal-purple/20 rounded-xl flex items-center justify-center text-amethyst group-hover:bg-royal-purple group-hover:text-white transition-all">
                <Shield size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Trade Terms and Conditions</p>
                <p className="text-xs text-soft-lavender/40">Business and usage policies</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-soft-lavender/20 group-hover:text-white transition-colors" />
          </button>

          <button 
            onClick={() => onOpenModal('disclaimer')}
            className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-royal-purple/20 rounded-xl flex items-center justify-center text-amethyst group-hover:bg-royal-purple group-hover:text-white transition-all">
                <AlertCircle size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Disclaimer</p>
                <p className="text-xs text-soft-lavender/40">Service guarantees and limitations</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-soft-lavender/20 group-hover:text-white transition-colors" />
          </button>

          <button 
            onClick={() => onOpenModal('about')}
            className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-royal-purple/20 rounded-xl flex items-center justify-center text-amethyst group-hover:bg-royal-purple group-hover:text-white transition-all">
                <Users size={24} />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">About Us</p>
                <p className="text-xs text-soft-lavender/40">Learn more about Trio Developers</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-soft-lavender/20 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
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

        // 4. Real Chart Data based on real stats
        const { data: campaignHistory } = await supabase
          .from('campaigns')
          .select('created_at, sent_messages')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(7);

        if (campaignHistory && campaignHistory.length > 0) {
          setChartData(campaignHistory.map(c => ({
            name: new Date(c.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
            sent: c.sent_messages || 0,
            delivered: Math.floor((c.sent_messages || 0) * 0.98)
          })));
        } else {
          setChartData([
            { name: 'Mon', sent: 0, delivered: 0 },
            { name: 'Tue', sent: 0, delivered: 0 },
            { name: 'Wed', sent: 0, delivered: 0 },
            { name: 'Thu', sent: 0, delivered: 0 },
            { name: 'Fri', sent: 0, delivered: 0 },
            { name: 'Sat', sent: 0, delivered: 0 },
            { name: 'Sun', sent: 0, delivered: 0 },
          ]);
        }

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


const AdminView = ({ user }: { user: any }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'orders' | 'manual' | 'notifications'>('stats');
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [notifSubject, setNotifSubject] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);

      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(profiles || []);

      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      setOrders(orderData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      fetchAdminData();
    }
  };

  const handleSendSystemNotification = async () => {
    if (!notifSubject || !notifMessage) return;
    setSendingNotif(true);
    try {
      // In a real app, you'd have a backend endpoint that iterates through all users
      // For this demo, we'll send it to all users in our 'users' state
      const promises = users.map(u => 
        axios.post('/api/email/send', {
          to: u.email,
          subject: notifSubject,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #8B5CF6;">System Notification</h2>
              <p>${notifMessage}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">&copy; 2026 Techtaire. All rights reserved.</p>
            </div>
          `
        })
      );
      await Promise.all(promises);
      alert(`Notification sent to ${users.length} users!`);
      setNotifSubject('');
      setNotifMessage('');
    } catch (err) {
      console.error(err);
      alert("Failed to send some notifications.");
    } finally {
      setSendingNotif(false);
    }
  };

  if (loading) return <div className="h-[600px] flex items-center justify-center"><RefreshCw className="animate-spin text-amethyst" size={48} /></div>;

  return (
    <div className="space-y-10">
      <div className="flex gap-4 border-b border-white/5 mb-10 overflow-x-auto">
        {[
          { id: 'stats', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'orders', label: 'Orders', icon: CreditCard },
          { id: 'manual', label: 'Manual Upgrade', icon: Zap },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeTab === tab.id ? "text-amethyst border-b-2 border-amethyst" : "text-soft-lavender/40 hover:text-white"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <DashboardStat label="Total Users" value={stats?.userCount || 0} icon={Users} color="bg-blue-600" />
            <DashboardStat label="Total Revenue" value={`₹${stats?.totalRevenue || 0}`} icon={CreditCard} color="bg-emerald-600" />
            <DashboardStat label="Total Campaigns" value={stats?.campaignCount || 0} icon={SendHorizontal} color="bg-royal-purple" />
            <DashboardStat label="Active Subscriptions" value={stats?.activeUsers || 0} icon={Zap} color="bg-amethyst" />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel p-10">
          <h3 className="text-2xl font-black text-white mb-8 tracking-tight uppercase">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{u.email}</div>
                      <div className="text-xs text-soft-lavender/40">{u.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-royal-purple/20 text-royal-purple text-[10px] font-black rounded-full uppercase tracking-widest">
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest",
                        u.subscription_status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {u.subscription_status || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-soft-lavender/40 text-sm">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
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
              {orders.map((o) => (
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'manual' && (
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">User Found</p>
                  <h4 className="text-xl font-black text-white">{foundUser.email}</h4>
                  <p className="text-sm text-soft-lavender/60">Current Plan: <span className="text-amethyst uppercase font-bold">{foundUser.plan}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Credits</p>
                  <p className="text-2xl font-black text-white">{foundUser.credits}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleManualUpgrade('professional', 150000)} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-amethyst transition-all text-left group">
                  <p className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest mb-2">Upgrade to</p>
                  <h5 className="text-lg font-black text-white group-hover:text-amethyst transition-colors">Professional</h5>
                  <p className="text-xs text-soft-lavender/60">1.5L Credits • ₹1499</p>
                </button>
                <button onClick={() => handleManualUpgrade('enterprise', 1000000)} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-amethyst transition-all text-left group">
                  <p className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest mb-2">Upgrade to</p>
                  <h5 className="text-lg font-black text-white group-hover:text-amethyst transition-colors">Enterprise</h5>
                  <p className="text-xs text-soft-lavender/60">10L Credits • ₹4999</p>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-3xl space-y-8">
          <div className="glass-panel p-10 space-y-8">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">System Notification</h3>
              <p className="text-soft-lavender/40 text-sm">Send a professional email notification to all registered users.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Subject Line</label>
                <input 
                  type="text" 
                  value={notifSubject}
                  onChange={(e) => setNotifSubject(e.target.value)}
                  placeholder="e.g., Important System Maintenance"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-amethyst"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-soft-lavender/40 uppercase tracking-widest">Message Content</label>
                <textarea 
                  rows={6}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-amethyst resize-none"
                />
              </div>

              <button 
                onClick={handleSendSystemNotification}
                disabled={sendingNotif || !notifSubject || !notifMessage}
                className="w-full btn-premium py-5 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {sendingNotif ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <SendHorizontal size={20} />
                    <span className="font-black uppercase tracking-widest">Broadcast to {users.length} Users</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
