use anchor_lang::prelude::*;
pub mod ticket;
use ticket::*;

declare_id!("EszfnwXLcorujqp6AxYf82y8Gjd42K7QbfTeEa9QeCxS");

#[program]
pub mod lottery {
    use super::*;

    // Creates lottery account
    pub fn initialise_lottery(ctx: Context<Create>, ticket_price: u64, oracle_pubkey: Pubkey) -> Result<()> {        
        let lottery: &mut Account<Lottery> = &mut ctx.accounts.lottery;        
        lottery.authority = ctx.accounts.admin.key();                
        lottery.count = 0;           
        lottery.ticket_price = ticket_price;
        lottery.oracle = oracle_pubkey;
    
        Ok(())
    }

    // Ticket functions
    pub fn buy_ticket(
        ctx: Context<BuyTicket>,
    ) -> Result<()> {
        ticket::buy_ticket(ctx)
    }
    pub fn mint_ticket(
        ctx: Context<CreateTicket>,
        numbers: [u8; 6],
        bump: u8,
    ) -> Result<()> {
        ticket::mint_ticket(ctx, numbers, bump)
    }
}

////////////////////////////////////////////////////////////////
//                       Contexts                             //
////////////////////////////////////////////////////////////////
#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer = admin, space = 8 + 180)]
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]
    pub admin: Signer<'info>,    
    pub system_program: Program<'info, System>,
}

////////////////////////////////////////////////////////////////
//                       Accounts                             //
////////////////////////////////////////////////////////////////
#[account]
pub struct Lottery {    
    pub authority: Pubkey, 
    pub oracle: Pubkey, 
    pub winner: Pubkey,
    pub winner_index: u32, 
    pub count: u32,
    pub ticket_price: u64,
}