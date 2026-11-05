// @ts-nocheck — template asset; type-checked in generated projects where nodemailer is installed
import nodemailer, { type Transporter } from 'nodemailer';

// Seeds brand colors
const COLORS = {
  emerald: '#087F5B',
  gold: '#E6C47A',
  darkForest: '#071A16',
  lightBg: '#F8FAF9',
  textDark: '#1A2E2A',
  textMuted: '#5C6B68',
};

// Lazy init — ESM imports hoist above dotenv.config() in index.ts, so process.env
// may be empty when this module is first imported. Build the transporter on first
// send, by which point env is loaded.
let transporter: Transporter | undefined;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;

  // If SMTP is not configured, return null and log warning
  if (!host || !port || !email || !password) {
    console.warn('[EMAIL] SMTP not configured — skipping email send');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: email,
        pass: password,
      },
    });
  }
  return transporter;
}

function getEmailBaseStyle(): string {
  return `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; margin: 0; padding: 0; background-color: ${COLORS.lightBg}; color: ${COLORS.textDark}; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.darkForest}); padding: 32px 40px; text-align: center; }
    .logo { font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px; }
    .logo span { color: ${COLORS.gold}; }
    .content { padding: 40px; }
    .title { font-size: 24px; font-weight: 700; color: ${COLORS.darkForest}; margin-bottom: 16px; }
    .text { font-size: 16px; color: ${COLORS.textMuted}; margin-bottom: 24px; line-height: 1.7; }
    .button { display: inline-block; background: linear-gradient(135deg, ${COLORS.emerald}, #0A9E72); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; transition: transform 0.2s, box-shadow 0.2s; }
    .button:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(8,127,91,0.3); }
    .footer { text-align: center; padding: 24px; background: ${COLORS.lightBg}; font-size: 13px; color: ${COLORS.textMuted}; border-top: 1px solid #E8ECEB; }
    .divider { height: 1px; background: linear-gradient(to right, transparent, ${COLORS.gold}, transparent); margin: 24px 0; }
    .highlight { background: linear-gradient(135deg, rgba(8,127,91,0.08), rgba(230,196,122,0.08)); border-left: 4px solid ${COLORS.emerald}; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
  `;
}

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;

  const apiBaseUrl = process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5173';
  const verifyUrl = `${apiBaseUrl}/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${getEmailBaseStyle()}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Seeds<span>.</span></div>
      </div>
      <div class="content">
        <h1 class="title">Welcome to Seeds, ${name}!</h1>
        <p class="text">Thank you for joining our community dedicated to nurturing relationships and growing together. To complete your registration, please verify your email address.</p>
        
        <div class="highlight">
          <strong>Why verify?</strong> Verification helps us keep our community safe and ensures you receive important notifications about your connections and reminders.
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" class="button">Verify Email Address</a>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 13px; color: ${COLORS.emerald}; background: ${COLORS.lightBg}; padding: 12px; border-radius: 8px;">${verifyUrl}</p>
        
        <p class="text" style="font-size: 14px; margin-top: 24px;">This verification link expires in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Seeds. Nurture relationships, grow together.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transport.sendMail({
      from: `"Seeds" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: 'Verify your Seeds account',
      html,
    });
    console.log(`[EMAIL] Verification email sent to ${to}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send verification email:', err);
    // Don't throw — email failure shouldn't block registration
  }
}

export async function sendNotificationEmail(to: string, name: string, subject: string, body: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${getEmailBaseStyle()}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Seeds<span>.</span></div>
      </div>
      <div class="content">
        <h1 class="title">${subject}</h1>
        <p class="text">Hi ${name},</p>
        <div class="highlight">
          ${body}
        </div>
        <p class="text" style="margin-top: 24px;">Stay connected and keep growing with Seeds.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Seeds. Nurture relationships, grow together.</p>
        <p style="margin-top: 8px;"><a href="#" style="color: ${COLORS.emerald};">Manage notification preferences</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transport.sendMail({
      from: `"Seeds" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `[Seeds] ${subject}`,
      html,
    });
    console.log(`[EMAIL] Notification email sent to ${to}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send notification email:', err);
  }
}

export async function sendReminderEmail(to: string, name: string, reminderMessage: string, entityName: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${getEmailBaseStyle()}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Seeds<span>.</span></div>
      </div>
      <div class="content">
        <h1 class="title">Friendly Reminder</h1>
        <p class="text">Hi ${name},</p>
        
        <div class="highlight">
          <p style="margin: 0; font-size: 18px; font-weight: 600; color: ${COLORS.darkForest};">${reminderMessage}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: ${COLORS.textMuted};">Related to: <strong>${entityName}</strong></p>
        </div>
        
        <p class="text">Nurturing relationships takes consistent effort. This reminder is here to help you stay connected with the people and causes that matter most.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px;">You're receiving this because you have email reminders enabled. Small actions lead to meaningful connections.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Seeds. Nurture relationships, grow together.</p>
        <p style="margin-top: 8px;"><a href="#" style="color: ${COLORS.emerald};">Manage reminder settings</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transport.sendMail({
      from: `"Seeds" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `[Seeds] Reminder: ${entityName}`,
      html,
    });
    console.log(`[EMAIL] Reminder email sent to ${to}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send reminder email:', err);
  }
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;

  const apiBaseUrl = process.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5173';
  const resetUrl = `${apiBaseUrl}/reset-password?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${getEmailBaseStyle()}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Seeds<span>.</span></div>
      </div>
      <div class="content">
        <h1 class="title">Reset Your Password</h1>
        <p class="text">Hi ${name},</p>
        <p class="text">We received a request to reset your password. Click the button below to choose a new password.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <div class="divider"></div>
        
        <p class="text" style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 13px; color: ${COLORS.emerald}; background: ${COLORS.lightBg}; padding: 12px; border-radius: 8px;">${resetUrl}</p>
        
        <div class="highlight" style="margin-top: 24px;">
          <strong>Security Notice:</strong> This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
        </div>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Seeds. Nurture relationships, grow together.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transport.sendMail({
      from: `"Seeds" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: '[Seeds] Reset your password',
      html,
    });
    console.log(`[EMAIL] Password reset email sent to ${to}`);
  } catch (err) {
    console.error('[EMAIL] Failed to send password reset email:', err);
  }
}
