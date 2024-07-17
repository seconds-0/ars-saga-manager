const nodemailer = require('nodemailer');

// TODO: Implement actual email sending logic when an email service is available
// For now, this function will just log the reset URL
async function sendResetPasswordEmail(email, resetUrl) {
  // TODO: Replace this console.log with actual email sending logic
  console.log(`[DEV MODE] Password reset link for ${email}: ${resetUrl}`);
  
  // Simulating email send delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // TODO: Implement error handling for email sending failures
  // For now, we'll just log a success message
  console.log('Password reset email sent successfully (simulated)');
}

module.exports = { sendResetPasswordEmail };