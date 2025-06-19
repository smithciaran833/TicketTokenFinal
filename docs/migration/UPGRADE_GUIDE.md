# 🚀 Upgrade & Migration Guide - Solana NFT Ticketing System

## Overview
This guide covers how to safely upgrade the Solana NFT Ticketing smart contract and migrate existing data when making breaking changes.

## Table of Contents
- [Upgrade Types](#upgrade-types)
- [Pre-Upgrade Checklist](#pre-upgrade-checklist)
- [Non-Breaking Upgrades](#non-breaking-upgrades)
- [Breaking Changes](#breaking-changes)
- [Migration Strategies](#migration-strategies)
- [Rollback Procedures](#rollback-procedures)
- [Version History](#version-history)

## Upgrade Types

### 1. Non-Breaking Changes
Changes that maintain backward compatibility:
- Adding new instructions
- Adding optional fields to existing accounts
- Bug fixes that don't change behavior
- Performance optimizations

### 2. Breaking Changes
Changes that require migration:
- Modifying existing account structures
- Changing instruction parameters
- Removing instructions or fields
- Changing PDA derivation logic

## Pre-Upgrade Checklist

### 1. Assessment Phase
```bash
# 1. Document current state
solana program show EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm

# 2. Export current IDL
anchor idl fetch EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm > idl-v1.json

# 3. Count existing accounts
node scripts/count-accounts.js

# 4. Backup critical data
node scripts/backup-data.js
```

### 2. Testing Phase
- [ ] All unit tests pass
- [ ] Integration tests complete
- [ ] Migration scripts tested on devnet
- [ ] Load testing completed
- [ ] Security audit performed

### 3. Communication
- [ ] Announce upgrade schedule
- [ ] Document breaking changes
- [ ] Prepare user migration guide
- [ ] Notify integration partners

## Non-Breaking Upgrades

### Adding New Instructions

Example: Adding a `gift_ticket` instruction

```rust
// 1. Add to lib.rs
pub fn gift_ticket(
    ctx: Context<GiftTicket>,
    recipient: Pubkey,
    message: String,
) -> Result<()> {
    instructions::gift_ticket(ctx, recipient, message)
}

// 2. Create instruction file
// instructions/gift_ticket.rs
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct GiftTicket<'info> {
    #[account(mut)]
    pub ticket: Account<'info, Ticket>,
    pub from: Signer<'info>,
    /// CHECK: Any valid pubkey can receive
    pub to: AccountInfo<'info>,
}

pub fn gift_ticket(
    ctx: Context<GiftTicket>,
    recipient: Pubkey,
    message: String,
) -> Result<()> {
    // Implementation
    Ok(())
}
```

### Adding Optional Fields

```rust
// Before
#[account]
pub struct Event {
    pub name: String,
    pub venue: String,
    pub start_time: i64,
}

// After (non-breaking)
#[account]
pub struct Event {
    pub name: String,
    pub venue: String,
    pub start_time: i64,
    pub description: Option<String>,    // New optional field
    pub category: Option<String>,       // New optional field
}
```

### Deployment Process

```bash
# 1. Build new version
cargo build-sbf

# 2. Deploy to devnet first
solana program deploy \
  --url devnet \
  --program-id EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm \
  target/deploy/ticket_core.so

# 3. Test thoroughly
npm run test:devnet

# 4. Deploy to mainnet
solana program deploy \
  --url mainnet-beta \
  --program-id EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm \
  target/deploy/ticket_core.so
```

## Breaking Changes

### Account Structure Changes

When modifying account structures, you need a migration strategy:

```rust
// Old structure (v1)
#[account]
pub struct TicketV1 {
    pub owner: Pubkey,
    pub event: Pubkey,
    pub price: u64,
}

// New structure (v2)
#[account]
pub struct TicketV2 {
    pub owner: Pubkey,
    pub event: Pubkey,
    pub price: u64,
    pub tier: String,        // New required field
    pub purchase_time: i64,  // New required field
    pub version: u8,         // Version tracking
}
```

### Migration Instructions

```rust
// Add migration instruction
pub fn migrate_ticket_v1_to_v2(
    ctx: Context<MigrateTicket>,
) -> Result<()> {
    let old_ticket = &ctx.accounts.old_ticket;
    let new_ticket = &mut ctx.accounts.new_ticket;
    
    // Copy existing data
    new_ticket.owner = old_ticket.owner;
    new_ticket.event = old_ticket.event;
    new_ticket.price = old_ticket.price;
    
    // Set defaults for new fields
    new_ticket.tier = "general".to_string();
    new_ticket.purchase_time = Clock::get()?.unix_timestamp;
    new_ticket.version = 2;
    
    // Close old account and return rent
    **ctx.accounts.old_ticket.to_account_info().lamports.borrow_mut() = 0;
    
    Ok(())
}

#[derive(Accounts)]
pub struct MigrateTicket<'info> {
    #[account(mut)]
    pub old_ticket: Account<'info, TicketV1>,
    
    #[account(
        init,
        payer = payer,
        space = 8 + TicketV2::LEN,
        seeds = [b"ticket_v2", old_ticket.event.as_ref(), old_ticket.key().as_ref()],
        bump
    )]
    pub new_ticket: Account<'info, TicketV2>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```

## Migration Strategies

### 1. Parallel Migration

Run both versions simultaneously:

```typescript
// Backend service handles both versions
class TicketService {
  async getTicket(ticketId: string): Promise<Ticket> {
    // Try v2 first
    try {
      const v2Ticket = await this.program.account.ticketV2.fetch(
        this.deriveTicketV2PDA(ticketId)
      );
      return this.normalizeV2Ticket(v2Ticket);
    } catch {
      // Fall back to v1
      const v1Ticket = await this.program.account.ticketV1.fetch(
        this.deriveTicketV1PDA(ticketId)
      );
      return this.normalizeV1Ticket(v1Ticket);
    }
  }
  
  async migrateTicket(ticketId: string): Promise<void> {
    const tx = await this.program.methods
      .migrateTicketV1ToV2()
      .accounts({
        oldTicket: this.deriveTicketV1PDA(ticketId),
        newTicket: this.deriveTicketV2PDA(ticketId),
        payer: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
    console.log('Migrated ticket:', ticketId, 'tx:', tx);
  }
}
```

### 2. Batch Migration Script

```typescript
// scripts/migrate-tickets.ts
import { Program } from '@coral-xyz/anchor';
import { chunk } from 'lodash';

async function migrateAllTickets() {
  const connection = new Connection(process.env.RPC_URL);
  const program = new Program(IDL, PROGRAM_ID, provider);
  
  // 1. Get all v1 tickets
  const v1Tickets = await program.account.ticketV1.all();
  console.log(`Found ${v1Tickets.length} tickets to migrate`);
  
  // 2. Process in batches
  const batches = chunk(v1Tickets, 10);
  let migrated = 0;
  
  for (const batch of batches) {
    try {
      // Create migration transactions
      const transactions = await Promise.all(
        batch.map(ticket => createMigrationTx(ticket))
      );
      
      // Send in parallel
      const signatures = await Promise.all(
        transactions.map(tx => sendAndConfirmTransaction(connection, tx))
      );
      
      migrated += batch.length;
      console.log(`Migrated ${migrated}/${v1Tickets.length} tickets`);
      
      // Store progress
      await saveProgress(migrated, signatures);
      
    } catch (error) {
      console.error('Batch failed:', error);
      await saveError(batch, error);
      
      // Continue with next batch
      continue;
    }
    
    // Rate limiting
    await sleep(1000);
  }
  
  console.log('Migration complete!');
}

async function createMigrationTx(ticket: any) {
  return program.methods
    .migrateTicketV1ToV2()
    .accounts({
      oldTicket: ticket.publicKey,
      newTicket: deriveV2PDA(ticket.account),
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .transaction();
}
```

### 3. Lazy Migration

Migrate accounts on first use:

```rust
// In transfer instruction
pub fn transfer_ticket(ctx: Context<TransferTicket>) -> Result<()> {
    // Check if ticket needs migration
    if ctx.accounts.ticket.version == 1 {
        // Migrate inline
        migrate_ticket_inline(&mut ctx.accounts.ticket)?;
    }
    
    // Continue with transfer
    // ...
}
```

## State Versioning

### Account Versioning Pattern

```rust
#[account]
pub struct Event {
    pub version: u8,  // Always first field
    pub data: EventData,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum EventData {
    V1(EventV1),
    V2(EventV2),
    V3(EventV3),
}

impl Event {
    pub fn get_name(&self) -> &str {
        match &self.data {
            EventData::V1(v1) => &v1.name,
            EventData::V2(v2) => &v2.name,
            EventData::V3(v3) => &v3.display_name,
        }
    }
}
```

### Program Version Management

```rust
// In lib.rs
pub const PROGRAM_VERSION: &str = "2.0.0";

#[program]
pub mod ticket_core {
    use super::*;
    
    pub fn get_version(ctx: Context<GetVersion>) -> Result<String> {
        Ok(PROGRAM_VERSION.to_string())
    }
}
```

## Rollback Procedures

### Emergency Rollback Plan

1. **Immediate Actions**
```bash
# 1. Revert to previous version
solana program deploy \
  --program-id EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm \
  backups/ticket_core_v1.so

# 2. Verify rollback
solana program show EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm

# 3. Update backend to use old IDL
cp backups/idl-v1.json ./idl.json
npm run restart:services
```

2. **Data Recovery**
```typescript
// Restore from backup if needed
async function restoreData() {
  const backup = await loadBackup('pre-upgrade-backup.json');
  
  for (const record of backup.tickets) {
    try {
      await restoreTicket(record);
    } catch (error) {
      console.error(`Failed to restore ticket ${record.id}:`, error);
    }
  }
}
```

### Rollback Testing

Always test rollback procedures:

```bash
# 1. Deploy to test environment
./scripts/deploy-test.sh

# 2. Run upgrade
./scripts/upgrade-test.sh

# 3. Test rollback
./scripts/rollback-test.sh

# 4. Verify functionality
npm run test:rollback
```

## Communication Templates

### Upgrade Announcement

```markdown
# Upcoming Smart Contract Upgrade

**Date**: [DATE]
**Duration**: Approximately 2 hours
**Impact**: Minimal - New features being added

## What's New
- Feature 1: Description
- Feature 2: Description
- Bug fixes and performance improvements

## Action Required
- No action needed for ticket holders
- API partners: Update to new SDK by [DATE]
- Venue operators: Update scanner app

## Timeline
- 00:00 UTC - Upgrade begins
- 00:30 UTC - New features available
- 02:00 UTC - Upgrade complete

Questions? Contact support@ticketing.app
```

### Post-Upgrade Report

```markdown
# Upgrade Complete ✅

**Completed**: [DATE]
**Version**: 2.0.0
**Status**: Successful

## Summary
- All systems operational
- X tickets migrated successfully
- New features active

## Next Steps
- Update your applications to use new features
- Review updated documentation
- Report any issues to support

Thank you for your patience!
```

## Monitoring During Upgrade

```typescript
// Monitor script
class UpgradeMonitor {
  async monitor() {
    const metrics = {
      startTime: Date.now(),
      errors: [],
      migrated: 0,
      failed: 0,
    };
    
    // Check program version
    const version = await this.getOnChainVersion();
    console.log('Current version:', version);
    
    // Monitor transactions
    const subscription = this.connection.onLogs(
      this.programId,
      (logs) => {
        if (logs.err) {
          metrics.errors.push({
            time: Date.now(),
            error: logs.err,
            logs: logs.logs
          });
        }
      }
    );
    
    // Check migration progress
    const interval = setInterval(async () => {
      const progress = await this.getMigrationProgress();
      metrics.migrated = progress.completed;
      metrics.failed = progress.failed;
      
      console.log(`Progress: ${progress.completed}/${progress.total}`);
      
      if (progress.completed === progress.total) {
        clearInterval(interval);
        this.connection.removeOnLogsListener(subscription);
        await this.generateReport(metrics);
      }
    }, 5000);
  }
}
```

## Best Practices

### 1. Version Everything
- Program version in code
- IDL versioning
- API versioning
- Database schema versions

### 2. Gradual Rollout
```typescript
// Feature flags for gradual enabling
if (await featureFlag.isEnabled('v2-transfers')) {
  return this.v2TransferLogic();
} else {
  return this.v1TransferLogic();
}
```

### 3. Comprehensive Testing
- Unit tests for migration logic
- Integration tests with real data
- Load tests during migration
- Rollback procedure tests

### 4. Documentation
- Migration guides for users
- API changelog
- Breaking changes highlighted
- Example code updated

### 5. Monitoring
- Real-time migration progress
- Error tracking
- Performance metrics
- User impact analysis

## Emergency Contacts

During upgrades, have these ready:

- **Tech Lead**: [PHONE]
- **DevOps**: [PHONE]
- **Customer Support Lead**: [PHONE]
- **Solana RPC Provider**: [SUPPORT URL]
- **Security Team**: [PHONE]

## Conclusion

Successful upgrades require:
1. **Careful planning** - Know exactly what changes
2. **Thorough testing** - Test everything including rollbacks
3. **Clear communication** - Keep users informed
4. **Monitoring** - Watch everything during upgrade
5. **Quick response** - Be ready to rollback if needed

Remember: It's better to delay an upgrade than to rush and cause issues.