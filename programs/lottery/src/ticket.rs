use super::*;
use anchor_spl::{
    associated_token,
    token::{self, Burn, MintTo},
};
use std::collections::HashSet;

// Constants
pub const SECONDS_IN_A_DAY: i64 = 86400;

////////////////////////////////////////////////////////////////
//                       Helper Functions                     //
////////////////////////////////////////////////////////////////

// Randomly generate 6 unique numbers between 1 and 60
pub fn generate_random_numbers() -> Result<[u8; 6]> {

    // Fetch the current clock sysvar
    let clock = Clock::get()?;

    // Use the current slot and timestamp for randomness
    let slot = clock.slot;
    let unix_timestamp = clock.unix_timestamp as u64;
    
    // Combine them to get some randomness
    let seed = slot ^ unix_timestamp;

    // Use the seed to generate random numbers
    let mut chosen_numbers: [u8; 6] = [0; 6];
    for i in 0..6 {
        chosen_numbers[i] = ((seed >> (i * 8)) as u8 % 60) + 1;
    }

    validate_numbers(&chosen_numbers)?;

    Ok(chosen_numbers)
}

// Validate that chosen numbers are unique and between 1 and 60
pub fn validate_numbers(numbers: &[u8; 6]) -> Result<()> {
    let unique_numbers: HashSet<&u8> = numbers.iter().collect();

    require!(
        unique_numbers.len() == numbers.len() && numbers.iter().all(|&n| (1..=60).contains(&n)),
        CustomError::InvalidNumber
    );
    Ok(())
}

// Helper to transfer SOL
fn transfer_lamports<'info>(
    from: &Signer<'info>,
    to: &AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let ix = anchor_lang::solana_program::system_instruction::transfer(&from.key(), to.key, amount);
    anchor_lang::solana_program::program::invoke(&ix, &[from.to_account_info(), to.clone()])?;
    Ok(())
}

// Helper to find `AccountInfo` by `Pubkey`
pub fn find_account_info_by_pubkey<'info>(
    accounts: &[AccountInfo<'info>],
    key: &Pubkey,
) -> Option<AccountInfo<'info>> {
    for account in accounts.iter() {
        if *account.key == *key {
            return Some(account.clone());
        }
    }
    None
}

////////////////////////////////////////////////////////////////
//                       Lottery Functions                    //
////////////////////////////////////////////////////////////////

/// Allows the user to buy a lottery ticket
/// - Transfers the ticket price and increments the prize pool.
pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
    msg!("Player {} is buying a ticket", &ctx.accounts.buyer.key());

    let lottery = &mut ctx.accounts.lottery;
    let buyer = &ctx.accounts.buyer;

    transfer_lamports(buyer, &lottery.to_account_info(), lottery.ticket_price)?;

    lottery.prize_pool += lottery.ticket_price;
    lottery.count += 1;

    msg!(
        "Player {} bought a ticket. Ticket account address {}",
        &ctx.accounts.buyer.key(), &ctx.accounts.ticket.key()
    );

    Ok(())
}

/// Mints a new ticket NFT for the user
/// - Creates the associated token account and mints the ticket NFT.
pub fn mint_ticket(ctx: Context<CreateTicket>, numbers: [u8; 6], _bump: u8) -> Result<()> {
    validate_numbers(&numbers)?;

    let ticket = &mut ctx.accounts.ticket;
    ticket.ticket_mint = ctx.accounts.mint_account.key();
    ticket.numbers = numbers;
    ticket.draw_number = ctx.accounts.lottery.count;
    ticket.owner = ctx.accounts.payer.key();

    msg!(
        "Creating ticket NFT mint address at {}",
        &ctx.accounts.mint_account.key()
    );

    associated_token::create(CpiContext::new(
        ctx.accounts.associated_token_program.to_account_info(),
        associated_token::Create {
            payer: ctx.accounts.payer.to_account_info(),
            associated_token: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
            mint: ctx.accounts.mint_account.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        },
    ))?;

    msg!(
        "Creating player NFT ticket account at {}",
        &ctx.accounts.token_account.key()
    );

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

    msg!(
        "Player {} received: Ticket NFT {}, on {}",
        &ctx.accounts.payer.key(),
        &ctx.accounts.mint_account.key(),
        &ctx.accounts.token_account.key()
    );

    Ok(())
}

/// Performs the lottery draw and sets the winning numbers
/// - Generates random winning numbers and updates the lottery account.
pub fn perform_draw(ctx: Context<PerformDraw>) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let current_time = Clock::get()?.unix_timestamp;

    require!(
        current_time - lottery.last_draw_time >= SECONDS_IN_A_DAY,
        CustomError::TooEarlyForNextDraw
    );

    let winning_numbers = generate_random_numbers()?;
    lottery.winning_numbers = winning_numbers;
    lottery.last_draw_time = current_time;

    msg!("Draw complete. Winning numbers: {:?}", winning_numbers);
    Ok(())
}

/// Distributes prizes to the winners of the draw
/// - Identifies the winners and splits the prize pool among them.
pub fn distribute_prizes<'info>(
    ctx: Context<'_, '_, 'info, 'info, DistributePrizes<'info>>,
) -> Result<()> {
    let lottery = &mut ctx.accounts.lottery;
    let mut winners: Vec<AccountInfo<'info>> = Vec::new();

    for account in ctx.remaining_accounts.iter() {
        let ticket_account: Account<Ticket> = Account::try_from(account)?;
        if check_winner(&ticket_account.numbers, &lottery.winning_numbers) {
            winners.push(account.clone());
        }
    }

    if winners.is_empty() {
        msg!("No winners. Prize pool is carried over to the next draw.");
        return Ok(());
    }

    let prize_per_winner = lottery.prize_pool / winners.len() as u64;
    for winner_account in &winners {
        **winner_account.try_borrow_mut_lamports()? += prize_per_winner;
    }

    lottery.prize_pool = 0;
    msg!("Prizes distributed to {} winners.", winners.len());
    Ok(())
}

/// Burns the ticket NFT and allows the user to claim their prize
/// - Checks if the ticket is a winner and transfers the prize to the owner.
pub fn burn_ticket<'info>(ctx: Context<'_, '_, 'info, 'info, BurnTicket<'info>>) -> Result<()> {
    let ticket = &ctx.accounts.ticket;
    let lottery = &mut ctx.accounts.lottery;

    if !check_winner(&ticket.numbers, &lottery.winning_numbers) {
        return Err(CustomError::TicketNotAWinner.into());
    }

    let owner_account_info = find_account_info_by_pubkey(ctx.remaining_accounts, &ticket.owner)
        .ok_or(CustomError::TicketNotAWinner)?;

    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.mint_account.to_account_info(),
                from: ctx.accounts.token_account.to_account_info(),
                authority: owner_account_info.to_account_info(),
            },
        ),
        1,
    )?;

    **owner_account_info.try_borrow_mut_lamports()? += lottery.prize_pool;
    lottery.prize_pool = 0;

    msg!(
        "Ticket burned and prize claimed by {}",
        owner_account_info.key
    );
    Ok(())
}

// Helper to check if a ticket is a winner
pub fn check_winner(ticket_numbers: &[u8; 6], winning_numbers: &[u8; 6]) -> bool {
    let winning_set: HashSet<&u8> = winning_numbers.iter().collect();
    ticket_numbers.iter().all(|n| winning_set.contains(n))
}

////////////////////////////////////////////////////////////////
//                       Errors                               //
////////////////////////////////////////////////////////////////
#[error_code]
pub enum CustomError {
    #[msg("The numbers chosen are invalid.")]
    InvalidNumber,
    #[msg("It's too early for the next draw.")]
    TooEarlyForNextDraw,
    #[msg("This ticket is not a winner.")]
    TicketNotAWinner,
}