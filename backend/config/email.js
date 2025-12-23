import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

// Email templates
export const emailTemplates = {
  verifyEmail: (name, token, url) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to Our Marketplace, ${name}!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${url}/verify-email?token=${token}" class="button">Verify Email</a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${url}/verify-email?token=${token}</p>
        <p>This link will expire in 24 hours.</p>
        <div class="footer">
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  resetPassword: (name, token, url) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background-color: #f44336; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${url}/reset-password?token=${token}" class="button">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${url}/reset-password?token=${token}</p>
        <p>This link will expire in 1 hour.</p>
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  orderConfirmation: (name, orderId, total, items) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .order-details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Order Confirmation</h2>
        <p>Hi ${name},</p>
        <p>Thank you for your order! Your order has been confirmed.</p>
        <div class="order-details">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <div class="items">
            ${items.map(item => `
              <div class="item">
                <p><strong>${item.name}</strong></p>
                <p>Quantity: ${item.quantity} × $${item.price}</p>
              </div>
            `).join('')}
          </div>
          <p class="total">Total: $${total}</p>
        </div>
        <p>You can track your order status in your account dashboard.</p>
        <div class="footer">
          <p>Thank you for shopping with us!</p>
        </div>
      </div>
    </body>
    </html>
  `,

  vendorApproval: (name, storeName) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .success { background-color: #4CAF50; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success">
          <h2>🎉 Vendor Application Approved!</h2>
        </div>
        <p>Hi ${name},</p>
        <p>Great news! Your vendor application for <strong>${storeName}</strong> has been approved.</p>
        <p>You can now start adding products and managing your store.</p>
        <p>Login to your vendor dashboard to get started.</p>
        <div class="footer">
          <p>Welcome to our marketplace community!</p>
        </div>
      </div>
    </body>
    </html>
  `
};
