use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Token, Mint, TokenAccount},
    associated_token::AssociatedToken,
};
pub mod ticket;

declare_id!("EszfnwXLcorujqp6AxYf82y8Gjd42K7QbfTeEa9QeCxS");

#[program]
pub mod lottery {
    use super::*;

    /// Initializes the lottery account with a specified ticket price and oracle
    /// - Sets up the authority, ticket price, oracle, and other fields of the lottery account.
    pub fn initialise_lottery(
        ctx: Context<Create>, 
        ticket_price: u64,
        oracle_pubkey: Pubkey
    ) -> Result<()> {        
        let lottery = &mut ctx.accounts.lottery;
        lottery.authority = ctx.accounts.admin.key();
        lottery.count = 0;
        lottery.ticket_price = ticket_price;
        lottery.oracle = oracle_pubkey;
        lottery.prize_pool = 0;
        lottery.last_draw_time = 0;
        Ok(())
    }

    /// Allows a user to buy a ticket for the lottery
    /// - Transfers the ticket price from the buyer to the lottery account
    /// - Updates the prize pool and increments the ticket counter.
    pub fn buy_ticket(
        ctx: Context<BuyTicket>
    ) -> Result<()> {
        ticket::buy_ticket(ctx)
    }

    /// Mints a ticket NFT for the user with either user-selected or randomly generated numbers
    /// - Mints a new NFT, assigns numbers, and increments the lottery's draw count.
    pub fn mint_ticket(
        ctx: Context<CreateTicket>, 
        numbers: [u8; 6], 
        bump: u8
    ) -> Result<()> {
        ticket::mint_ticket(ctx, numbers, bump)
    }

    /// Performs a daily draw for the lottery
    /// - Generates the winning numbers and updates the draw timestamp.
    pub fn perform_draw(
        ctx: Context<PerformDraw>
    ) -> Result<()> {
        ticket::perform_draw(ctx)
    }

    /// Distributes prizes to winning ticket holders
    /// - Checks for winners and distributes the prize pool among them.
    pub fn distribute_prizes<'info>(
        ctx: Context<'_, '_, 'info, 'info, DistributePrizes<'info>>
    ) -> Result<()> {
        ticket::distribute_prizes(ctx)
    }

    /// Burns the ticket NFT and allows the user to claim their prize if they won
    /// - Burns the NFT and transfers the prize pool to the winner.
    pub fn burn_ticket<'info>(
        ctx: Context<'_, '_, 'info, 'info, BurnTicket<'info>>
    ) -> Result<()> {
        ticket::burn_ticket(ctx)
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

#[derive(Accounts)]
pub struct BuyTicket<'info> {            
    #[account(init, 
        seeds = [
            &lottery.count.to_be_bytes(), 
            lottery.key().as_ref()
        ], 
        bump, 
        payer = buyer, 
        space = 80
    )]
    pub ticket: Account<'info, Ticket>,        

    #[account(mut)]                                 
    pub buyer: Signer<'info>,                    
    #[account(mut)]       
    pub lottery: Account<'info, Lottery>,         
    pub system_program: Program<'info, System>,    
}

#[derive(Accounts)]
#[instruction(numbers : [u8;6])]
pub struct CreateTicket<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer.key(),
        mint::freeze_authority = payer.key(),
        seeds = [numbers.as_ref()],
        bump,
    )]
    pub mint_account: Account<'info, Mint>,

    /// CHECK: Needed for unchecked accounts for Anchor not to panick
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub lottery: Account<'info, Lottery>,

    #[account(mut)]
    pub ticket: Account<'info, Ticket>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PerformDraw<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
}

#[derive(Accounts)]
pub struct DistributePrizes<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
}

#[derive(Accounts)]
pub struct BurnTicket<'info> {
    #[account(mut)]
    pub ticket: Account<'info, Ticket>,

    #[account(mut)]
    pub lottery: Account<'info, Lottery>,

    #[account(mut)]
    pub mint_account: Account<'info, Mint>,

    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

////////////////////////////////////////////////////////////////
//                       Accounts                             //
////////////////////////////////////////////////////////////////

// Define Lottery account
#[account]
pub struct Lottery {
    pub authority: Pubkey, 
    pub oracle: Pubkey, 
    pub count: u32, 
    pub ticket_price: u64,
    pub prize_pool: u64, 
    pub winning_numbers: [u8; 6],  
    pub last_draw_time: i64, 
}

// Define Ticket account
#[account]
#[derive(Default)] 
pub struct Ticket {    
    pub ticket_mint: Pubkey,    
    pub idx: u32,
    pub numbers: [u8; 6],
    pub draw_number: u32,  
    pub owner: Pubkey,
}