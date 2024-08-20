use anchor_lang::prelude::*;

declare_id!("8LcJYcyMkqy5bQiHL6tX7faXX5ZgpGsgs2Jf5RLptTvL");

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
