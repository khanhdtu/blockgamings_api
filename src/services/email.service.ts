import {bind, BindingScope} from '@loopback/core';
import {createTransport, SentMessageInfo} from 'nodemailer';
import {User, Email, EmailTemplate} from '../models';

@bind({scope: BindingScope.TRANSIENT})
export class EmailService {
  private static async setupTransporter() {
    return createTransport({
      host: process.env.SMTP_SERVER ?? 'smtp.googlemail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendResetPasswordMail(user: User, code: string): Promise<SentMessageInfo> {
    try {
      const transporter = await EmailService.setupTransporter();
      const emailTemplate = new EmailTemplate({
        to: user.email,
        subject: '[SonicX] Reset Password Request',
        html: `
          <div>
            <p>Hello, ${user.username}</p>
            <p style="color: red;">We received a request to reset the password for your account with email address: ${user.email}</p>
            <p>To reset your password click on the link provided below</p>
            <a href="${process.env.APPLICATION_URL}/reset-password?resetCode=${code}">Reset your password link</a>
            <p>If you didn’t request to reset your password, please ignore this email or reset your password to protect your account.</p>
            <p>Thanks</p>
            <p>LoopBack'ers at SonicX</p>
          </div>
        `,
      });
      return await transporter.sendMail(emailTemplate);
    } catch (error) {
      return error
    }
  }

  async sendCreateAccountConfirmationMail(user: User, code: string): Promise<SentMessageInfo> {
    try {
      const transporter = await EmailService.setupTransporter();
      const emailTemplate = new EmailTemplate({
        to: user.email,
        subject: '[SonicX] Create Account Confirmation',
        html: `
          <div>
            <p>Hello, ${user.username}</p>
            <p style="color: red;">We received a request to create a new account with email address: ${user.email}</p>
            <p>To confirm creating please click on the link provided below</p>
            <a href="${process.env.APPLICATION_URL}/sign-up?username=${user.username}&email=${user.email}&code=${code}">Confirm your account link</a>
            <p>If you didn’t request to create account, please ignore this email</p>
            <p>Thanks</p>
            <p>LoopBack'ers at SonicX</p>
          </div>
        `,
      });
      return await transporter.sendMail(emailTemplate);
    } catch (error) {
      return error
    }
  }
}
