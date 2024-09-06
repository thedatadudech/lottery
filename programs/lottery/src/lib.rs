use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Token,Mint,MintTo},
};
use anchor_spl::token;
use anchor_spl::associated_token;
use anchor_spl::associated_token::AssociatedToken;

declare_id!("FwTVv5mpHHSz37TqGH9hdsSnY7b9jMAN8Rx2pgcYKABS");

#[program]
pub mod lottery {
    use super::*;

    pub fn mint_ticket(
        ctx: Context<CreateTicket>,
        numbers: [u8; 6],
        bump: u8,
    ) -> Result<()> {
        msg!("Running program with ID: {:?}", ctx.program_id);
        msg!("Numbers: {:?}", numbers);
        msg!("Bump: {:?}", bump);

        msg!("Ticket account created");
        msg!("Initializing mint account...");
        msg!("Mint: {}", &ctx.accounts.mint_account.key());
        msg!("Creating token account...");
        msg!("Token Address: {}", &ctx.accounts.token_account.key());    
        associated_token::create(
            CpiContext::new(
                ctx.accounts.associated_token_program.to_account_info(),
                associated_token::Create {
                    payer: ctx.accounts.payer.to_account_info(),
                    associated_token: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                    mint: ctx.accounts.mint_account.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                },
            ),
        )?;
        msg!("Minting token to token account...");
        msg!("Mint: {}", &ctx.accounts.mint_account.to_account_info().key());   
        msg!("Token Address: {}", &ctx.accounts.token_account.key());     
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint_account.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            1,
        )?;


        msg!("Token mint process completed successfully.");

        Ok(())
    }
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
        seeds=[numbers.as_ref()],
        bump,
    )]
    pub mint_account: Account<'info, Mint>,
    /// CHECK: We're about to create this with Anchor
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    
    #[account(mut)]
    pub payer: Signer<'info>,

    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,

}
