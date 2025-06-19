#!/bin/bash

echo "🔧 Updating all arithmetic to safe operations..."

# Update mint_ticket.rs
echo "Updating mint_ticket.rs..."
sed -i '1i use crate::utils::math::*;' programs/ticket-core/src/instructions/mint_ticket.rs
sed -i 's/event\.tickets_sold += 1;/event.tickets_sold = safe_add(event.tickets_sold as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/mint_ticket.rs

# Update batch_mint.rs
echo "Updating batch_mint.rs..."
sed -i '1i use crate::utils::math::*;' programs/ticket-core/src/instructions/batch_mint.rs

# Update transfer_ticket.rs
echo "Updating transfer_ticket.rs..."
sed -i '1i use crate::utils::math::*;' programs/ticket-core/src/instructions/transfer_ticket.rs
sed -i 's/ticket\.transfer_count += 1;/ticket.transfer_count = safe_add(ticket.transfer_count as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/transfer_ticket.rs

# Update delegate_transfer.rs
echo "Updating delegate_transfer.rs..."
sed -i '1i use crate::utils::math::*;' programs/ticket-core/src/instructions/delegate_transfer.rs
sed -i 's/ticket\.transfer_count += 1;/ticket.transfer_count = safe_add(ticket.transfer_count as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/delegate_transfer.rs

# Update validate_entry.rs
echo "Updating validate_entry.rs..."
sed -i '1i use crate::utils::math::*;' programs/ticket-core/src/instructions/validate_entry.rs
sed -i 's/ticket\.validation_count += 1;/ticket.validation_count = safe_add(ticket.validation_count as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/validate_entry.rs

# Update burn_ticket.rs
echo "Updating burn_ticket.rs..."
sed -i '1i use crate::utils::math::*;' programs/ticket-core/src/instructions/burn_ticket.rs
sed -i 's/event\.tickets_used += 1;/event.tickets_used = safe_add(event.tickets_used as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/burn_ticket.rs
sed -i 's/event\.tickets_burned += 1;/event.tickets_burned = safe_add(event.tickets_burned as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/burn_ticket.rs
sed -i 's/event\.tiers\[tier_index\]\.used_count += 1;/event.tiers[tier_index].used_count = safe_add(event.tiers[tier_index].used_count as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/burn_ticket.rs
sed -i 's/event\.tiers\[tier_index\]\.burned_count += 1;/event.tiers[tier_index].burned_count = safe_add(event.tiers[tier_index].burned_count as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/burn_ticket.rs
sed -i 's/event\.tiers\[ticket\.tier_index\]\.used_count += 1;/event.tiers[ticket.tier_index].used_count = safe_add(event.tiers[ticket.tier_index].used_count as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/burn_ticket.rs

# Update mint_whitelist.rs
echo "Updating mint_whitelist.rs..."
sed -i '1i use crate::utils::math::*;' programs/ticket-core/src/instructions/mint_whitelist.rs
sed -i 's/event\.tickets_sold += 1;/event.tickets_sold = safe_add(event.tickets_sold as u64, 1)? as u32;/g' programs/ticket-core/src/instructions/mint_whitelist.rs

echo "✅ Arithmetic updates complete!"
