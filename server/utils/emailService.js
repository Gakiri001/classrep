import { BrevoClient } from "@getbrevo/brevo";

export async function sendOtpEmail(email, otp) {
  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM)
    throw new Error("Email service is not configured");
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
  await client.transactionalEmails.sendTransacEmail({
    subject: "Your MSc Class Rep Selector sign-in code",
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#15233b"><h2>Sign in to the class rep selector</h2><p>Your verification code is:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2557a7">${otp}</p><p>This code expires in five minutes. Never share it with anyone.</p><p>If you did not request this code, you can ignore this email.</p></div>`,
    textContent: `Your MSc Class Rep Selector verification code is ${otp}. It expires in five minutes. Never share this code.`,
    sender: {
      name: process.env.EMAIL_FROM_NAME || "MSc Class Rep Selector",
      email: process.env.EMAIL_FROM,
    },
    to: [{ email }],
  });
}

export default sendOtpEmail;
