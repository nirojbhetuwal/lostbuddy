import nodemailer from 'nodemailer';

// Create transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email notification for new claim
const sendNewClaimNotification = async (itemOwner, claimant, item, claim) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@lostbuddy.com',
      to: itemOwner.email,
      subject: `New Claim on Your Found Item - ${item.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Claim Submitted</h2>
          <p>Hello ${itemOwner.username},</p>
          <p>A user has submitted a claim for your found item "<strong>${item.title}</strong>".</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Claim Details:</h3>
            <p><strong>Claimant:</strong> ${claimant.username}</p>
            <p><strong>Message:</strong> ${claim.message}</p>
            <p><strong>Submitted:</strong> ${new Date(claim.createdAt).toLocaleDateString()}</p>
          </div>
          
          <p>Please log in to your LostBuddy account to review this claim and take appropriate action.</p>
          
          <a href="${process.env.CLIENT_URL}/manage-claims" 
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin: 10px 0;">
            Review Claim
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Best regards,<br>
            The LostBuddy Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New claim notification sent to ${itemOwner.email}`);
  } catch (error) {
    console.error('Error sending new claim notification:', error);
  }
};

// Send email notification for claim approval
const sendClaimApprovedNotification = async (claimant, itemOwner, item) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@lostbuddy.com',
      to: claimant.email,
      subject: `Claim Approved - ${item.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Claim Approved! 🎉</h2>
          <p>Hello ${claimant.username},</p>
          <p>Great news! Your claim for the item "<strong>${item.title}</strong>" has been approved.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Contact Information:</h3>
            <p><strong>Item Owner:</strong> ${itemOwner.username}</p>
            <p><strong>Email:</strong> ${item.contactInfo?.email || itemOwner.email}</p>
            ${item.contactInfo?.phone ? `<p><strong>Phone:</strong> ${item.contactInfo.phone}</p>` : ''}
          </div>
          
          <p>Please contact the item owner to arrange pickup of your item.</p>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Next Steps:</h4>
            <ol>
              <li>Contact the owner using the information above</li>
              <li>Arrange a safe meeting place for pickup</li>
              <li>Verify the item matches your description</li>
              <li>Confirm pickup in the LostBuddy app</li>
            </ol>
          </div>
          
          <a href="${process.env.CLIENT_URL}/my-claims" 
             style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin: 10px 0;">
            View My Claims
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Best regards,<br>
            The LostBuddy Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Claim approved notification sent to ${claimant.email}`);
  } catch (error) {
    console.error('Error sending claim approved notification:', error);
  }
};

// Send email notification for claim rejection
const sendClaimRejectedNotification = async (claimant, item, rejectionReason) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@lostbuddy.com',
      to: claimant.email,
      subject: `Claim Update - ${item.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Claim Status Update</h2>
          <p>Hello ${claimant.username},</p>
          <p>Your claim for the item "<strong>${item.title}</strong>" has been reviewed.</p>
          
          <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #721c24;">Status: Rejected</h3>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
          </div>
          
          <p>Don't be discouraged! You can continue browsing other found items or submit more detailed claims in the future.</p>
          
          <a href="${process.env.CLIENT_URL}/browse" 
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin: 10px 0;">
            Browse More Items
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Best regards,<br>
            The LostBuddy Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Claim rejected notification sent to ${claimant.email}`);
  } catch (error) {
    console.error('Error sending claim rejected notification:', error);
  }
};

// Send match notification email
const sendMatchNotification = async (user, matchedItem, potentialMatches) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@lostbuddy.com',
      to: user.email,
      subject: `Potential Match Found - ${matchedItem.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ffc107;">Potential Match Found! 🔍</h2>
          <p>Hello ${user.username},</p>
          <p>Our smart matching system has found potential matches for your ${matchedItem.type} item "<strong>${matchedItem.title}</strong>".</p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Potential Matches Found: ${potentialMatches.length}</h3>
            <p>These items share similarities with your reported item and might be what you're looking for.</p>
          </div>
          
          <a href="${process.env.CLIENT_URL}/item/${matchedItem._id}" 
             style="display: inline-block; background: #ffc107; color: #212529; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin: 10px 0;">
            View Matches
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Best regards,<br>
            The LostBuddy Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Match notification sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending match notification:', error);
  }
};

// Send welcome email to new users
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@lostbuddy.com',
      to: user.email,
      subject: 'Welcome to LostBuddy!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Welcome to LostBuddy! 👋</h2>
          <p>Hello ${user.username},</p>
          <p>Thank you for joining LostBuddy - your trusted platform for reuniting lost items with their owners.</p>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Get Started:</h3>
            <ul>
              <li><strong>Lost something?</strong> Report it with details and photos</li>
              <li><strong>Found something?</strong> Help reunite it with the owner</li>
              <li><strong>Browse items</strong> in your area</li>
              <li><strong>Use smart matching</strong> to find potential matches</li>
            </ul>
          </div>
          
          <a href="${process.env.CLIENT_URL}/dashboard" 
             style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; margin: 10px 0;">
            Go to Dashboard
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Need help? Contact our support team at support@lostbuddy.com<br><br>
            Best regards,<br>
            The LostBuddy Team
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export {
  sendNewClaimNotification,
  sendClaimApprovedNotification,
  sendClaimRejectedNotification,
  sendMatchNotification,
  sendWelcomeEmail
};