import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Types "types";
import Time "mo:base/Time";
import Map "mo:map/Map";
import { nhash } "mo:map/Map";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Nat64 "mo:base/Nat64";
import ProposalExecutor "proposal_executor";

actor class Vault(initOwners : [Principal], initThreshold : Nat) = this {
    // Initialize proposal executor
    private let executor = ProposalExecutor.ProposalExecutor();

    // State variables
    private stable var owners : [Principal] = initOwners;
    private stable var isOwner : [(Principal, Bool)] = Array.map<Principal, (Principal, Bool)>(initOwners, func(p: Principal) : (Principal, Bool) {
        (p, true)
    });

    // State variables
    private stable var proposalCount : Nat = 0;
    private stable var proposals = Map.new<Nat, Types.Proposal>();
    private stable var transactions = Map.new<Nat, Types.Transaction>();
    private stable var decisions = Map.new<Nat, [(Principal, Bool)]>();
    private stable var invitations = Map.new<Nat, Principal>();

    private stable var threshold : Nat = initThreshold;

    public shared({ caller }) func propose(action: Types.ProposalAction) : async Result.Result<Types.Proposal, Types.ApiError> {
        if (not isOwnerPrincipal(caller)) {
            return #err({ code = 403; message = "Only owners can propose actions"; details = null });
        };

        let proposal : Types.Proposal = {
            id = proposalCount;
            action = action;
            confirmations = [(caller, true)];
            executed = false;
            created_at_time = Time.now();
        };

        proposalCount += 1;
        Map.set(proposals, nhash, proposal.id, proposal);
        #ok(proposal)
    };

    public shared({ caller }) func confirm(proposalId: Nat) : async Result.Result<Types.Proposal, Types.ApiError> {
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can confirm proposals";
                details = null
            })
        };

        let optProposal = Map.get(proposals, nhash, proposalId);
        switch (optProposal) {
            case null {
                return #err({
                    code = 404;
                    message = "Proposal not found";
                    details = null
                })
            };
            case (?proposal) {
                let alreadyConfirmed = Array.find(proposal.confirmations, func((p, confirmed) : (Principal, Bool)) : Bool {
                    Principal.equal(p, caller) and confirmed
                });

                if (alreadyConfirmed != null) {
                    return #err({
                        code = 400;
                        message = "You have already confirmed this proposal";
                        details = null
                    })
                };

                let newConfirmations = Array.append(proposal.confirmations, [(caller, true)]);
                let updatedProposal = { proposal with confirmations = newConfirmations };
                Map.set(proposals, nhash, proposalId, updatedProposal);
                #ok(updatedProposal)
            }
        }
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
                        // Create a proposal for the transaction
                        let proposal : Types.Proposal = {
                            id = transaction.id;
                            action = #Transaction({
                                amount = transaction.amount;
                                to = transaction.to;
                            });
                            confirmations = confirmations;
                            executed = false;
                            created_at_time = switch (transaction.created_at_time) {
                                case null Time.now();
                                case (?time) time;
                            };
                        };

                        // Validate confirmations
                        let confirmationsResult = executor.validateConfirmations(proposal, threshold);
                        switch (confirmationsResult) {
                            case (#err(e)) { return #err(e) };
                            case (#ok(_)) {
                                try {
                                    let result = await executor.executeTransaction(proposal, transaction, proposals);
                                    switch (result) {
                                        case (#ok(executedProposal)) {
                                            let updatedTransaction = {
                                                id = transaction.id;
                                                amount = transaction.amount;
                                                to = transaction.to;
                                                created_at_time = transaction.created_at_time;
                                                executed = true;
                                            };
                                            Map.set(transactions, nhash, transaction.id, updatedTransaction);
                                            
                                            #ok({
                                                id = txId;
                                                transaction = updatedTransaction;
                                                decisions = confirmations;
                                                threshold = threshold;
                                                required = threshold;
                                            })
                                        };
                                        case (#err(e)) { #err(e) };
                                    };
                                } catch (error : Error) {
                                    #err({
                                        code = 500;
                                        message = "Transfer failed: " # Error.message(error);
                                        details = ?(Error.message(error))
                                    })
                                };
                            };
                        };
                    };
                };
            };
        };
    };

    // Owner Management
    public shared({ caller }) func proposeTransaction(to: Principal, amount: Nat) : async Result.Result<Types.Proposal, Types.ApiError> {
        let action : Types.ProposalAction = #Transaction({
            to = to;
            amount = { 
                e8s = Nat64.fromNat(amount)
            };
        });
        await propose(action)
    };

    public shared({ caller }) func invite(principalId: Principal) : async Result.Result<Types.Proposal, Types.ApiError> {
        let action : Types.ProposalAction = #Invite(principalId);
        await propose(action)
    };

    // Helper function to check if a principal is an owner
    private func isOwnerPrincipal(p: Principal) : Bool {
        Debug.print("isOwnerPrincipal: " # debug_show(p));
        Debug.print("owners: " # debug_show(owners));

        for ((owner, isActive) in isOwner.vals()) {
            if (Principal.equal(owner, p) and isActive) {
                return true;
            };
        };
        false
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
    };

    public shared({ caller }) func executeProposal(proposalId: Nat) : async Result.Result<Types.Proposal, Types.ApiError> {
        let validationResult = executor.validateExecution(caller, proposalId, proposals, isOwnerPrincipal);
        switch (validationResult) {
            case (#err(e)) { return #err(e) };
            case (#ok(proposal)) {
                // Validate confirmations
                let confirmationsResult = executor.validateConfirmations(proposal, threshold);
                switch (confirmationsResult) {
                    case (#err(e)) { return #err(e) };
                    case (#ok(_)) {
                        // Execute based on proposal type
                        switch (proposal.action) {
                            case (#Transaction({ amount; to })) { 
                                let tx = {
                                    id = proposal.id;
                                    amount = amount;
                                    to = to;
                                    created_at_time = ?proposal.created_at_time;
                                    executed = false;
                                };
                                await executor.executeTransaction(proposal, tx, proposals)
                            };
                            case (#Invite(principalId)) { 
                                executor.executeInvite(proposal, principalId, proposals, invitations)
                            };
                        }
                    };
                }
            };
        }
    };
};
