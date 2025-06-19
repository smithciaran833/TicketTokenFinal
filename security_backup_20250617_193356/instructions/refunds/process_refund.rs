use anchor_lang::prelude::*;

// Placeholder for process_refund instruction
pub fn process_refund(_ctx: Context<ProcessRefund>) -> Result<()> {
    // Implementation would go here
    Ok(())
}

#[derive(Accounts)]
pub struct ProcessRefund<'info> {
    pub authority: Signer<'info>,
}
