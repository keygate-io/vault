import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Types "types";
import Time "mo:base/Time";
import Map "mo:map/Map";
import { nhash } "mo:map/Map";


actor {
    // State variables
    private stable var owners : [Principal] = [];
    private stable var isOwner : [(Principal, Bool)] = [];

    // State variables
    private stable var transactionCount : Nat = 0;
    private stable var transactions = Map.new<Nat, Types.Transaction>();
    private stable var confirmations = Map.new<Nat, [(Principal, Bool)]>();

    private stable var threshold : Nat = 1;

    // Constructor
    public shared({ caller }) func init(newOwners : [Principal], threshold_value : Nat) : async Result.Result<(), Types.ApiError> {
        // Validate inputs
        if (newOwners.size() == 0) {
            return #err({
                code = 400;
                message = "Owners array cannot be empty";
                details = null;
            });
        };
        
        if (threshold_value == 0 or threshold_value > newOwners.size()) {
            return #err({
                code = 400;
                message = "Invalid threshold";
                details = null;
            });
        };

        // Initialize state
        owners := newOwners;
        threshold := threshold_value;
        // Initialize isOwner array
        isOwner := Array.map<Principal, (Principal, Bool)>(newOwners, func(p: Principal) : (Principal, Bool) {
            (p, true)
        });

        #ok()
    };

    // Core Transaction Management
    public shared({ caller }) func proposeTransaction(to: Principal, value: Nat) : async Result.Result<Nat, Types.ApiError> {
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can propose transactions";
                details = null;
            });
        };

        if (value == 0) {
            return #err({
                code = 400;
                message = "Transaction amount cannot be zero";
                details = null;
            });
        };

        let toAccount = Principal.toBlob(to);

        let transaction : Types.Transaction = {
            amount = { e8s = value };
            to = toAccount;
            created_at_time = ?Time.now();
        };

        // Assign the next transaction ID and update state
        let txId = transactionCount;
        transactionCount += 1;

        // Add the new transaction to the ledger
        Map.set(transactions, nhash, txId, transaction);

        // Initialize confirmations with Map
        Map.set(confirmations, nhash, txId, [(caller, true)]);

        // Return the transaction ID
        #ok(txId)
    };

    public shared({ caller }) func confirmTransaction(txId: Nat) : async Result.Result<(), Types.ApiError> {
        // Check if the caller is an owner
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can confirm transactions";
                details = null;
            });
        };

        // Check if the transaction exists
        if (Map.get(transactions, nhash, txId) == null) {
            return #err({
                code = 404;
                message = "Transaction not found";
                details = null;
            });
        };

        switch (Map.get(confirmations, nhash, txId)) {
            case null {
                return #err({
                    code = 404;
                    message = "Transaction confirmations not found";
                    details = null;
                });
            };
            case (?existingConfirmations) {
                let alreadyConfirmed = Array.find(existingConfirmations, func((p, confirmed) : (Principal, Bool)) : Bool {
                    Principal.equal(p, caller) and confirmed
                });

                if (alreadyConfirmed != null) {
                    return #err({
                        code = 400;
                        message = "Transaction already confirmed by caller";
                        details = null;
                    });
                };

                // Add the caller's confirmation
                let newConfirmation = (caller, true);

                // Update confirmations with Map
                Map.set(confirmations, nhash, txId, Array.append(existingConfirmations, [newConfirmation]));

                #ok(())
            }
        };
    };

    public shared({ caller }) func executeTransaction(txId: Nat) : async Result.Result<(), Types.ApiError> {
        #err({
            code = 501;
            message = "Not implemented";
            details = null;
        })
    };

    // Owner Management
    public shared({ caller }) func addOwner(owner: Principal) : async Result.Result<(), Types.ApiError> {
        // Validate caller is an owner
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can add new owners";
                details = null;
            });
        };

        // Check if principal is already an owner
        if (isOwnerPrincipal(owner)) {
            return #err({
                code = 400;
                message = "Principal is already an owner";
                details = null;
            });
        };

        // Add new owner
        owners := Array.append(owners, [owner]);
        isOwner := Array.append(isOwner, [(owner, true)]);

        #ok()
    };

    public shared({ caller }) func removeOwner(owner: Principal) : async Result.Result<(), Types.ApiError> {
        // Validate caller is an owner
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can remove owners";
                details = null;
            });
        };

        // Cannot remove self
        if (Principal.equal(caller, owner)) {
            return #err({
                code = 400;
                message = "Owner cannot remove themselves";
                details = null;
            });
        };

        // Check if principal is an owner
        if (not isOwnerPrincipal(owner)) {
            return #err({
                code = 400;
                message = "Principal is not an owner";
                details = null;
            });
        };

        // Ensure we maintain minimum number of owners for threshold
        if (owners.size() <= threshold) {
            return #err({
                code = 400;
                message = "Cannot remove owner: would make threshold impossible";
                details = null;
            });
        };

        // Remove owner
        owners := Array.filter(owners, func(p: Principal) : Bool { 
            not Principal.equal(p, owner) 
        });
        isOwner := Array.filter(isOwner, func(p: (Principal, Bool)) : Bool { 
            not Principal.equal(p.0, owner) 
        });

        #ok()
    };

    public shared({ caller }) func swapOwner(oldOwner: Principal, newOwner: Principal) : async Result.Result<(), Types.ApiError> {
        // Validate caller is an owner
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can swap owners";
                details = null;
            });
        };

        // Check if old owner exists
        if (not isOwnerPrincipal(oldOwner)) {
            return #err({
                code = 400;
                message = "Old owner is not an owner";
                details = null;
            });
        };

        // Check if new owner is not already an owner
        if (isOwnerPrincipal(newOwner)) {
            return #err({
                code = 400;
                message = "New owner is already an owner";
                details = null;
            });
        };

        // Replace old owner with new owner
        owners := Array.map(owners, func(p: Principal) : Principal {
            if (Principal.equal(p, oldOwner)) { newOwner } else { p }
        });
        
        isOwner := Array.map<(Principal, Bool), (Principal, Bool)>(isOwner, func(p: (Principal, Bool)) : (Principal, Bool) {
            if (Principal.equal(p.0, oldOwner)) { (newOwner, true) } else { p }
        });

        #ok()
    };

    // Helper function to check if a principal is an owner
    private func isOwnerPrincipal(p: Principal) : Bool {
        for ((owner, isActive) in isOwner.vals()) {
            if (Principal.equal(owner, p) and isActive) {
                return true;
            };
        };
        false
    };

    // Threshold Management
    public shared({ caller }) func changeThreshold(threshold_value: Nat) : async Result.Result<(), Types.ApiError> {
        // Validate caller is an owner
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can change threshold";
                details = null;
            });
        };

        // Validate new threshold value
        if (threshold_value == 0) {
            return #err({
                code = 400;
                message = "Threshold cannot be zero";
                details = null;
            });
        };

        if (threshold_value > owners.size()) {
            return #err({
                code = 400;
                message = "Threshold cannot be greater than number of owners";
                details = null;
            });
        };

        // Update threshold
        threshold := threshold_value;

        #ok()
    };

    // Security & Modules
    public shared({ caller }) func setGuard(guard: Principal) : async Result.Result<(), Types.ApiError> {
        #err({
            code = 501;
            message = "Not implemented";
            details = null;
        })
    };

    public shared({ caller }) func enableModule(mod: Principal) : async Result.Result<(), Types.ApiError> {
        #err({
            code = 501;
            message = "Not implemented";
            details = null;
        })
    };

    public shared({ caller }) func disableModule(mod: Principal) : async Result.Result<(), Types.ApiError> {
        #err({
            code = 501;
            message = "Not implemented";
            details = null;
        })
    };

    // Utility & Queries
    public query func getTransactionDetails(txId: Nat) : async Result.Result<Types.TransactionDetails, Types.ApiError> {
        switch (Map.get(confirmations, nhash, txId)) {
            case null {
                #err({
                    code = 404;
                    message = "Transaction not found";
                    details = ?("No transaction exists with ID: " # Nat.toText(txId));
                })
            };
            case (?confirms) {
                switch (Map.get(transactions, nhash, txId)) {
                    case null { 
                        #err({
                            code = 500;
                            message = "Data inconsistency error";
                            details = ?("Transaction exists but data is missing");
                        }) 
                    };
                    case (?transaction) {
                        let confirmationCount = Array.foldLeft<(Principal, Bool), Nat>(
                            confirms,
                            0,
                            func(acc : Nat, (p, confirmed) : (Principal, Bool)) : Nat {
                                if (isOwnerPrincipal(p) and confirmed) { acc + 1 } else { acc }
                            }
                        );

                        #ok({
                            id = txId;
                            transaction = transaction;
                            confirmations = confirmationCount;
                            threshold = threshold;
                            required = threshold;
                            executed = false;
                        })
                    };
                }
            }
        }
    };

    public query func isConfirmed(txId: Nat) : async Bool {
        false
    };

    public query func getOwners() : async [Principal] {
        owners
    };

    public shared query func getTransactions() : async [Types.TransactionDetails] {
        let txEntries = Map.toArray(transactions);
        Array.map<(Nat, Types.Transaction), Types.TransactionDetails>(
            txEntries,
            func((txId, transaction)) {
                let confirms_query = Map.get(confirmations, nhash, txId);
                let confirms : [(Principal, Bool)] = switch(confirms_query) {
                    case null { [] };
                    case (?c) { c };
                };
                
                let confirmationCount = Array.foldLeft<(Principal, Bool), Nat>(
                    confirms,
                    0,
                    func(acc : Nat, (p, confirmed) : (Principal, Bool)) : Nat {
                        if (isOwnerPrincipal(p) and confirmed) { acc + 1 } else { acc }
                    }
                );

                {
                    id = txId;
                    transaction = transaction;
                    confirmations = confirmationCount;
                    threshold = threshold;
                    required = threshold;
                    executed = false;
                }
            }
        )
    }
};
