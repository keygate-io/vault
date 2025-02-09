import Time "mo:base/Time";
import Principal "mo:base/Principal";

module Types {
    public type Tokens = { e8s : Nat };
    public type AccountIdentifier = Blob;

    // General error type (used for API responses)
    public type ApiError = {
        code : Nat;
        message : Text;
        details : ?Text;
    };

    // Core transaction type
    public type Transaction = {
        id : Nat;
        amount : Tokens;               // Amount to send (e.g., { e8s = 100_000_000 } for 1 ICP)
        to : AccountIdentifier;        // Recipient's account ID (Blob)
        created_at_time : ?Time.Time;  // Optional timestamp for deduplication
    };

    // Aggregated transaction type
    public type TransactionDetails = {
        id : Nat;
        transaction : Transaction;
        decisions: [(Principal, Bool)];
        threshold : Nat;
        required : Nat;
        executed : Bool;
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