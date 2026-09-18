import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable. Add it to .env.local");
    }
    client = new Resend(apiKey);
  }
  return client;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || "Safari Aunt Expedition <onboarding@resend.dev>";
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const verifyUrl = `${siteUrl}/verify-email?token=${token}`;

  const { error } = await getClient().emails.send({
    from: getFromAddress(),
    to,
    subject: "Verify your email — Safari Aunt Expedition",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1f2d20;">
        <h1 style="font-size: 20px;">Karibu, ${name.split(" ")[0]}!</h1>
        <p style="font-size: 14px; line-height: 1.6;">
          Thanks for creating an account with Safari Aunt Expedition. Please confirm
          your email address to activate your account.
        </p>
        <p style="margin: 28px 0;">
          <a href="${verifyUrl}"
             style="background:#1f2d20;color:#f5eee1;padding:12px 24px;border-radius:8px;
                    text-decoration:none;font-size:14px;font-weight:600;">
            Verify Email Address
          </a>
        </p>
        <p style="font-size: 12px; color: #6b6b6b;">
          This link expires in 24 hours. If you didn't create this account, you can
          safely ignore this email.
        </p>
        <p style="font-size: 12px; color: #6b6b6b;">
          Or paste this into your browser: ${verifyUrl}
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error (verification email):", error);
    throw new Error("Failed to send verification email");
  }
}