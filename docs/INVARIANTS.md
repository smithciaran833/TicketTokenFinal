# System Invariants

## Core Invariants
1. **Conservation of Tickets**: `tickets_minted == tickets_sold + tickets_reserved + tickets_refunded`
2. **Price Consistency**: Ticket purchase price matches tier price at purchase time
3. **No Double Spending**: Each ticket can only be validated once for entry
4. **Refund Window**: Refunds only allowed before event start minus buffer

## State Invariants
- Event capacity >= tickets sold
- Ticket owner must sign all transfers
- Frozen tickets cannot be transferred or used
- Burned tickets are permanently removed
