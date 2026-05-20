const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "HealthLense <noreply@healthlense.app>";


const sendWelcomeEmail = async ({ name, email }) => {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to HealthLense",
      text: `Hi ${name},
             \n\nYour HealthLense account is ready.
             \n\nYou can now analyze medical reports, check symptoms, and find nearby labs.
             \n\nOpen the app: ${process.env.CLIENT_URL || "https://healthlense.app"}\n\n— HealthLense Team`,
    });
  } catch (err) {
    console.warn("Welcome email failed:", err.message);
  }
};


const sendAdminSignupNotification = async ({ name, email }) => {
  if (!ADMIN_EMAIL) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[HealthLense] New signup — ${name}`,
      text: `New user registered.
             \n\nName: ${name}
                \nEmail: ${email}
                \nTime: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`,
    });
  } catch (err) {
    console.warn("Admin notification email failed:", err.message);
  }
};


module.exports = { sendWelcomeEmail, sendAdminSignupNotification };