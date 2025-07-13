import twilio from 'twilio';
import nodemailer from 'nodemailer';

/**
 * Service for generating one-time passwords (OTPs) and sending them to users.
 * The OTP is attempted to be sent via SMS first. If SMS fails, an email is sent
 * as a fallback mechanism.
 */
export class OTPService {
  private twilioClient;
  private emailTransporter;

  constructor() {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    this.twilioClient = twilio(TWILIO_ACCOUNT_SID ?? '', TWILIO_AUTH_TOKEN ?? '');

    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Generates a numeric OTP of the given length.
   */
  generateOTP(length = 6): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  /**
   * Sends an OTP to the provided phone number. Falls back to email if the SMS
   * fails to send. Returns the generated OTP so callers can verify user input
   * later in the flow.
   */
  async sendOTP(phone: string, email: string): Promise<string> {
    const otp = this.generateOTP();
    try {
      await this.twilioClient.messages.create({
        body: `Your verification code is ${otp}`,
        from: process.env.TWILIO_FROM,
        to: phone,
      });
    } catch (err) {
      await this.emailTransporter.sendMail({
        to: email,
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? '',
        subject: 'Verification code',
        text: `Your verification code is ${otp}`,
      });
    }
    return otp;
  }
}
