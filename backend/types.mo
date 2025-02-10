import Time "mo:base/Time";
import Principal "mo:base/Principal";

module Types {
    public type Tokens = { e8s : Nat64 };
    public type Timestamp = Nat64;
    public type Duration = Nat64;
    public type Subaccount = Blob;

    public type Account = {
        owner : Principal;
        subaccount : ?Subaccount;
    };

    // General error type (used for API responses)
    public type ApiError = {
        code : Nat;
        message : Text;
        details : ?Text;
    };

    public type TransferArgs = {
        from_subaccount : ?Subaccount;
        to : Account;
        amount : Nat;
        fee : ?Nat;
        memo : ?Blob;
        created_at_time : ?Timestamp;
    };

    public type TransferError = {
        #BadFee : { expected_fee : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #InsufficientFunds : { balance : Nat };
        #TooOld;
        #CreatedInFuture : { ledger_time : Timestamp };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { error_code : Nat; message : Text };
    };

    // Core transaction type
    public type Transaction = {
        id : Nat;
        amount : Tokens;
        to : Account;
        created_at_time : ?Time.Time;
        executed : Bool;
    };

    // Aggregated transaction type
    public type TransactionDetails = {
        id : Nat;
        transaction : Transaction;
        decisions: [(Principal, Bool)];
        threshold : Nat;
        required : Nat;
    };

    // User type (from manager_types)
    public type User = {
        name: Text;
        principal: Principal;
    };

    // Vault type (from manager_types)
    public type Vault = {
        name: Text;
        canister_id: Principal;
    };
}