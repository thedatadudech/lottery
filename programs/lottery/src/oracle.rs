use anchor_lang::prelude::*;  // This line ensures ProgramResult and other Anchor constructs are available
use borsh::{BorshDeserialize, BorshSerialize};
use provider::Provider;

// declare_id!("2h2W9H7sLt6QNiMKiahUhhhMQDQEBCURmj8NVBzwL926");

const MAX_NAME_LENGTH: usize = 32;
const DATA_SIZE: usize = 68;

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub enum OracleValue {
    Unsigned(u64),
    Signed(i64),
    Float(f64),
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct OracleData {
    pub name: String, // max 32
    pub value: OracleValue,
}

#[program]
pub mod oracle {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>, 
        name: String, 
        data: Vec<OracleData>, 
        bump: u8
    ) -> ProgramResult {
        let oracle = &mut ctx.accounts.oracle;
        oracle.name = name;
        oracle.bump = bump;
        oracle.data = data;
        oracle.provider_program = *ctx.accounts.oracle_provider.to_account_info().owner;
        Ok(())
    }

    pub fn update(
        ctx: Context<Update>, 
        data: Vec<OracleData>
    ) -> ProgramResult {
        let oracle = &mut ctx.accounts.oracle;
        oracle.data = data;
        Ok(())
    }
}

impl Oracle {
    pub fn update_value(&mut self, name: &str, new_value: OracleValue) -> ProgramResult {
        for entry in self.data.iter_mut() {
            if entry.name == name {
                entry.value = new_value;
                return Ok(());
            }
        }
        Err(ErrorCode::OracleDataNotFound.into())
    }

    fn space(name: &str, size: &u32) -> usize {
        // Oracle account space calculation
        8 + MAX_NAME_LENGTH + name.len() + (*size as usize) * OracleData::space() + 8
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("The given oracle has already been initialized.")]
    OracleAlreadyInitialized,
    #[msg("The user is not authorized to update the oracle.")]
    OracleUnauthorizedUser,
    #[msg("The specified oracle data was not found.")]
    OracleDataNotFound,
}
