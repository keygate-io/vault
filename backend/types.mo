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
        to : Account;
        fee : ?Nat;
        memo : ?Blob;
        from_subaccount : ?Subaccount;
        created_at_time : ?Nat64;
        amount : Nat;
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

    public type User = {
        name: Text;
        principal: Principal;
    };

    public type Vault = {
        name: Text;
        canister_id: Principal;
    };

    public type ProposalAction = {
        #Transaction : {
            amount: Tokens;
            to: Principal;
        };
        #Invite : Principal;
    };

    public type Proposal = {
        id: Nat;
        action: ProposalAction;
        decisions: [(Principal, Bool)];
        executed: Bool;
        created_at_time: ?Int;
        threshold: Nat;
        required: Nat;
    };

}