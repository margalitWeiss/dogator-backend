import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendVerificationEmail = async (to: string, token: string) => {
    const link = `http://localhost:5500/api/verify-email?token=${token}`;
    
    await resend.emails.send({
        from:`${process.env.EMAIL_FROM}`,
        to,
        subject: 'Verify your Dogator email',
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>Welcome to Dogator! 🐶</h2>
  <p>We're excited to have you join our community of dog lovers.</p>
  <p>To activate your account, please click the button below to verify your email address:</p>
  <p>
    <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color:#5A3E36; color: white; text-decoration: none; border-radius: 5px;">
      Verify My Email
    </a>
  </p>
  <p>This link will expire in 24 hours.</p>
  <p>If you didn’t sign up for Dogator, you can safely ignore this email.</p>
  <p>Thanks,<br/>The Dogator Team 🐾</p>
</div>
`
    });
};
