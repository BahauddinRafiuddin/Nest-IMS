import nodemailer from "nodemailer";

export class EmailService {
  async sendEmail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 2525,
      secure: false,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000
    });

    await transporter.sendMail({
      from: `"IMS Platform" <rafikamaan123@gmail.com>`,
      to,
      subject,
      html,
    });
  }
}