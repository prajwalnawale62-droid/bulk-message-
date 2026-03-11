export const getWelcomeEmail = (email: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; text-transform: uppercase; letter-spacing: 2px; }
    .content { padding: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { text-align: center; font-size: 12px; color: #999; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">TECHTAIRE</div>
    </div>
    <div class="content">
      <h2>Welcome to Teachtaire!</h2>
      <p>Hello ${email},</p>
      <p>Thank you for joining Teachtaire – the most powerful WhatsApp bulk messaging platform for educators and businesses.</p>
      <p>Start scaling your communication today with our premium features:</p>
      <ul>
        <li>Bulk Messaging with AI Enhancement</li>
        <li>Advanced Contact Management</li>
        <li>Real-time Analytics</li>
        <li>Scheduled Campaigns</li>
      </ul>
      <p style="text-align: center;">
        <a href="https://teachtaire.com/dashboard" class="button">Go to Dashboard</a>
      </p>
    </div>
    <div class="footer">
      &copy; 2026 Teachtaire. All rights reserved.<br>
      support@teachtaire.com
    </div>
  </div>
</body>
</html>
`;

export const getPaymentSuccessEmail = (email: string, plan: string, amount: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; text-transform: uppercase; letter-spacing: 2px; }
    .content { padding: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #999; padding-top: 20px; border-top: 1px solid #eee; }
    .success-badge { background-color: #10B981; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">TECHTAIRE</div>
    </div>
    <div class="content">
      <h2>Payment Successful! <span class="success-badge">CONFIRMED</span></h2>
      <p>Hello ${email},</p>
      <p>Your payment of <strong>₹${amount}</strong> for the <strong>${plan}</strong> plan has been processed successfully.</p>
      <p>Your account has been upgraded and all premium features are now unlocked.</p>
      <p>Transaction Details:</p>
      <ul>
        <li>Plan: ${plan}</li>
        <li>Amount: ₹${amount}</li>
        <li>Status: Active</li>
        <li>Date: ${new Date().toLocaleDateString()}</li>
      </ul>
      <p>Thank you for choosing Teachtaire!</p>
    </div>
    <div class="footer">
      &copy; 2026 Teachtaire. All rights reserved.<br>
      support@teachtaire.com
    </div>
  </div>
</body>
</html>
`;

export const getLoginAlertEmail = (email: string, time: string, browser: string = 'Unknown', ip: string = 'Unknown') => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eef2f6; }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 30px; text-align: center; }
    .logo { font-size: 28px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 3px; margin: 0; }
    .content { padding: 40px; }
    .alert-title { color: #1a1a1a; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; }
    .message { color: #4b5563; font-size: 16px; margin-bottom: 30px; }
    .details-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
    .detail-item { margin-bottom: 10px; font-size: 14px; color: #374151; }
    .detail-label { font-weight: 700; color: #111827; width: 120px; display: inline-block; }
    .button-container { text-align: center; }
    .button { display: inline-block; padding: 14px 30px; background-color: #8B5CF6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; transition: background 0.3s; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eef2f6; }
    .warning { color: #dc2626; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">TECHTAIRE</div>
    </div>
    <div class="content">
      <h2 class="alert-title">Login Alert – Teachtaire</h2>
      <p class="message">Hello,</p>
      <p class="message">Your account has just logged in to Teachtaire.</p>
      
      <div class="details-box">
        <div class="detail-item"><span class="detail-label">User Email:</span> ${email}</div>
        <div class="detail-item"><span class="detail-label">Login Time:</span> ${time}</div>
        <div class="detail-item"><span class="detail-label">Device/Browser:</span> ${browser}</div>
        <div class="detail-item"><span class="detail-label">IP Address:</span> ${ip}</div>
      </div>

      <p class="message">If this was you, no action is needed.</p>
      <p class="warning">If this was not you, please change your password immediately.</p>
      
      <div class="button-container">
        <a href="https://teachtaire.com/dashboard" class="button">Go to Dashboard</a>
      </div>
    </div>
    <div class="footer">
      &copy; 2026 Teachtaire. All rights reserved.<br>
      This is an automated security notification. Please do not reply to this email.
    </div>
  </div>
</body>
</html>
`;

export const getPasswordResetEmail = (email: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; text-transform: uppercase; letter-spacing: 2px; }
    .content { padding: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #999; padding-top: 20px; border-top: 1px solid #eee; }
    .button { display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">TECHTAIRE</div>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hello ${email},</p>
      <p>We received a request to reset the password for your Teachtaire account. Click the button below to set a new password:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p>If you didn't request a password reset, you can safely ignore this email. The link will expire in 1 hour.</p>
    </div>
    <div class="footer">
      &copy; 2026 Teachtaire. All rights reserved.<br>
      support@teachtaire.com
    </div>
  </div>
</body>
</html>
`;
