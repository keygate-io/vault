#!/bin/bash

# Get the default identity's principal
DEFAULT_PRINCIPAL=$(dfx identity get-principal)

# Deploy the vault canister with initial configuration
dfx deploy vault --argument "(
    vec {
        principal \"$DEFAULT_PRINCIPAL\"
    },
    1 : nat
)"