import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { createHash } from 'crypto';

@Injectable()
export class QRService {
  private logger = new Logger(QRService.name);

  async generateTicketQR(data: {
    ticketId: string;
    eventId: string;
    ticketPDA: string;
    owner: string;
    tier: string;
    eventDate: Date;
  }): Promise<{
    qrDataUrl: string;
    qrBuffer: Buffer;
    verificationCode: string;
  }> {
    try {
      // Create verification code (for offline validation)
      const verificationCode = this.generateVerificationCode(
        data.ticketPDA,
        data.owner,
        data.eventDate
      );

      // Create QR data payload
      const qrData = {
        v: 1, // Version
        t: data.ticketPDA, // Ticket PDA
        e: data.eventId, // Event ID
        o: data.owner.substring(0, 8), // Owner (truncated for size)
        c: verificationCode, // Offline verification code
        d: data.eventDate.getTime(), // Event timestamp
      };

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Generate QR code as buffer
      const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrData));

      this.logger.log(`Generated QR code for ticket ${data.ticketId}`);

      return {
        qrDataUrl,
        qrBuffer,
        verificationCode,
      };
    } catch (error) {
      this.logger.error(`Failed to generate QR code: ${error.message}`);
      throw error;
    }
  }

  async generateEventQR(eventId: string, eventPDA: string): Promise<string> {
    // Simple event QR for promotional purposes
    const eventUrl = `${process.env.FRONTEND_URL || 'https://tickettoken.io'}/events/${eventId}`;
    
    return QRCode.toDataURL(eventUrl);
  }

  validateQRData(qrData: string): {
    isValid: boolean;
    data?: any;
    error?: string;
  } {
    try {
      const parsed = JSON.parse(qrData);
      
      // Check required fields
      if (!parsed.v || !parsed.t || !parsed.e || !parsed.c) {
        return {
          isValid: false,
          error: 'Missing required fields',
        };
      }

      // Check version
      if (parsed.v !== 1) {
        return {
          isValid: false,
          error: 'Unsupported QR version',
        };
      }

      return {
        isValid: true,
        data: parsed,
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR format',
      };
    }
  }

  verifyOfflineCode(
    ticketPDA: string,
    owner: string,
    eventDate: Date,
    providedCode: string
  ): boolean {
    const expectedCode = this.generateVerificationCode(ticketPDA, owner, eventDate);
    return expectedCode === providedCode;
  }

  private generateVerificationCode(
    ticketPDA: string,
    owner: string,
    eventDate: Date
  ): string {
    // Create a deterministic code for offline validation
    const secret = process.env.QR_SECRET || 'default-secret-change-in-production';
    const data = `${ticketPDA}-${owner}-${eventDate.toISOString()}-${secret}`;
    const hash = createHash('sha256').update(data).digest('hex');
    
    // Return first 8 characters for brevity
    return hash.substring(0, 8).toUpperCase();
  }

  async generateBulkQRCodes(
    tickets: Array<{
      ticketId: string;
      eventId: string;
      ticketPDA: string;
      owner: string;
      tier: string;
      eventDate: Date;
    }>
  ): Promise<Map<string, { qrDataUrl: string; verificationCode: string }>> {
    const results = new Map();

    // Process in parallel but with concurrency limit
    const concurrency = 10;
    for (let i = 0; i < tickets.length; i += concurrency) {
      const batch = tickets.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(ticket => this.generateTicketQR(ticket))
      );

      batch.forEach((ticket, index) => {
        results.set(ticket.ticketId, {
          qrDataUrl: batchResults[index].qrDataUrl,
          verificationCode: batchResults[index].verificationCode,
        });
      });
    }

    return results;
  }
}
