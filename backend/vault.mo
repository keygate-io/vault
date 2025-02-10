import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Types "types";
import Time "mo:base/Time";
import Map "mo:map/Map";
import { nhash } "mo:map/Map";
import Error "mo:base/Error";
import IcpLedger "canister:icp_ledger_canister";
import Debug "mo:base/Debug";
import Nat64 "mo:base/Nat64";



actor class Vault(initOwners : [Principal], initThreshold : Nat) = this {
    // State variables
    private stable var owners : [Principal] = initOwners;
    private stable var isOwner : [(Principal, Bool)] = Array.map<Principal, (Principal, Bool)>(initOwners, func(p: Principal) : (Principal, Bool) {
        (p, true)
    });

    // State variables
    private stable var transactionCount : Nat = 0;
    private stable var transactions = Map.new<Nat, Types.Transaction>();
    private stable var decisions = Map.new<Nat, [(Principal, Bool)]>();
    private stable var invitations = Map.new<Nat, Principal>();

    private stable var threshold : Nat = initThreshold;

    // Core Transaction Management
    public shared({ caller }) func proposeTransaction(to: Principal, value: Nat) : async Result.Result<Types.Transaction, Types.ApiError> {
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

        let toAccount : Types.Account = {
            owner = to;
            subaccount = null;
        };

        let transaction : Types.Transaction = {
            id = transactionCount;
            amount = { e8s = Nat64.fromNat(value) };
            to = toAccount;
            created_at_time = ?Time.now();
            executed = false;
        };

        // Assign the next transaction ID and update state
        transactionCount += 1;

        // Add the new transaction to the ledger
        Map.set(transactions, nhash, transaction.id, transaction);

        // Initialize confirmations with Map
        Map.set(decisions, nhash, transaction.id, [(caller, true)]);

        // Return the transaction ID
        #ok(transaction)
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

        switch (Map.get(decisions, nhash, txId)) {
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
                Map.set(decisions, nhash, txId, Array.append(existingConfirmations, [newConfirmation]));

                #ok(())
            }
        };
    };

    public shared({ caller }) func executeTransaction(txId: Nat) : async Result.Result<Types.TransactionDetails, Types.ApiError> {
        // Check if the caller is an owner
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can execute transactions";
                details = null
            });
        };

        // Check if transaction exists
        let txOpt = Map.get(transactions, nhash, txId);
        switch (txOpt) {
            case null {
                return #err({
                    code = 404;
                    message = "Transaction not found";
                    details = null
                });
            };
            case (?transaction) {
                // Get confirmations
                switch (Map.get(decisions, nhash, txId)) {
                    case null {
                        return #err({
                            code = 404;
                            message = "Transaction confirmations not found";
                            details = null
                        });
                    };
                    case (?confirmations) {
                        // Count valid confirmations
                        let confirmationCount = Array.foldLeft<(Principal, Bool), Nat>(
                            confirmations,
                            0,
                            func(acc, current) {
                                if (current.1) { acc + 1 } else { acc }
                            }
                        );

                        // Check if enough confirmations
                        if (confirmationCount < threshold) {
                            return #err({
                                code = 400;
                                message = "Not enough confirmations";
                                details = ?(Nat.toText(confirmationCount) # " of " # Nat.toText(threshold) # " required confirmations")
                            });
                        };

                        // Prepare transfer arguments
                        let transferArgs : Types.TransferArgs = {
                            to = transaction.to;
                            fee = ?10_000;
                            memo = null;
                            from_subaccount = null;
                            created_at_time = switch (transaction.created_at_time) {
                                case (null) { null };
                                case (?time) { ?Nat64.fromIntWrap(time) };
                            };
                            amount = Nat64.toNat(transaction.amount.e8s);
                        };

                        Debug.print(debug_show(transferArgs));

                        try {
                            // Execute transfer using ICRC1 transfer
                            let transferResult = await IcpLedger.icrc1_transfer(transferArgs);
                            
                            switch (transferResult) {
                                case (#Err(transferError)) {
                                    switch (transferError) {
                                        case (#BadFee(detail)) {
                                            #err({
                                                code = 500;
                                                message = "Invalid fee amount";
                                                details = ?(debug_show(detail))
                                            })
                                        };
                                        case (#InsufficientFunds(detail)) {
                                            #err({
                                                code = 400;
                                                message = "Insufficient funds for transfer";
                                                details = ?(debug_show(detail))
                                            })
                                        };
                                        case (#TxTooOld(detail)) {
                                            #err({
                                                code = 500;
                                                message = "Transaction request is too old";
                                                details = ?(debug_show(detail))
                                            })
                                        };
                                        case (#TxCreatedInFuture) {
                                            #err({
                                                code = 500;
                                                message = "Transaction timestamp is in the future";
                                                details = null
                                            })
                                        };
                                        case (#TxDuplicate(detail)) {
                                            #err({
                                                code = 500;
                                                message = "Transaction is a duplicate";
                                                details = ?(debug_show(detail))
                                            })
                                        };
                                    }
                                };
                                case (#Ok(_)) { 
                                    // Mark transaction as executed
                                    let updatedTransaction = {
                                        id = transaction.id;
                                        amount = transaction.amount;
                                        to = transaction.to;
                                        created_at_time = transaction.created_at_time;
                                        executed = true;
                                    };
                                    Map.set(transactions, nhash, transaction.id, updatedTransaction);
                                    
                                    // Return the updated transaction details
                                    #ok({
                                        id = txId;
                                        transaction = updatedTransaction;
                                        decisions = confirmations;
                                        threshold = threshold;
                                        required = threshold;
                                    })
                                };
                            };
                        } catch (error : Error) {
                            return #err({
                                code = 500;
                                message = "Transfer failed: " # Error.message(error);
                                details = ?(Error.message(error))
                            });
                        };
                    };
                };
            };
        };
    };

    // Owner Management
    public shared({ caller }) func invite(principalId: Principal) : async Result.Result<(), Types.ApiError> {
        // Validate caller is an owner
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can add new owners";
                details = null;
            });
        };

        // Check if principal is already an owner
        if (isOwnerPrincipal(principalId)) {
            return #err({
                code = 400;
                message = "Principal is already an owner";
                details = null;
            });
        };

        // Add principal to invitations
        Map.set(invitations, nhash, transactionCount, principalId);

        transactionCount += 1;

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


    // Utility & Queries
    public query func getTransactionDetails(txId: Nat) : async Result.Result<Types.TransactionDetails, Types.ApiError> {
        switch (Map.get(decisions, nhash, txId)) {
            case null {
                #err({
                    code = 404;
                    message = "Transaction not found";
                    details = ?("No transaction exists with ID: " # Nat.toText(txId));
                })
            };
            case (?decisions) {
                switch (Map.get(transactions, nhash, txId)) {
                    case null { 
                        #err({
                            code = 500;
                            message = "Data inconsistency error";
                            details = ?("Transaction exists but data is missing");
                        }) 
                    };
                    case (?transaction) {
                        #ok({
                            id = txId;
                            transaction = transaction;
                            decisions = decisions;
                            threshold = threshold;
                            required = threshold;
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
                let decisions_query = Map.get(decisions, nhash, txId);
                let decisions_array : [(Principal, Bool)] = switch(decisions_query) {
                    case null { [] };
                    case (?d) { d };
                };

                {
                    id = txId;
                    transaction = transaction;
                    decisions = decisions_array;
                    threshold = threshold;
                    required = threshold;
                }
            }
        )
    }
};
