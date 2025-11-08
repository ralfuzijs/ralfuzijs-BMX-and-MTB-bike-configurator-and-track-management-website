const nodemailer = require('nodemailer');

/**
 * Email Service for sending email notifications
 * Configure your email provider settings in environment variables
 */

// Create reusable transporter
const createTransporter = () => {
  // Check if using Gmail or other service
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  if (emailService === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  } else {
    // Generic SMTP configuration
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

/**
 * Send email change notification to old email
 */
async function sendEmailChangeNotificationToOld(oldEmail, newEmail, username) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"BMX-MTB Tracker" <${process.env.EMAIL_USER}>`,
      to: oldEmail,
      subject: 'Email Address Changed - BMX-MTB Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #27ae60;">Email Address Changed</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>This is a notification that your email address has been changed on your BMX-MTB Tracker account.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Old Email:</strong> ${oldEmail}</p>
            <p><strong>New Email:</strong> ${newEmail}</p>
            <p><strong>Changed On:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="color: #e74c3c;"><strong>If you did not make this change:</strong></p>
          <p>Please contact support immediately as your account may have been compromised.</p>
          
          <hr style="border: 1px solid #dee2e6; margin: 20px 0;">
          <p style="color: #6c757d; font-size: 12px;">
            This is an automated message from BMX-MTB Tracker. Please do not reply to this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent to old address:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email to old address:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email change confirmation to new email
 */
async function sendEmailChangeNotificationToNew(newEmail, username) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"BMX-MTB Tracker" <${process.env.EMAIL_USER}>`,
      to: newEmail,
      subject: 'Welcome to Your Updated Email - BMX-MTB Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
          <h2 style="color: #27ae60;">Email Address Updated Successfully</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>This email confirms that your BMX-MTB Tracker account email has been successfully updated to this address.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>New Email:</strong> ${newEmail}</p>
            <p><strong>Updated On:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p>From now on, all account-related notifications will be sent to this email address.</p>
          
          <p style="color: #27ae60;"><strong>What's Next?</strong></p>
          <ul>
            <li>You can now use this email to log in to your account</li>
            <li>All future notifications will be sent here</li>
            <li>Keep this email secure</li>
          </ul>
          
          <p style="color: #e74c3c;"><strong>If you did not make this change:</strong></p>
          <p>Please contact support immediately.</p>
          
          <hr style="border: 1px solid #dee2e6; margin: 20px 0;">
          <p style="color: #6c757d; font-size: 12px;">
            This is an automated message from BMX-MTB Tracker. Please do not reply to this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent to new address:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email to new address:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send both email notifications
 */
async function sendEmailChangeNotifications(oldEmail, newEmail, username) {
  const results = await Promise.all([
    sendEmailChangeNotificationToOld(oldEmail, newEmail, username),
    sendEmailChangeNotificationToNew(newEmail, username)
  ]);
  
  return {
    oldEmailSent: results[0].success,
    newEmailSent: results[1].success,
    errors: results.filter(r => !r.success).map(r => r.error)
  };
}

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(email, username) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"BMX-MTB Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to BMX-MTB Tracker!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #27ae60; font-size: 2.5rem; margin: 0;">🚴 BMX-MTB Tracker</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #27ae60; margin-top: 0;">Hey, Thank You for Making an Account!</h2>
            <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${username}</strong>,</p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Welcome to the BMX-MTB Tracker community! We're excited to have you on board. 🎉
            </p>
            
            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
              <h3 style="color: #27ae60; margin-top: 0;">Your Account Details</h3>
              <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h3 style="color: #2c3e50;">🚀 What You Can Do Now:</h3>
            <ul style="font-size: 16px; line-height: 1.8; color: #555;">
              <li><strong>📍 Explore Tracks</strong> - Find BMX tracks, skateparks, and pumptracks near you</li>
              <li><strong>❤️ Save Favorites</strong> - Mark your favorite spots and visit them anytime</li>
              <li><strong>🧮 Bike Size Calculator</strong> - Find the perfect bike frame size for your height</li>
              <li><strong>⚙️ Customize Your Profile</strong> - Update your settings and preferences</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5174" style="display: inline-block; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                🚴 Start Exploring Now
              </a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              If you have any questions or need help getting started, feel free to reach out. We're here to help!
            </p>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Happy riding! 🏁<br>
              <strong>The BMX-MTB Tracker Team</strong>
            </p>
          </div>
          
          <hr style="border: 1px solid #dee2e6; margin: 20px 0;">
          <p style="color: #6c757d; font-size: 12px; text-align: center;">
            This is an automated welcome message from BMX-MTB Tracker.<br>
            You're receiving this because you just created an account with us.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email, '- Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmailChangeNotificationToOld,
  sendEmailChangeNotificationToNew,
  sendEmailChangeNotifications,
  sendWelcomeEmail
};
