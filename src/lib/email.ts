import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resendApiKey = process.env.RESEND_API_KEY;
const smtpHost = process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.EMAIL_SERVER_PORT || '587', 10);
const smtpUser = process.env.EMAIL_SERVER_USER;
const smtpPass = process.env.EMAIL_SERVER_PASSWORD;
const emailFrom = process.env.EMAIL_FROM || 'noreply@habitflow.com';

// Initialize email clients
const smtpTransport = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const getWelcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to HabitFlow</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      text-align: center;
      padding: 40px 20px;
      border-radius: 10px 10px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .quote {
      font-style: italic;
      color: #666;
      border-left: 4px solid #8b5cf6;
      padding-left: 20px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to HabitFlow!</h1>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Welcome to HabitFlow! We're thrilled to have you join our community of motivated individuals committed to building better habits and achieving their goals.</p>
      
      <div class="quote">
        "Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill
      </div>
      
      <p>Here's what you can do with HabitFlow:</p>
      <ul>
        <li>Track your daily habits and build streaks</li>
        <li>Set and monitor your personal goals</li>
        <li>Journal your thoughts and gratitude</li>
        <li>Analyze your progress with beautiful charts</li>
      </ul>
      
      <p>Ready to start your journey?</p>
      <a href="http://localhost:3003" class="button">Get Started Now</a>
      
      <p>Need help getting started? Here are some quick tips:</p>
      <ul>
        <li>Start small - choose 1-2 habits to focus on</li>
        <li>Set realistic goals</li>
        <li>Track your progress daily</li>
        <li>Celebrate small wins</li>
      </ul>
      
      <div class="footer">
        <p>If you have any questions, just reply to this email - we're always happy to help.</p>
        <p>Best regards,<br>The HabitFlow Team</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export async function sendWelcomeEmail(email: string, name: string) {
  const subject = '🎉 Welcome to HabitFlow - Start Your Journey!';
  const html = getWelcomeEmailTemplate(name);

  try {
    // Try SMTP first
    if (smtpUser && smtpPass) {
      await smtpTransport.sendMail({
        from: emailFrom,
        to: email,
        subject,
        html,
      });
      return { success: true };
    }
    
    // Try Resend as fallback
    if (resend) {
      await resend.emails.send({
        from: emailFrom,
        to: email,
        subject,
        html,
      });
      return { success: true };
    }

    throw new Error('No email service configured');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 