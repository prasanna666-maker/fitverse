import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const brandHeader = `
  <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; text-align: center;">
    <h1 style="color: #f97316; font-family: Arial, sans-serif; font-size: 28px; margin: 0; letter-spacing: -1px;">
      Fit<span style="color: white;">verse</span>
    </h1>
    <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 13px; margin: 4px 0 0;">Chennai's #1 Gym Discovery Platform</p>
  </div>
`;

const brandFooter = `
  <div style="background: #0f172a; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
    <p style="color: #64748b; font-family: Arial, sans-serif; font-size: 12px; margin: 0;">
      © ${new Date().getFullYear()} Fitverse. All rights reserved. | Chennai, Tamil Nadu
    </p>
  </div>
`;

export const sendBookingConfirmation = async (userEmail, userName, booking, gymName) => {
  const html = `
    ${brandHeader}
    <div style="background: #f8fafc; padding: 32px;">
      <h2 style="color: #1e293b; font-family: Arial, sans-serif; font-size: 22px; margin: 0 0 8px;">
        🎉 Booking Confirmed!
      </h2>
      <p style="color: #475569; font-family: Arial, sans-serif; font-size: 15px; margin: 0 0 24px;">
        Hi ${userName}, your gym trial session has been successfully booked!
      </p>
      
      <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <h3 style="color: #f97316; font-family: Arial, sans-serif; font-size: 16px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; font-family: Arial, sans-serif; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Gym</td><td style="padding: 8px 0; color: #1e293b; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${gymName}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-family: Arial, sans-serif; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Date</td><td style="padding: 8px 0; color: #1e293b; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${new Date(booking.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-family: Arial, sans-serif; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Time Slot</td><td style="padding: 8px 0; color: #1e293b; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${booking.timeSlot}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-family: Arial, sans-serif; font-size: 14px;">Status</td><td style="padding: 8px 0; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;"><span style="background: #dcfce7; color: #16a34a; padding: 2px 10px; border-radius: 20px;">Confirmed ✓</span></td></tr>
        </table>
      </div>

      <div style="background: #fff7ed; border-radius: 12px; padding: 16px; border: 1px solid #fed7aa; margin-bottom: 24px;">
        <p style="color: #9a3412; font-family: Arial, sans-serif; font-size: 13px; margin: 0;">
          💡 <strong>Tip:</strong> Arrive 10 minutes early for your trial session. Bring comfortable workout clothes and a water bottle!
        </p>
      </div>

      <a href="http://localhost:5173/gyms" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold;">
        Explore More Gyms →
      </a>
    </div>
    ${brandFooter}
  `;

  try {
    await transporter.sendMail({
      from: `"Fitverse" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Booking Confirmed — ${gymName} Trial Session`,
      html,
    });
    console.log(`📧 Booking confirmation sent to ${userEmail}`);
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

export const sendPaymentConfirmation = async (userEmail, userName, gymName, plan, amount) => {
  const html = `
    ${brandHeader}
    <div style="background: #f8fafc; padding: 32px;">
      <h2 style="color: #1e293b; font-family: Arial, sans-serif; font-size: 22px; margin: 0 0 8px;">
        💳 Payment Successful!
      </h2>
      <p style="color: #475569; font-family: Arial, sans-serif; font-size: 15px; margin: 0 0 24px;">
        Hi ${userName}, your membership payment has been received. Welcome to the Fitverse family!
      </p>
      
      <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
        <h3 style="color: #f97316; font-family: Arial, sans-serif; font-size: 16px; margin: 0 0 16px;">Payment Receipt</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b; font-family: Arial, sans-serif; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Gym</td><td style="padding: 8px 0; color: #1e293b; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${gymName}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-family: Arial, sans-serif; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Plan</td><td style="padding: 8px 0; color: #1e293b; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; border-bottom: 1px solid #f1f5f9;">${plan} Membership</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-family: Arial, sans-serif; font-size: 14px;">Amount Paid</td><td style="padding: 8px 0; color: #16a34a; font-family: Arial, sans-serif; font-size: 18px; font-weight: bold;">₹${Number(amount).toLocaleString("en-IN")}</td></tr>
        </table>
      </div>

      <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold;">
        Go to Fitverse →
      </a>
    </div>
    ${brandFooter}
  `;

  try {
    await transporter.sendMail({
      from: `"Fitverse" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `💳 Payment Confirmed — ${gymName} ${plan} Membership`,
      html,
    });
    console.log(`📧 Payment confirmation sent to ${userEmail}`);
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};
