dfx deploy icp_ledger_canister --argument "(variant {
    Init = record {
      minting_account = \"$(dfx ledger --identity anonymous account-id)\";
      initial_values = vec {
        record {
          \"$(dfx ledger --identity default account-id)\";
          record {
            e8s = 10_000_000_000 : nat64;
          };
        };
      };
      send_whitelist = vec {};
      transfer_fee = opt record {
        e8s = 10_000 : nat64;
      };
      token_symbol = opt \"LICP\";
      token_name = opt \"Local ICP\";
    }
})"