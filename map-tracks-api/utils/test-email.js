/**
 * Test Email Service
 * Run this script to test if email configuration is working
 * Usage: node utils/test-email.js
 */

require('dotenv').config();
const { sendEmailChangeNotifications, sendWelcomeEmail } = require('./emailService');

async function testEmail() {
  console.log('=========================================');
  console.log('Testing Email Service...');
  console.log('=========================================');
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Service:', process.env.EMAIL_SERVICE);
  console.log('=========================================\n');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Error: EMAIL_USER and EMAIL_PASSWORD must be set in .env file');
    console.log('\nPlease configure your .env file with:');
    console.log('EMAIL_SERVICE=gmail');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASSWORD=your-app-password');
    console.log('\n📖 See GMAIL_APP_PASSWORD_SETUP.md for detailed instructions');
    process.exit(1);
  }
  
  // Test with your own email
  const testEmail = process.env.EMAIL_USER; // Send test to yourself
  
  console.log('🧪 TEST 1: Welcome Email (New User Registration)');
  console.log('================================================\n');
  console.log(`Sending welcome email to: ${testEmail}`);
  
  try {
    const welcomeResult = await sendWelcomeEmail(testEmail, 'Test User');
    
    console.log('\n✅ Welcome Email Result:');
    console.log('Sent:', welcomeResult.success ? '✓' : '✗');
    
    if (!welcomeResult.success) {
      console.log('Error:', welcomeResult.error);
    } else {
      console.log('Message ID:', welcomeResult.messageId);
    }
  } catch (error) {
    console.error('\n❌ Error sending welcome email:', error.message);
  }
  
  console.log('\n\n🧪 TEST 2: Email Change Notifications');
  console.log('================================================\n');
  console.log(`Sending email change notifications to: ${testEmail}`);
  
  try {
    const changeResult = await sendEmailChangeNotifications(
      testEmail,
      testEmail,
      'Test User'
    );
    
    console.log('\n✅ Email Change Notifications Result:');
    console.log('Old Email Sent:', changeResult.oldEmailSent ? '✓' : '✗');
    console.log('New Email Sent:', changeResult.newEmailSent ? '✓' : '✗');
    
    if (changeResult.errors && changeResult.errors.length > 0) {
      console.log('\n❌ Errors:', changeResult.errors);
    }
  } catch (error) {
    console.error('\n❌ Error sending email change notifications:', error.message);
  }
  
  console.log('\n\n=========================================');
  console.log('📬 SUMMARY');
  console.log('=========================================');
  console.log('✅ If tests succeeded, check your email inbox!');
  console.log('📧 You should receive 3 emails total:');
  console.log('   1. Welcome email (with "Thank you for making account")');
  console.log('   2. Email change - old address notification');
  console.log('   3. Email change - new address confirmation');
  console.log('\n⚠️  Don\'t forget to check your SPAM/JUNK folder!');
  console.log('=========================================\n');
  
  console.log('Troubleshooting:');
  console.log('1. Make sure you are using an App Password for Gmail');
  console.log('2. Check that EMAIL_USER and EMAIL_PASSWORD are correct in .env');
  console.log('3. Verify your internet connection');
  console.log('4. Check spam/junk folder for the emails');
  console.log('5. See GMAIL_APP_PASSWORD_SETUP.md for setup help');
}

testEmail();
