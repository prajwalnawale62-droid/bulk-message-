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

// Initialize Nodemailer lazily
let transporterInstance: nodemailer.Transporter | null = null;
const getTransporter = () => {
  if (!transporterInstance) {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    
    if (!user || !pass) {
      console.warn("SMTP credentials missing. Emails will not be sent.");
      return null;
    }

    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user,
        pass,
      },
    });
  }
  return transporterInstance;
};

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
    limit: '50mb',
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Email requested but SMTP is not configured.");
      return res.status(200).json({ 
        success: false, 
        message: "Email service is not configured. Please set SMTP_USER and SMTP_PASS in environment variables." 
      });
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

  // --- WhatsApp API Routes ---
  app.post("/api/whatsapp/send", async (req, res) => {
    const { to, message, apiKey, phoneNumberId, attachmentUrl } = req.body;

    if (!apiKey || !phoneNumberId) {
      return res.status(400).json({ error: "WhatsApp API credentials missing" });
    }

    try {
      let data: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
      };

      if (attachmentUrl) {
        // If there's an attachment, we use a template or media message
        // For simplicity, let's assume it's an image if attachmentUrl is present
        data.type = "image";
        data.image = {
          link: attachmentUrl,
          caption: message
        };
      } else {
        data.type = "text";
        data.text = { body: message };
      }

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        data,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("WhatsApp API Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    }
  });

  // --- WhatsApp Railway Server Proxy ---
  app.all("/api/whatsapp-server/:path(*)", async (req, res) => {
    const path = req.params.path;
    const serverUrl = 'https://techtaire1-production.up.railway.app';
    const url = `${serverUrl}/${path}`;
    
    try {
      // Filter out headers that might cause issues
      const headers = { ...req.headers };
      delete headers.host;
      delete headers.connection;
      delete headers['content-length'];
      
      // Disable caching to avoid 304 responses
      headers['cache-control'] = 'no-cache';
      headers['pragma'] = 'no-cache';
      headers['if-none-match'] = '';
      headers['if-modified-since'] = '';

      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        params: req.query,
        headers: headers,
        timeout: 30000, // 30s timeout
        validateStatus: (status) => true, // Accept all status codes
      });

      if (response.status >= 400) {
        console.error(`WhatsApp Proxy Error (${response.status}) for ${path}:`, JSON.stringify(response.data));
      }

      // If the backend returns 429, pass it through to the client
      if (response.status === 429) {
        console.warn(`WhatsApp Proxy: Too many requests for ${path}`);
      }

      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error(`WhatsApp Proxy Exception (${path}):`, error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
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
              const transporter = getTransporter();
              if (transporter) {
                await transporter.sendMail({
                  from: `"Teachtaire Notifications" <${process.env.SMTP_USER}>`,
                  to: profile.email,
                  subject: 'Payment Successful - Teachtaire',
                  html: getPaymentSuccessEmail(profile.email, planName, (payment.amount / 100).toString()),
                });
                console.log("Payment success email sent to:", profile.email);
              } else {
                console.warn("Skipping payment success email: SMTP not configured");
              }
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

  // --- WhatsApp Proxy ---
  app.post("/api/whatsapp/proxy", async (req, res) => {
    const { url, method, body, headers } = req.body;
    console.log(`Proxying ${method} request to ${url}`);
    
    if (url === '/api/session/login' || url === '/api/session/register') {
      body.password = process.env.WHATSAPP_SESSION_PASSWORD;
    }
    
    try {
      const response = await axios({
        url: `https://techtaire1-production.up.railway.app${url}`,
        method,
        data: body,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Proxy success for ${url}:`, response.status);
      res.json(response.data);
    } catch (err: any) {
      console.error(`Proxy error for ${url}:`, err.response?.status, err.response?.data || err.message);
      res.status(err.response?.status || 500).json(err.response?.data || { message: err.message });
    }
  });

  // --- Campaign Scheduler ---
  const processScheduledCampaigns = async () => {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) return;

    try {
      const now = new Date().toISOString();
      // Fetch scheduled campaigns that are due
      const { data: campaigns, error } = await supabaseAdmin
        .from('campaigns')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_at', now);

      if (error) {
        console.error("Error fetching scheduled campaigns:", error);
        return;
      }

      if (!campaigns || campaigns.length === 0) return;

      console.log(`Processing ${campaigns.length} scheduled campaigns...`);

      for (const campaign of campaigns) {
        try {
          // Update status to sending to avoid duplicate processing
          await supabaseAdmin
            .from('campaigns')
            .update({ status: 'sending' })
            .eq('id', campaign.id);

          // Get user's email for the session ID
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', campaign.user_id)
            .single();

          const userEmail = profile?.email;
          if (!userEmail) {
            console.error(`No email found for user ${campaign.user_id}`);
            await supabaseAdmin.from('campaigns').update({ status: 'failed' }).eq('id', campaign.id);
            continue;
          }

          // Fetch contacts for the campaign
          let query = supabaseAdmin
            .from('contacts')
            .select('whatsapp_number')
            .eq('user_id', campaign.user_id);
          
          if (campaign.batch && campaign.batch !== 'all') {
            query = query.eq('batch', campaign.batch);
          }

          const { data: contacts } = await query;

          if (!contacts || contacts.length === 0) {
            console.warn(`No contacts found for campaign ${campaign.id}`);
            await supabaseAdmin.from('campaigns').update({ status: 'completed', sent_messages: 0 }).eq('id', campaign.id);
            continue;
          }

          // Clean numbers and format messages
          const messages = contacts.map((c: any) => ({
            number: c.whatsapp_number.replace(/\D/g, ''),
            message: campaign.message_template
          })).filter((c: any) => c.number);

          // Send messages via Railway server
          const serverUrl = 'https://techtaire1-production.up.railway.app';
          await axios.post(`${serverUrl}/messages/send`, {
            userId: userEmail,
            messages,
            mediaUrl: campaign.attachment_url
          });

          // Update status to completed
          await supabaseAdmin
            .from('campaigns')
            .update({ 
              status: 'completed',
              sent_messages: messages.length
            })
            .eq('id', campaign.id);

          console.log(`Campaign ${campaign.id} processed successfully.`);
        } catch (err: any) {
          console.error(`Error processing campaign ${campaign.id}:`, err.message);
          await supabaseAdmin
            .from('campaigns')
            .update({ status: 'failed' })
            .eq('id', campaign.id);
        }
      }
    } catch (err: any) {
      console.error("Scheduler error:", err.message);
    }
  };

  // Run scheduler every minute
  setInterval(processScheduledCampaigns, 60000);

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
