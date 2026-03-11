import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import { 
  getWelcomeEmail, 
  getPaymentSuccessEmail, 
  getLoginAlertEmail, 
  getPasswordResetEmail 
} from './src/services/emailTemplates';
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Initialize Supabase Admin lazily to prevent crash on missing env vars
let supabaseAdminInstance: any = null;
const getSupabaseAdmin = () => {
  if (!supabaseAdminInstance) {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.warn("Supabase Admin credentials missing. Backend updates will fail.");
      return null;
    }
    supabaseAdminInstance = createClient(url, key);
  }
  return supabaseAdminInstance;
};

// Initialize Razorpay lazily
let razorpayInstance: any = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.warn("Razorpay credentials missing. Payments will fail.");
      return null;
    }
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
};

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
  });

  // Apply rate limiting to auth and payment routes
  app.use("/api/payment/", limiter);

  // Use raw body for webhook signature verification
  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));

  // --- Email System ---
  app.post("/api/email/send", async (req, res) => {
    const { to, subject, html, type, data } = req.body;
    
    let emailHtml = html;
    if (type === 'welcome') {
      emailHtml = getWelcomeEmail(to);
    } else if (type === 'payment_success') {
      emailHtml = getPaymentSuccessEmail(to, data.plan, data.amount);
    } else if (type === 'login_alert') {
      emailHtml = getLoginAlertEmail(to, data.time, data.browser, data.ip);
    } else if (type === 'password_reset') {
      emailHtml = getPasswordResetEmail(to, data.resetLink);
    }

    try {
      const info = await transporter.sendMail({
        from: `"Teachtaire Notifications" <${process.env.SMTP_USER}>`,
        to,
        subject: subject || (
          type === 'welcome' ? 'Welcome to Teachtaire!' : 
          type === 'payment_success' ? 'Payment Successful' :
          type === 'login_alert' ? 'Security Alert: New Login' :
          'Password Reset Request'
        ),
        html: emailHtml,
      });
      console.log("Email sent:", info.messageId);
      res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error("Email Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin Routes ---
  app.get("/api/admin/stats", async (req, res) => {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase Admin not configured" });

    try {
      const { data: users, count: userCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact' });
      const { data: orders } = await supabaseAdmin.from('orders').select('*');
      const { data: campaigns } = await supabaseAdmin.from('campaigns').select('*');

      const totalRevenue = orders?.reduce((acc: number, order: any) => acc + (order.payment_status === 'paid' ? order.amount : 0), 0) || 0;

      res.json({
        userCount,
        totalRevenue,
        campaignCount: campaigns?.length || 0,
        activeUsers: users?.filter((u: any) => u.subscription_status === 'active').length || 0
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 1. Create Order API
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { amount, planName, userId } = req.body;
      console.log("Creating Razorpay Order:", { amount, planName, userId });

      const razorpay = getRazorpay();
      const supabaseAdmin = getSupabaseAdmin();

      if (!razorpay) {
        return res.status(500).json({ error: "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables." });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: "Supabase Admin is not configured. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables." });
      }

      if (!amount || !planName || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId,
          planName
        }
      };

      const order = await razorpay.orders.create(options);
      console.log("Razorpay Order Created Successfully:", order.id);

      // Store pending order in Supabase
      const { error: dbError } = await getSupabaseAdmin()
        .from('orders')
        .insert({
          id: order.id,
          user_id: userId,
          plan_id: planName,
          amount: amount,
          payment_status: 'pending',
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error("Database Order Error:", dbError);
      }

      res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      });
    } catch (error: any) {
      console.error("Razorpay Order Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2. Razorpay Webhook for Automatic Verification
  app.post("/api/payment/webhook", async (req: any, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "your_webhook_secret";
    const signature = req.headers["x-razorpay-signature"];

    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.rawBody)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Invalid Webhook Signature");
        return res.status(400).send("Invalid signature");
      }

      const event = req.body;
      console.log("Razorpay Webhook Event:", event.event);

      if (event.event === "payment.captured") {
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
          console.error("Supabase Admin not initialized for webhook");
          return res.status(500).send("Configuration Error");
        }

        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        const userId = payment.notes.userId;
        const planName = payment.notes.planName;

        console.log(`Payment Captured: Order ${orderId} for User ${userId} (Plan: ${planName})`);

        // 1. Update Order Status
        await getSupabaseAdmin()
          .from('orders')
          .update({ 
            payment_status: 'paid',
            payment_id: payment.id
          })
          .eq('id', orderId);

        // 2. Activate Subscription in Profile
        let creditsToAdd = 0;
        const plan = planName.toLowerCase();
        if (plan.includes('professional')) creditsToAdd = 150000;
        else if (plan.includes('enterprise')) creditsToAdd = 1000000;
        else creditsToAdd = 3000;

        // Get current credits
        const { data: profile, error: profileError } = await getSupabaseAdmin()
          .from('profiles')
          .select('credits, email')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Profile Fetch Error:", profileError);
        }

        const newCredits = (profile?.credits || 0) + creditsToAdd;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month validity

        const { error: updateError } = await getSupabaseAdmin()
          .from('profiles')
          .update({
            plan: plan.includes('enterprise') ? 'enterprise' : plan.includes('professional') ? 'professional' : 'starter',
            credits: newCredits,
            subscription_status: 'active',
            subscription_expiry: expiryDate.toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error("Subscription Activation Error:", updateError);
        } else {
          console.log(`Successfully activated ${planName} for ${userId}`);
          // 3. Send Payment Success Email
          if (profile?.email) {
            try {
              await transporter.sendMail({
                from: `"Teachtaire Notifications" <${process.env.SMTP_USER}>`,
                to: profile.email,
                subject: 'Payment Successful - Teachtaire',
                html: getPaymentSuccessEmail(profile.email, planName, (payment.amount / 100).toString()),
              });
              console.log("Payment success email sent to:", profile.email);
            } catch (e) {
              console.error("Failed to send payment success email", e);
            }
          }
        }
      }

      res.status(200).json({ status: "ok" });
    } catch (error: any) {
      console.error("Webhook Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // PhonePe Payment Integration (Keep as legacy or alternative)
  app.post("/api/payment/initiate", async (req, res) => {
    try {
      const { amount, userId, planName } = req.body;
      
      const merchantId = process.env.PHONEPE_MERCHANT_ID;
      const saltKey = process.env.PHONEPE_SALT_KEY;
      const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

      if (!merchantId || !saltKey) {
        console.error("PhonePe Configuration Missing:", { merchantId: !!merchantId, saltKey: !!saltKey });
        return res.status(500).json({ error: "PhonePe credentials not configured in environment variables" });
      }

      // Detect environment based on Merchant ID
      const isSandbox = merchantId.startsWith("PGTEST");
      const phonepeUrl = isSandbox 
        ? "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
        : "https://api.phonepe.com/apis/hermes/pg/v1/pay";

      const merchantTransactionId = `MT${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const payload = {
        merchantId,
        merchantTransactionId,
        merchantUserId: userId || "MUID123",
        amount: Math.round(amount * 100), // Ensure it's an integer in paise
        redirectUrl: `${appUrl}/dashboard?payment=success&tid=${merchantTransactionId}`,
        redirectMode: "REDIRECT",
        callbackUrl: `${appUrl}/api/payment/callback`,
        paymentInstrument: {
          type: "PAY_PAGE"
        }
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
      const stringToHash = base64Payload + "/pg/v1/pay" + saltKey;
      const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
      const checksum = sha256 + "###" + saltIndex;

      console.log(`Initiating PhonePe payment (${isSandbox ? 'Sandbox' : 'Production'}):`, {
        merchantTransactionId,
        amount: payload.amount,
        url: phonepeUrl
      });

      const response = await axios.post(
        phonepeUrl,
        { request: base64Payload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "accept": "application/json"
          }
        }
      );

      res.json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || error.message;
      console.error("PhonePe Initiation Error:", errorData || error.message);
      res.status(500).json({ 
        error: "Failed to initiate payment", 
        details: errorMessage,
        code: errorData?.code
      });
    }
  });

  app.post("/api/payment/callback", (req, res) => {
    // Handle server-to-server callback from PhonePe
    console.log("PhonePe Callback:", req.body);
    res.status(200).send("OK");
  });

  // WhatsApp API Proxy / Logic
  app.post("/api/whatsapp/send", async (req, res) => {
    const { to, message, apiKey, phoneNumberId, attachmentUrl } = req.body;
    
    // Use provided credentials or fallback to environment variables
    const WHATSAPP_TOKEN = apiKey || process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      return res.status(500).json({ error: "WhatsApp API not configured" });
    }

    try {
      let data: any = {
        messaging_product: "whatsapp",
        to,
      };

      if (attachmentUrl) {
        // If it's a data URL, we'd normally need to upload it to Meta first.
        // For this demo, we'll assume it's a direct link or handle text only if it's too large.
        // Real implementation would use the Media API.
        const isImage = attachmentUrl.startsWith('data:image');
        const isVideo = attachmentUrl.startsWith('data:video');
        
        if (isImage || isVideo) {
          data.type = isImage ? "image" : "video";
          data[data.type] = {
            link: attachmentUrl.startsWith('data:') ? "https://picsum.photos/800/600" : attachmentUrl, // Fallback for data URLs in demo
            caption: message
          };
        } else {
          data.type = "text";
          data.text = { body: message };
        }
      } else {
        data.type = "text";
        data.text = { body: message };
      }

      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        data,
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("WhatsApp Send Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to send message" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
