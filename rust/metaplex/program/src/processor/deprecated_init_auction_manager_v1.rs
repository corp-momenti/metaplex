use {
    crate::{
        deprecated_state::{
            AuctionManagerSettingsV1, AuctionManagerV1, ParticipationStateV1, WinningConfigState,
            WinningConfigStateItem, MAX_AUCTION_MANAGER_V1_SIZE,
        },
        error::MetaplexError,
        processor::init_auction_manager_v2::assert_common_checks,
        state::{AuctionManagerStatus, Key, PREFIX},
        utils::{assert_derivation, assert_owned_by, create_or_allocate_account_raw},
    },
    borsh::BorshSerialize,
    metaplex_auction::processor::{
        AuctionData, AuctionDataExtended, BidState, BidStateData, MAX_AUCTION_BIDS_STATE_LIMIT,
    },
    solana_program::{
        account_info::{next_account_info, AccountInfo},
        borsh::try_from_slice_unchecked,
        entrypoint::ProgramResult,
        program_error::ProgramError,
        pubkey::Pubkey,
    },
};

pub fn process_deprecated_init_auction_manager_v1(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    auction_manager_settings: AuctionManagerSettingsV1,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let auction_manager_info = next_account_info(account_info_iter)?;
    let vault_info = next_account_info(account_info_iter)?;
    let auction_info = next_account_info(account_info_iter)?;
    let authority_info = next_account_info(account_info_iter)?;
    let payer_info = next_account_info(account_info_iter)?;
    let accept_payment_info = next_account_info(account_info_iter)?;
    let store_info = next_account_info(account_info_iter)?;
    let system_info = next_account_info(account_info_iter)?;
    let rent_info = next_account_info(account_info_iter)?;
    let auction_extended = next_account_info(account_info_iter).ok();
    let bid_state_data = next_account_info(account_info_iter).ok();

    let (bump_seed, vault, auction) = assert_common_checks(
        program_id,
        auction_manager_info,
        vault_info,
        auction_info,
        store_info,
        accept_payment_info,
        authority_info,
    )?;

    // Check `AuctionData` for max bids limit
    // Ensure, that required accounts are provided
    match &auction.bid_state {
        BidState::EnglishAuction { bids: _, max } => {
            if *max > MAX_AUCTION_BIDS_STATE_LIMIT {
                if bid_state_data.is_none() || auction_extended.is_none() {
                    return Err(ProgramError::InvalidArgument);
                }
            }
        }
        _ => {}
    };

    // Obtain `BidState` instance
    // Current implementation depend on AuctionDataExtended
    let bid_state = if let Some(bid_state_data) = bid_state_data {
        let auction_extended_acc = auction_extended.ok_or(ProgramError::InvalidArgument)?;
        assert_owned_by(auction_extended_acc, program_id)?;
        assert_derivation(
            program_id,
            auction_extended_acc,
            &[
                metaplex_auction::PREFIX.as_bytes(),
                program_id.as_ref(),
                vault_info.key.as_ref(),
                metaplex_auction::EXTENDED.as_bytes(),
            ],
        )?;

        let auction_extended = AuctionDataExtended::from_account_info(auction_extended_acc)?;
        if auction_extended
            .bid_state_data
            .ok_or(ProgramError::InvalidArgument)?
            != *bid_state_data.key
        {
            return Err(ProgramError::InvalidArgument);
        }

        let bid_state_data_acc: BidStateData =
            try_from_slice_unchecked(&bid_state_data.data.borrow_mut())?;
        bid_state_data_acc.state
    } else {
        auction.bid_state.clone()
    };

    if auction_manager_settings.winning_configs.len()
        != AuctionData::num_possible_winners(&bid_state) as usize
    {
        return Err(MetaplexError::WinnerAmountMismatch.into());
    }

    let mut winning_config_states: Vec<WinningConfigState> = vec![];
    let mut winning_item_count: u8 = 0;
    let mut any_with_more_than_one = false;
    for winning_config in &auction_manager_settings.winning_configs {
        let mut winning_config_state_items = vec![];
        let mut safety_deposit_box_found_lookup: Vec<bool> = vec![];
        for _ in 0..vault.token_type_count {
            safety_deposit_box_found_lookup.push(false)
        }
        if winning_config.items.len() > 1 {
            any_with_more_than_one = true;
        }
        for item in &winning_config.items {
            // If this blows then they have more than 255 total items which is unacceptable in current impl
            winning_item_count = winning_item_count
                .checked_add(1)
                .ok_or(MetaplexError::NumericalOverflowError)?;

            // Check if index referenced exists
            if item.safety_deposit_box_index as usize >= safety_deposit_box_found_lookup.len() {
                return Err(MetaplexError::InvalidWinningConfigSafetyDepositIndex.into());
            }

            // Should never have same deposit index appear twice in one config.
            let lookup = safety_deposit_box_found_lookup[item.safety_deposit_box_index as usize];
            if lookup {
                return Err(MetaplexError::DuplicateWinningConfigItemDetected.into());
            } else {
                safety_deposit_box_found_lookup[item.safety_deposit_box_index as usize] = true
            }

            if item.safety_deposit_box_index > vault.token_type_count {
                return Err(MetaplexError::InvalidSafetyDepositBox.into());
            }

            winning_config_state_items.push(WinningConfigStateItem {
                claimed: false,
                primary_sale_happened: false,
            })
        }
        winning_config_states.push(WinningConfigState {
            items: winning_config_state_items,
            money_pushed_to_accept_payment: false,
        })
    }

    let authority_seeds = &[PREFIX.as_bytes(), &auction_info.key.as_ref(), &[bump_seed]];

    create_or_allocate_account_raw(
        *program_id,
        auction_manager_info,
        rent_info,
        system_info,
        payer_info,
        MAX_AUCTION_MANAGER_V1_SIZE,
        authority_seeds,
    )?;

    let mut auction_manager = AuctionManagerV1::from_account_info(auction_manager_info)?;

    auction_manager.key = Key::AuctionManagerV1;
    auction_manager.store = *store_info.key;
    auction_manager.state.status = AuctionManagerStatus::Initialized;
    auction_manager.settings = auction_manager_settings;
    auction_manager.vault = *vault_info.key;
    auction_manager.auction = *auction_info.key;
    auction_manager.authority = *authority_info.key;
    auction_manager.accept_payment = *accept_payment_info.key;
    auction_manager.state.winning_config_items_validated = 0;
    auction_manager.state.winning_config_states = winning_config_states;
    auction_manager.straight_shot_optimization = !any_with_more_than_one;

    if auction_manager.settings.participation_config.is_some() {
        auction_manager.state.participation_state = Some(ParticipationStateV1 {
            collected_to_accept_payment: 0,
            validated: false,
            primary_sale_happened: false,
            printing_authorization_token_account: None,
        })
    }
    auction_manager.serialize(&mut *auction_manager_info.data.borrow_mut())?;

    Ok(())
}