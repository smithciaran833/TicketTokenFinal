# 🔌 Backend Integration Guide - Solana NFT Ticketing System

## Overview
This guide explains how to integrate the Solana NFT Ticketing smart contract with backend services for a complete ticketing platform.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Required Services](#required-services)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Integration Patterns](#integration-patterns)
- [Code Examples](#code-examples)
- [Best Practices](#best-practices)

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend App  │────▶│   Backend API   │────▶│ Solana Program  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    Database     │
                        │  (PostgreSQL)   │
                        └─────────────────┘
```

## Required Services

### 1. Event Service
Manages event lifecycle and metadata.

```typescript
// services/event-service/src/EventService.ts
export class EventService {
  async createEvent(data: CreateEventDto): Promise<Event> {
    // 1. Validate input
    const validated = await this.validateEventData(data);
    
    // 2. Generate event ID
    const eventId = new BN(Date.now());
    
    // 3. Call Solana program
    const tx = await this.program.methods
      .createEvent(
        validated.name,
        validated.venue,
        validated.startTime,
        validated.capacity,
        validated.generalPrice,
        validated.vipPrice
      )
      .accounts({
        event: this.deriveEventPDA(eventId),
        authority: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    // 4. Store in database
    const event = await this.eventRepository.create({
      eventId: eventId.toString(),
      transactionHash: tx,
      ...validated,
      status: 'ACTIVE'
    });
    
    // 5. Emit event for other services
    await this.eventBus.emit('event.created', event);
    
    return event;
  }
  
  async updateEventMetadata(eventId: string, metadata: UpdateEventDto) {
    // Update off-chain data (images, descriptions, etc.)
    await this.eventRepository.update(eventId, metadata);
    
    // Update on-chain data if needed
    if (metadata.venue || metadata.pricing) {
      await this.updateOnChain(eventId, metadata);
    }
  }
}
```

### 2. Ticket Service
Handles ticket minting, delivery, and management.

```typescript
// services/ticket-service/src/TicketService.ts
export class TicketService {
  async mintTicket(request: MintTicketRequest): Promise<Ticket> {
    // 1. Check inventory
    const available = await this.checkAvailability(
      request.eventId,
      request.tier
    );
    
    if (!available) {
      throw new Error('Tickets sold out');
    }
    
    // 2. Process payment
    const payment = await this.paymentService.processPayment({
      amount: request.tier === 'vip' ? event.vipPrice : event.generalPrice,
      currency: 'USD',
      method: request.paymentMethod
    });
    
    // 3. Mint on blockchain
    const ticketId = await this.getNextTicketId(request.eventId);
    const tx = await this.program.methods
      .mintTicket(request.tier)
      .accounts({
        ticket: this.deriveTicketPDA(request.eventId, ticketId),
        event: this.deriveEventPDA(request.eventId),
        buyer: new PublicKey(request.buyerWallet),
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    // 4. Generate QR code
    const qrCode = await this.generateQRCode({
      ticketId,
      eventId: request.eventId,
      signature: tx
    });
    
    // 5. Store ticket record
    const ticket = await this.ticketRepository.create({
      ticketId,
      eventId: request.eventId,
      owner: request.buyerWallet,
      tier: request.tier,
      purchasePrice: payment.amount,
      transactionHash: tx,
      qrCode,
      status: 'VALID'
    });
    
    // 6. Send confirmation
    await this.emailService.sendTicketConfirmation({
      email: request.buyerEmail,
      ticket,
      qrCode
    });
    
    return ticket;
  }
  
  async batchMint(request: BatchMintRequest): Promise<Ticket[]> {
    // Validate batch size
    if (request.quantity > 100) {
      throw new Error('Maximum 100 tickets per batch');
    }
    
    // Process batch mint
    const tickets = [];
    for (let i = 0; i < request.quantity; i++) {
      const ticket = await this.mintTicket({
        ...request,
        batchIndex: i
      });
      tickets.push(ticket);
    }
    
    return tickets;
  }
}
```

### 3. Transfer Service
Manages ticket transfers and delegate transfers.

```typescript
// services/transfer-service/src/TransferService.ts
export class TransferService {
  async initiateTransfer(request: TransferRequest): Promise<Transfer> {
    // Direct transfer
    if (request.recipientWallet) {
      return this.directTransfer(request);
    }
    
    // Delegate transfer for email
    if (request.recipientEmail) {
      return this.delegateTransfer(request);
    }
  }
  
  private async delegateTransfer(request: TransferRequest) {
    // 1. Hash email
    const emailHash = crypto
      .createHash('sha256')
      .update(request.recipientEmail)
      .digest();
    
    // 2. Create delegate authority
    const tx = await this.program.methods
      .initializeDelegateTransfer(
        [...emailHash],
        24 // 24 hour expiry
      )
      .accounts({
        ticket: this.deriveTicketPDA(request.eventId, request.ticketId),
        event: this.deriveEventPDA(request.eventId),
        delegateAuthority: this.deriveDelegatePDA(ticketPDA),
        owner: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    // 3. Get claim code from transaction
    const claimCode = await this.extractClaimCode(tx);
    
    // 4. Create transfer record
    const transfer = await this.transferRepository.create({
      ticketId: request.ticketId,
      fromWallet: request.fromWallet,
      toEmail: request.recipientEmail,
      emailHash: emailHash.toString('hex'),
      claimCode: claimCode.toString('hex'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'PENDING'
    });
    
    // 5. Send claim email
    await this.emailService.sendClaimEmail({
      email: request.recipientEmail,
      claimLink: `${process.env.APP_URL}/claim/${transfer.id}`,
      eventName: event.name,
      senderName: request.senderName
    });
    
    return transfer;
  }
  
  async claimTicket(claimRequest: ClaimRequest): Promise<Ticket> {
    // 1. Verify transfer record
    const transfer = await this.transferRepository.findOne(claimRequest.transferId);
    
    if (transfer.status !== 'PENDING') {
      throw new Error('Transfer already claimed or expired');
    }
    
    // 2. Verify email
    const emailHash = crypto
      .createHash('sha256')
      .update(claimRequest.email)
      .digest();
    
    if (emailHash.toString('hex') !== transfer.emailHash) {
      throw new Error('Invalid email');
    }
    
    // 3. Complete on-chain transfer
    const tx = await this.program.methods
      .completeDelegateTransfer(
        [...emailHash],
        Buffer.from(transfer.claimCode, 'hex')
      )
      .accounts({
        ticket: this.deriveTicketPDA(transfer.eventId, transfer.ticketId),
        event: this.deriveEventPDA(transfer.eventId),
        delegateAuthority: this.deriveDelegatePDA(ticketPDA),
        newOwner: new PublicKey(claimRequest.walletAddress),
        originalOwner: new PublicKey(transfer.fromWallet),
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    // 4. Update records
    await this.transferRepository.update(transfer.id, {
      status: 'COMPLETED',
      completedAt: new Date(),
      toWallet: claimRequest.walletAddress
    });
    
    await this.ticketRepository.update(transfer.ticketId, {
      owner: claimRequest.walletAddress
    });
    
    return this.ticketRepository.findOne(transfer.ticketId);
  }
}
```

### 4. Validation Service
Handles entry validation and gate management.

```typescript
// services/validation-service/src/ValidationService.ts
export class ValidationService {
  async validateTicket(validationRequest: ValidationRequest): Promise<ValidationResult> {
    try {
      // 1. Parse QR code
      const qrData = await this.parseQRCode(validationRequest.qrCode);
      
      // 2. Verify ticket exists
      const ticket = await this.ticketRepository.findOne(qrData.ticketId);
      if (!ticket) {
        return { valid: false, reason: 'Ticket not found' };
      }
      
      // 3. Check on-chain status
      const ticketAccount = await this.program.account.ticket.fetch(
        this.deriveTicketPDA(ticket.eventId, ticket.ticketId)
      );
      
      if (ticketAccount.used) {
        return { valid: false, reason: 'Ticket already used' };
      }
      
      if (ticketAccount.isFrozen) {
        return { valid: false, reason: 'Ticket frozen - security issue' };
      }
      
      // 4. Validate entry on-chain
      const tx = await this.program.methods
        .validateEntry(
          validationRequest.gateId,
          { entry: {} } // ValidationType::Entry
        )
        .accounts({
          ticket: this.deriveTicketPDA(ticket.eventId, ticket.ticketId),
          event: this.deriveEventPDA(ticket.eventId),
          validationRecord: this.deriveValidationPDA(ticketPDA, Date.now()),
          validator: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      // 5. Store validation record
      await this.validationRepository.create({
        ticketId: ticket.ticketId,
        gateId: validationRequest.gateId,
        validatorId: validationRequest.staffId,
        timestamp: new Date(),
        type: 'ENTRY',
        transactionHash: tx
      });
      
      // 6. Return success with holder info
      return {
        valid: true,
        ticket: {
          id: ticket.ticketId,
          tier: ticket.tier,
          holderName: ticket.holderName // From DB
        },
        message: 'Entry granted'
      };
      
    } catch (error) {
      console.error('Validation error:', error);
      return {
        valid: false,
        reason: 'Validation failed',
        error: error.message
      };
    }
  }
  
  // Offline validation support
  async validateOffline(request: OfflineValidationRequest): Promise<void> {
    // Store validation for later sync
    await this.offlineQueue.add({
      ...request,
      timestamp: new Date(),
      status: 'PENDING_SYNC'
    });
  }
  
  async syncOfflineValidations(): Promise<void> {
    const pending = await this.offlineQueue.getPending();
    
    for (const validation of pending) {
      try {
        await this.validateTicket(validation);
        await this.offlineQueue.markComplete(validation.id);
      } catch (error) {
        await this.offlineQueue.markFailed(validation.id, error);
      }
    }
  }
}
```

### 5. Payment Service
Handles fiat payments and blockchain interactions.

```typescript
// services/payment-service/src/PaymentService.ts
export class PaymentService {
  async processPayment(request: PaymentRequest): Promise<Payment> {
    // Stripe integration
    if (request.method === 'card') {
      const intent = await stripe.paymentIntents.create({
        amount: request.amount * 100, // Convert to cents
        currency: request.currency,
        metadata: {
          eventId: request.eventId,
          ticketTier: request.tier,
          buyerEmail: request.buyerEmail
        }
      });
      
      // Store payment record
      return this.paymentRepository.create({
        externalId: intent.id,
        amount: request.amount,
        currency: request.currency,
        status: 'PENDING',
        metadata: request
      });
    }
    
    // Crypto payment
    if (request.method === 'sol') {
      return this.processCryptoPayment(request);
    }
  }
  
  async handleWebhook(event: StripeEvent): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data);
        break;
      case 'payment_intent.failed':
        await this.handlePaymentFailure(event.data);
        break;
    }
  }
  
  private async handlePaymentSuccess(data: any) {
    // 1. Update payment record
    const payment = await this.paymentRepository.findByExternalId(data.id);
    payment.status = 'COMPLETED';
    await payment.save();
    
    // 2. Trigger ticket minting
    await this.eventBus.emit('payment.completed', {
      paymentId: payment.id,
      metadata: payment.metadata
    });
  }
}
```

## Database Schema

### PostgreSQL Schema

```sql
-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(64) UNIQUE NOT NULL, -- Blockchain event ID
  name VARCHAR(255) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  capacity INTEGER NOT NULL,
  tickets_sold INTEGER DEFAULT 0,
  general_price DECIMAL(10,2) NOT NULL,
  vip_price DECIMAL(10,2) NOT NULL,
  organizer_wallet VARCHAR(64) NOT NULL,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id VARCHAR(64) UNIQUE NOT NULL,
  event_id VARCHAR(64) NOT NULL REFERENCES events(event_id),
  owner_wallet VARCHAR(64) NOT NULL,
  owner_email VARCHAR(255),
  tier VARCHAR(32) NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  qr_code TEXT NOT NULL,
  metadata_uri VARCHAR(500),
  status VARCHAR(32) DEFAULT 'VALID',
  used BOOLEAN DEFAULT FALSE,
  frozen BOOLEAN DEFAULT FALSE,
  transaction_hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transfers table
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id VARCHAR(64) NOT NULL REFERENCES tickets(ticket_id),
  from_wallet VARCHAR(64) NOT NULL,
  to_wallet VARCHAR(64),
  to_email VARCHAR(255),
  email_hash VARCHAR(64),
  claim_code VARCHAR(32),
  type VARCHAR(32) NOT NULL, -- 'DIRECT' or 'DELEGATE'
  status VARCHAR(32) DEFAULT 'PENDING',
  expires_at TIMESTAMP,
  completed_at TIMESTAMP,
  transaction_hash VARCHAR(128),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Validations table
CREATE TABLE validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id VARCHAR(64) NOT NULL REFERENCES tickets(ticket_id),
  gate_id VARCHAR(64) NOT NULL,
  validator_id UUID NOT NULL,
  validation_type VARCHAR(32) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  transaction_hash VARCHAR(128),
  offline BOOLEAN DEFAULT FALSE,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR(128) UNIQUE,
  ticket_id VARCHAR(64) REFERENCES tickets(ticket_id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  method VARCHAR(32) NOT NULL,
  status VARCHAR(32) DEFAULT 'PENDING',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_owner_wallet ON tickets(owner_wallet);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_transfers_ticket_id ON transfers(ticket_id);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_validations_ticket_id ON validations(ticket_id);
CREATE INDEX idx_validations_timestamp ON validations(timestamp);
```

## API Endpoints

### Event Endpoints

```typescript
// POST /api/events
router.post('/events', authenticate, async (req, res) => {
  const event = await eventService.createEvent({
    ...req.body,
    organizerWallet: req.user.wallet
  });
  res.json(event);
});

// GET /api/events
router.get('/events', async (req, res) => {
  const events = await eventService.findAll({
    status: 'ACTIVE',
    startTime: { $gte: new Date() },
    ...req.query
  });
  res.json(events);
});

// GET /api/events/:id
router.get('/events/:id', async (req, res) => {
  const event = await eventService.findById(req.params.id);
  res.json(event);
});

// PUT /api/events/:id
router.put('/events/:id', authenticate, authorize('organizer'), async (req, res) => {
  const event = await eventService.update(req.params.id, req.body);
  res.json(event);
});
```

### Ticket Endpoints

```typescript
// POST /api/tickets/mint
router.post('/tickets/mint', authenticate, async (req, res) => {
  const ticket = await ticketService.mintTicket({
    ...req.body,
    buyerWallet: req.user.wallet,
    buyerEmail: req.user.email
  });
  res.json(ticket);
});

// POST /api/tickets/batch-mint
router.post('/tickets/batch-mint', authenticate, async (req, res) => {
  const tickets = await ticketService.batchMint(req.body);
  res.json(tickets);
});

// GET /api/tickets/my
router.get('/tickets/my', authenticate, async (req, res) => {
  const tickets = await ticketService.findByOwner(req.user.wallet);
  res.json(tickets);
});

// POST /api/tickets/:id/transfer
router.post('/tickets/:id/transfer', authenticate, async (req, res) => {
  const transfer = await transferService.initiateTransfer({
    ticketId: req.params.id,
    fromWallet: req.user.wallet,
    ...req.body
  });
  res.json(transfer);
});

// POST /api/tickets/claim
router.post('/tickets/claim', async (req, res) => {
  const ticket = await transferService.claimTicket(req.body);
  res.json(ticket);
});
```

### Validation Endpoints

```typescript
// POST /api/validate
router.post('/validate', authenticate, authorize('validator'), async (req, res) => {
  const result = await validationService.validateTicket({
    ...req.body,
    staffId: req.user.id
  });
  res.json(result);
});

// POST /api/validate/offline
router.post('/validate/offline', authenticate, authorize('validator'), async (req, res) => {
  await validationService.validateOffline(req.body);
  res.json({ status: 'queued' });
});

// POST /api/validate/sync
router.post('/validate/sync', authenticate, authorize('validator'), async (req, res) => {
  const results = await validationService.syncOfflineValidations();
  res.json(results);
});
```

## Integration Patterns

### 1. Event Creation Flow

```typescript
class EventController {
  async create(req: Request, res: Response) {
    try {
      // 1. Start database transaction
      const dbTx = await db.transaction();
      
      try {
        // 2. Create blockchain event
        const eventId = new BN(Date.now());
        const blockchainTx = await this.solanaService.createEvent({
          eventId,
          ...req.body
        });
        
        // 3. Wait for confirmation
        await this.solanaService.confirmTransaction(blockchainTx);
        
        // 4. Store in database
        const event = await this.eventService.create({
          eventId: eventId.toString(),
          transactionHash: blockchainTx,
          ...req.body
        }, dbTx);
        
        // 5. Upload metadata to IPFS/Arweave
        const metadataUri = await this.storageService.uploadMetadata({
          name: event.name,
          description: event.description,
          image: event.imageUrl,
          attributes: {
            venue: event.venue,
            date: event.startTime,
            capacity: event.capacity
          }
        });
        
        // 6. Update event with metadata URI
        await this.eventService.update(event.id, { metadataUri }, dbTx);
        
        // 7. Commit transaction
        await dbTx.commit();
        
        res.json({ success: true, event });
        
      } catch (error) {
        await dbTx.rollback();
        throw error;
      }
      
    } catch (error) {
      console.error('Event creation failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
```

### 2. Ticket Purchase Flow

```typescript
class PurchaseFlow {
  async execute(request: PurchaseRequest): Promise<Ticket> {
    // 1. Reserve inventory
    const reservation = await this.inventoryService.reserve({
      eventId: request.eventId,
      tier: request.tier,
      quantity: 1,
      duration: 300 // 5 minutes
    });
    
    try {
      // 2. Process payment
      const payment = await this.paymentService.process({
        amount: this.calculatePrice(request),
        method: request.paymentMethod,
        metadata: { reservationId: reservation.id }
      });
      
      // 3. Wait for payment confirmation
      await this.waitForPayment(payment.id);
      
      // 4. Mint ticket on blockchain
      const ticket = await this.ticketService.mint({
        ...request,
        paymentId: payment.id
      });
      
      // 5. Generate assets
      const assets = await Promise.all([
        this.qrService.generate(ticket),
        this.pdfService.generateTicket(ticket),
        this.walletService.createPass(ticket)
      ]);
      
      // 6. Deliver to customer
      await this.deliveryService.send({
        email: request.email,
        ticket,
        assets
      });
      
      // 7. Release reservation
      await this.inventoryService.confirm(reservation.id);
      
      return ticket;
      
    } catch (error) {
      // Rollback on failure
      await this.inventoryService.release(reservation.id);
      await this.paymentService.refund(payment.id);
      throw error;
    }
  }
}
```

### 3. Validation Flow with Offline Support

```typescript
class GateValidator {
  async validate(qrCode: string): Promise<ValidationResult> {
    // Try online validation first
    if (await this.networkService.isOnline()) {
      try {
        return await this.onlineValidation(qrCode);
      } catch (error) {
        console.warn('Online validation failed, falling back to offline');
      }
    }
    
    // Offline validation
    return this.offlineValidation(qrCode);
  }
  
  private async offlineValidation(qrCode: string): Promise<ValidationResult> {
    // 1. Parse QR data
    const data = this.parseQR(qrCode);
    
    // 2. Check local cache
    const cached = await this.cache.get(`ticket:${data.ticketId}`);
    
    if (!cached) {
      return { valid: false, reason: 'Ticket not in cache' };
    }
    
    // 3. Check if already validated offline
    const previousValidation = await this.offlineStore.find({
      ticketId: data.ticketId,
      type: 'ENTRY'
    });
    
    if (previousValidation) {
      return { valid: false, reason: 'Already validated offline' };
    }
    
    // 4. Store offline validation
    await this.offlineStore.add({
      ticketId: data.ticketId,
      timestamp: Date.now(),
      gateId: this.gateId,
      type: 'ENTRY'
    });
    
    // 5. Queue for sync
    await this.syncQueue.add({
      type: 'VALIDATION',
      data: {
        ticketId: data.ticketId,
        gateId: this.gateId,
        timestamp: Date.now()
      }
    });
    
    return {
      valid: true,
      offline: true,
      ticket: cached
    };
  }
}
```

## Best Practices

### 1. Transaction Management
```typescript
// Always use database transactions with blockchain operations
async function mintWithTransaction() {
  const dbTx = await db.transaction();
  
  try {
    // Database operations
    const record = await createRecord(data, dbTx);
    
    // Blockchain operation
    const blockchainTx = await program.methods.mintTicket().rpc();
    
    // Wait for confirmation
    await connection.confirmTransaction(blockchainTx);
    
    // Update database with tx hash
    await updateRecord(record.id, { txHash: blockchainTx }, dbTx);
    
    await dbTx.commit();
  } catch (error) {
    await dbTx.rollback();
    throw error;
  }
}
```

### 2. Error Handling
```typescript
class BlockchainService {
  async executeWithRetry(operation: () => Promise<any>, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (this.isRetryableError(error)) {
          await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }
  
  private isRetryableError(error: any): boolean {
    return error.message.includes('blockhash not found') ||
           error.message.includes('node is behind') ||
           error.code === 'ECONNRESET';
  }
}
```

### 3. Caching Strategy
```typescript
class TicketCache {
  async get(ticketId: string): Promise<Ticket | null> {
    // L1: Memory cache
    const memory = this.memoryCache.get(ticketId);
    if (memory) return memory;
    
    // L2: Redis cache
    const redis = await this.redis.get(`ticket:${ticketId}`);
    if (redis) {
      const ticket = JSON.parse(redis);
      this.memoryCache.set(ticketId, ticket);
      return ticket;
    }
    
    // L3: Database
    const db = await this.db.findOne({ ticketId });
    if (db) {
      await this.cache(ticketId, db);
      return db;
    }
    
    // L4: Blockchain
    const blockchain = await this.fetchFromBlockchain(ticketId);
    if (blockchain) {
      await this.sync(ticketId, blockchain);
      return blockchain;
    }
    
    return null;
  }
}
```

### 4. Monitoring
```typescript
class MetricsCollector {
  trackBlockchainOperation(operation: string, duration: number, success: boolean) {
    this.metrics.histogram('blockchain.operation.duration', duration, {
      operation,
      success: success.toString()
    });
    
    this.metrics.increment('blockchain.operation.count', {
      operation,
      status: success ? 'success' : 'failure'
    });
  }
  
  trackValidation(result: ValidationResult) {
    this.metrics.increment('ticket.validation', {
      valid: result.valid.toString(),
      offline: result.offline?.toString() || 'false',
      gate: result.gateId
    });
    
    if (!result.valid) {
      this.alerts.send('validation.failed', {
        reason: result.reason,
        ticketId: result.ticketId,
        timestamp: new Date()
      });
    }
  }
}
```

### 5. Security Considerations

```typescript
// Wallet Authentication
class WalletAuth {
  async authenticate(request: AuthRequest): Promise<User> {
    // 1. Verify signature
    const message = `Sign this message to authenticate: ${request.nonce}`;
    const verified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(request.signature),
      bs58.decode(request.publicKey)
    );
    
    if (!verified) {
      throw new UnauthorizedException('Invalid signature');
    }
    
    // 2. Check nonce
    const validNonce = await this.nonceService.verify(
      request.publicKey,
      request.nonce
    );
    
    if (!validNonce) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }
    
    // 3. Get or create user
    let user = await this.userRepository.findByWallet(request.publicKey);
    
    if (!user) {
      user = await this.userRepository.create({
        wallet: request.publicKey,
        roles: ['ticket_holder']
      });
    }
    
    // 4. Generate JWT
    const token = jwt.sign(
      { 
        wallet: user.wallet,
        roles: user.roles 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return { user, token };
  }
}

// API Rate Limiting
const rateLimiter = {
  mint: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 mints per minute
    message: 'Too many mint requests'
  }),
  
  validate: rateLimit({
    windowMs: 1000, // 1 second
    max: 5, // 5 validations per second per gate
    keyGenerator: (req) => `${req.user.id}:${req.body.gateId}`
  })
};

// Input Sanitization
class InputValidator {
  validateEventCreation(data: any) {
    const schema = Joi.object({
      name: Joi.string().max(100).required(),
      venue: Joi.string().max(100).required(),
      description: Joi.string().max(1000).optional(),
      startTime: Joi.date().min('now').required(),
      endTime: Joi.date().greater(Joi.ref('startTime')).required(),
      capacity: Joi.number().integer().min(1).max(100000).required(),
      generalPrice: Joi.number().min(0).required(),
      vipPrice: Joi.number().min(0).required()
    });
    
    return schema.validate(data);
  }
}
```

## Environment Configuration

```bash
# .env.example
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.yourticketingapp.com

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm
SOLANA_WALLET_PRIVATE_KEY=your-base58-private-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ticketing_db
REDIS_URL=redis://localhost:6379

# Storage
IPFS_API_URL=https://ipfs.infura.io:5001
ARWEAVE_WALLET_PATH=./arweave-wallet.json

# Payment
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# Email
SENDGRID_API_KEY=SG....
EMAIL_FROM=tickets@yourapp.com

# Security
JWT_SECRET=your-long-random-secret
ENCRYPTION_KEY=your-32-byte-key

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
DATADOG_API_KEY=...
```

## Deployment Architecture

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/ticketing
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  worker:
    build: ./backend
    command: npm run worker
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/ticketing
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=ticketing
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Monitoring & Observability

```typescript
// Logging Setup
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'ticketing-logs'
    })
  ]
});

// Trace Blockchain Operations
class BlockchainTracer {
  async traceOperation(operation: string, fn: () => Promise<any>) {
    const span = this.tracer.startSpan(`blockchain.${operation}`);
    
    try {
      const start = Date.now();
      const result = await fn();
      const duration = Date.now() - start;
      
      span.setAttributes({
        'blockchain.operation': operation,
        'blockchain.duration': duration,
        'blockchain.success': true
      });
      
      logger.info(`Blockchain operation completed`, {
        operation,
        duration,
        result: result.substring(0, 64) // Transaction signature
      });
      
      return result;
    } catch (error) {
      span.setAttributes({
        'blockchain.operation': operation,
        'blockchain.success': false,
        'blockchain.error': error.message
      });
      
      logger.error(`Blockchain operation failed`, {
        operation,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    } finally {
      span.end();
    }
  }
}

// Health Checks
class HealthChecker {
  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkBlockchain(),
      this.checkPaymentProvider(),
      this.checkEmailService()
    ]);
    
    const status = {
      healthy: checks.every(c => c.status === 'fulfilled'),
      timestamp: new Date(),
      services: {
        database: this.getStatus(checks[0]),
        redis: this.getStatus(checks[1]),
        blockchain: this.getStatus(checks[2]),
        payments: this.getStatus(checks[3]),
        email: this.getStatus(checks[4])
      }
    };
    
    return status;
  }
  
  private async checkBlockchain(): Promise<void> {
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    const slot = await connection.getSlot();
    
    if (!slot) {
      throw new Error('Cannot connect to Solana RPC');
    }
  }
}
```

## Performance Optimization

```typescript
// Batch Operations
class BatchProcessor {
  private queue: Map<string, any[]> = new Map();
  
  async addToQueue(type: string, item: any) {
    if (!this.queue.has(type)) {
      this.queue.set(type, []);
    }
    
    this.queue.get(type).push(item);
    
    // Process when batch is full or after timeout
    if (this.queue.get(type).length >= 100) {
      await this.processBatch(type);
    }
  }
  
  async processBatch(type: string) {
    const items = this.queue.get(type) || [];
    if (items.length === 0) return;
    
    this.queue.set(type, []);
    
    switch (type) {
      case 'ticket-mint':
        await this.batchMintTickets(items);
        break;
      case 'validation-sync':
        await this.batchSyncValidations(items);
        break;
    }
  }
  
  private async batchMintTickets(requests: MintRequest[]) {
    // Group by event
    const grouped = _.groupBy(requests, 'eventId');
    
    for (const [eventId, group] of Object.entries(grouped)) {
      try {
        // Call batch mint instruction
        const tickets = await this.program.methods
          .batchMint(group[0].tier, group.length)
          .accounts({
            event: this.deriveEventPDA(eventId),
            buyer: this.wallet.publicKey,
            systemProgram: SystemProgram.programId
          })
          .rpc();
        
        // Distribute tickets to buyers
        for (let i = 0; i < group.length; i++) {
          await this.assignTicket(tickets[i], group[i].buyer);
        }
      } catch (error) {
        // Handle individual failures
        for (const request of group) {
          await this.handleMintFailure(request, error);
        }
      }
    }
  }
}

// Caching Strategy
class CacheManager {
  constructor(
    private memory: NodeCache,
    private redis: Redis,
    private cacheConfig: CacheConfig
  ) {}
  
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // L1: Memory cache (instant)
    const memoryValue = this.memory.get<T>(key);
    if (memoryValue) {
      this.metrics.increment('cache.hit', { level: 'memory' });
      return memoryValue;
    }
    
    // L2: Redis cache (fast)
    const redisValue = await this.redis.get(key);
    if (redisValue) {
      const parsed = JSON.parse(redisValue) as T;
      this.memory.set(key, parsed, this.cacheConfig.memoryTTL);
      this.metrics.increment('cache.hit', { level: 'redis' });
      return parsed;
    }
    
    // L3: Fetch from source (slow)
    this.metrics.increment('cache.miss');
    const value = await fetcher();
    
    // Cache in both layers
    await this.set(key, value);
    
    return value;
  }
  
  async set<T>(key: string, value: T): Promise<void> {
    // Set in memory with shorter TTL
    this.memory.set(key, value, this.cacheConfig.memoryTTL);
    
    // Set in Redis with longer TTL
    await this.redis.setex(
      key,
      this.cacheConfig.redisTTL,
      JSON.stringify(value)
    );
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Clear memory cache
    const memoryKeys = this.memory.keys().filter(k => k.includes(pattern));
    memoryKeys.forEach(k => this.memory.del(k));
    
    // Clear Redis cache
    const redisKeys = await this.redis.keys(`*${pattern}*`);
    if (redisKeys.length > 0) {
      await this.redis.del(...redisKeys);
    }
  }
}
```

## Testing Strategy

```typescript
// Integration Tests
describe('Ticket Purchase Flow', () => {
  let app: Application;
  let connection: Connection;
  let program: Program;
  
  beforeAll(async () => {
    app = await createTestApp();
    connection = new Connection('http://localhost:8899');
    program = await loadProgram(connection);
  });
  
  it('should complete full purchase flow', async () => {
    // 1. Create event
    const eventResponse = await request(app)
      .post('/api/events')
      .send({
        name: 'Test Concert',
        venue: 'Test Venue',
        startTime: new Date(Date.now() + 86400000),
        capacity: 100,
        generalPrice: 50
      })
      .expect(201);
    
    const eventId = eventResponse.body.eventId;
    
    // 2. Purchase ticket
    const purchaseResponse = await request(app)
      .post('/api/tickets/mint')
      .send({
        eventId,
        tier: 'general',
        paymentMethod: 'test-card'
      })
      .expect(201);
    
    const ticketId = purchaseResponse.body.ticketId;
    
    // 3. Verify on blockchain
    const ticketPDA = deriveTicketPDA(eventId, ticketId);
    const ticketAccount = await program.account.ticket.fetch(ticketPDA);
    
    expect(ticketAccount.owner.toString()).toBe(testWallet.publicKey.toString());
    expect(ticketAccount.used).toBe(false);
    
    // 4. Validate ticket
    const validationResponse = await request(app)
      .post('/api/validate')
      .send({
        qrCode: purchaseResponse.body.qrCode,
        gateId: 'main-entrance'
      })
      .expect(200);
    
    expect(validationResponse.body.valid).toBe(true);
    
    // 5. Verify validation on blockchain
    const updatedTicket = await program.account.ticket.fetch(ticketPDA);
    expect(updatedTicket.entryValidated).toBe(true);
  });
});

// Load Tests
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function() {
  // Browse events
  const eventsResponse = http.get(`${__ENV.API_URL}/api/events`);
  check(eventsResponse, {
    'events loaded': (r) => r.status === 200,
  });
  
  const events = JSON.parse(eventsResponse.body);
  if (events.length > 0) {
    // View event details
    const eventId = events[0].id;
    const eventResponse = http.get(`${__ENV.API_URL}/api/events/${eventId}`);
    check(eventResponse, {
      'event details loaded': (r) => r.status === 200,
    });
    
    // Attempt purchase (will fail without auth)
    const purchaseResponse = http.post(
      `${__ENV.API_URL}/api/tickets/mint`,
      JSON.stringify({
        eventId,
        tier: 'general',
        paymentMethod: 'test'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    check(purchaseResponse, {
      'purchase requires auth': (r) => r.status === 401,
    });
  }
}
```

## Conclusion

This integration guide provides a complete blueprint for connecting your Solana NFT ticketing smart contract with production backend services. Key takeaways:

1. **Always maintain consistency** between blockchain and database state
2. **Implement proper error handling** and rollback mechanisms
3. **Use caching strategically** to minimize RPC calls
4. **Plan for offline scenarios** in validation flows
5. **Monitor everything** for optimal performance

For questions or support, refer to:
- API Documentation: `/docs/api`
- Smart Contract Docs: `/docs/contracts`
- Support: support@yourticketingapp.com