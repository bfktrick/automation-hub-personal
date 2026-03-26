import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailIntegrationService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.config.get<string>('SMTP_HOST');
    const smtpPort = this.config.get<number>('SMTP_PORT', 587);
    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPassword = this.config.get<string>('SMTP_PASSWORD');
    const smtpFrom = this.config.get<string>('SMTP_FROM', 'noreply@automation-hub.local');

    if (!smtpHost) {
      // If SMTP not configured, use no-op transporter
      this.transporter = null;
    } else {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: smtpUser
          ? {
              user: smtpUser,
              pass: smtpPassword,
            }
          : undefined,
      });
    }
  }

  async execute(config: any) {
    const { to, subject, body, cc, bcc } = config;

    if (!to || !subject || !body) {
      throw new Error('Email integration requires to, subject, and body');
    }

    if (!this.transporter) {
      return {
        to,
        subject,
        status: 'queued',
        message: 'Email queued (SMTP not configured - set SMTP_HOST in env)',
      };
    }

    try {
      const smtpFrom = this.config.get<string>('SMTP_FROM', 'noreply@automation-hub.local');

      const info = await this.transporter.sendMail({
        from: smtpFrom,
        to,
        cc,
        bcc,
        subject,
        html: body,
        text: body.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
      });

      return {
        to,
        subject,
        status: 'sent',
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Verify SMTP connection
  async verify(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      return false;
    }
  }
}
