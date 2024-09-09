use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Token,Mint,MintTo},
};
use anchor_spl::token;
use anchor_spl::associated_token;
use anchor_spl::associated_token::AssociatedToken;

use super::*;

// Buy lottery ticket and mint ticket account
pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
    
    msg!("Player {} is buying a ticket", &ctx.accounts.buyer.key());
    // Deserialise lottery account
    let lottery: &mut Account<Lottery> = &mut ctx.accounts.lottery;          
    let player: &mut Signer = &mut ctx.accounts.buyer;                 

    // Transfer lamports to the lottery account
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &player.key(),
        &lottery.key(),
        lottery.ticket_price,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            player.to_account_info(),
            lottery.to_account_info(),
        ],
    )?;

    // Deserialise ticket account
    let ticket: &mut Account<Ticket> = &mut ctx.accounts.ticket;                

    // Set ticket index equal to the counter
    ticket.idx = lottery.count;        

    // Increment total submissions counter
    lottery.count += 1;                      
    msg!("Player {} bought a ticket. Ticket account address: {}", &ctx.accounts.buyer.key(), &ctx.accounts.ticket.key());

    Ok(())  
}

// Mint the ticket
pub fn mint_ticket(
    ctx: Context<CreateTicket>,
    numbers: [u8; 6],
    bump: u8,
) -> Result<()> {

    msg!("Creating ticket NFT mint address at {}", &ctx.accounts.mint_account.key());
    // Deserialise ticket account and assign values
    let ticket: &mut Account<Ticket> = &mut ctx.accounts.ticket;                
    ticket.ticket_mint = ctx.accounts.mint_account.key();
    ticket.numbers = numbers; 

    msg!("Creating player NFT ticket account at {}", &ctx.accounts.token_account.key());
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
    msg!("Minting NFT ticket to player's ticket account ...");
    token::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        ),
        1,
    )?;

    msg!("Player {} received: ", &ctx.accounts.payer.key());
    msg!("   Ticket NFT {}, on {}", &ctx.accounts.mint_account.key(), &ctx.accounts.token_account.key());

    Ok(())
}

////////////////////////////////////////////////////////////////
//                       Contexts                             //
////////////////////////////////////////////////////////////////
#[derive(Accounts)]
pub struct BuyTicket<'info> {            
    #[account(init, 
        seeds = [
            &lottery.count.to_be_bytes(), 
            lottery.key().as_ref()
        ], 
        constraint = buyer.to_account_info().lamports() >= lottery.ticket_price,
        bump, 
        payer = buyer, 
        space=80
    )]
    pub ticket: Account<'info, Ticket>,        

    #[account(mut)]                                 
    pub buyer: Signer<'info>,                     // Payer for account creation    
    #[account(mut)]       
    pub lottery: Account<'info, Lottery>,          // To retrieve and increment counter        
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
        seeds=[numbers.as_ref()],
        bump,
    )]
    pub mint_account: Account<'info, Mint>,

    /// CHECK: We're about to create this with Anchor
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub ticket: Account<'info, Ticket>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

////////////////////////////////////////////////////////////////
//                       Accounts                             //
////////////////////////////////////////////////////////////////
#[account]
#[derive(Default)] 
pub struct Ticket {    
    pub ticket_mint: Pubkey,    
    pub idx: u32,
    pub numbers : [u8;6],
}