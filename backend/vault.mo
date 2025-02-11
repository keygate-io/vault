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

        // Store transaction or invitation based on action type
        switch (action) {
            case (#Transaction({ amount; to })) {
                let tx : Types.Transaction = {
                    id = proposalCount;
                    amount = amount;
                    to = { owner = to; subaccount = null };
                    created_at_time = ?Time.now();
                    executed = false;
                };
                Map.set(transactions, nhash, proposalCount, tx);
                Map.set(decisions, nhash, proposalCount, [(caller, true)]);
            };
            case (#Invite(principalId)) {
                Map.set(invitations, nhash, proposalCount, principalId);
                Map.set(decisions, nhash, proposalCount, [(caller, true)]);
            };
        };

        let proposal : Types.Proposal = {
            id = proposalCount;
            action = action;
            decisions = [(caller, true)];
            executed = false;
            created_at_time = ?Time.now();
            threshold = threshold;
            required = threshold;
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
                let alreadyConfirmed = Array.find(proposal.decisions, func((p, confirmed) : (Principal, Bool)) : Bool {
                    Principal.equal(p, caller) and confirmed
                });

                if (alreadyConfirmed != null) {
                    return #err({
                        code = 400;
                        message = "You have already confirmed this proposal";
                        details = null
                    })
                };

                let newDecisions = Array.append(proposal.decisions, [(caller, true)]);
                let updatedProposal = { proposal with decisions = newDecisions };
                Map.set(proposals, nhash, proposalId, updatedProposal);
                #ok(updatedProposal)
            }
        }
    };

    public shared({ caller }) func execute(proposalId: Nat) : async Result.Result<Types.Proposal, Types.ApiError> {
        // Check if the caller is an owner
        if (not isOwnerPrincipal(caller)) {
            return #err({
                code = 403;
                message = "Only owners can execute proposals";
                details = null
            });
        };

        // Get the proposal
        let optProposal = Map.get(proposals, nhash, proposalId);
        switch (optProposal) {
            case null {
                return #err({
                    code = 404;
                    message = "Proposal not found";
                    details = null
                });
            };
            case (?proposal) {
                // Validate decisions
                let decisionsResult = executor.validateDecisions(proposal, threshold);
                switch (decisionsResult) {
                    case (#err(e)) { return #err(e) };
                    case (#ok(_)) {
                        // Execute based on proposal type
                        switch (proposal.action) {
                            case (#Transaction({ amount; to })) { 
                                let tx : Types.Transaction = {
                                    id = proposal.id;
                                    amount = amount;
                                    to = { owner = to; subaccount = null };
                                    created_at_time = proposal.created_at_time;
                                    executed = false;
                                };
                                
                                try {
                                    let result = await executor.executeTransaction(proposal, tx, proposals);
                                    switch (result) {
                                        case (#ok(executedProposal)) {
                                            let updatedTransaction : Types.Transaction = {
                                                id = tx.id;
                                                amount = { e8s = amount.e8s };
                                                to = tx.to;
                                                created_at_time = proposal.created_at_time;
                                                executed = true;
                                            };
                                            Map.set(transactions, nhash, tx.id, updatedTransaction);
                                            #ok(executedProposal)
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
                            case (#Invite(principalId)) {
                                let result = executor.executeInvite(proposal, principalId, proposals, invitations);
                                switch (result) {
                                    case (#ok(executedProposal)) {
                                        // Add the new owner to both owners array and isOwner mapping
                                        owners := Array.append(owners, [principalId]);
                                        isOwner := Array.append(isOwner, [(principalId, true)]);
                                        
                                        let tx : Types.Transaction = {
                                            id = proposal.id;
                                            amount = { e8s = 0 : Nat64 };
                                            to = { owner = principalId; subaccount = null };
                                            created_at_time = proposal.created_at_time;
                                            executed = true;
                                        };
                                        Map.set(transactions, nhash, proposal.id, tx);
                                        #ok(executedProposal)
                                    };
                                    case (#err(e)) { #err(e) };
                                };
                            };
                        }
                    };
                }
            };
        }
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
    public query func getTransactionDetails(txId: Nat) : async Result.Result<Types.Proposal, Types.ApiError> {
        switch (Map.get(proposals, nhash, txId)) {
            case null {
                #err({
                    code = 404;
                    message = "Proposal not found";
                    details = ?("No proposal exists with ID: " # Nat.toText(txId));
                })
            };
            case (?proposal) {
                #ok(proposal)
            }
        }
    };

    public query func isConfirmed(txId: Nat) : async Bool {
        false
    };

    public query func getOwners() : async [Principal] {
        owners
    };

    public shared query func getTransactions() : async [Types.Proposal] {
        let proposalEntries = Map.toArray(proposals);
        Array.map<(Nat, Types.Proposal), Types.Proposal>(
            Array.filter<(Nat, Types.Proposal)>(
                proposalEntries,
                func((_, proposal)) {
                    switch (proposal.action) {
                        case (#Transaction(_)) { true };
                        case (_) { false };
                    }
                }
            ),
            func((_, proposal)) { proposal }
        )
    };

    public shared query func getInvitations() : async [Types.Proposal] {
        let proposalEntries = Map.toArray(proposals);
        Array.map<(Nat, Types.Proposal), Types.Proposal>(
            Array.filter<(Nat, Types.Proposal)>(
                proposalEntries,
                func((_, proposal)) {
                    switch (proposal.action) {
                        case (#Invite(_)) { true };
                        case (_) { false };
                    }
                }
            ),
            func((_, proposal)) { proposal }
        )
    };

    public shared({ caller }) func executeProposal(proposalId: Nat) : async Result.Result<Types.Proposal, Types.ApiError> {
        let validationResult = executor.validateExecution(caller, proposalId, proposals, isOwnerPrincipal);
        switch (validationResult) {
            case (#err(e)) { return #err(e) };
            case (#ok(proposal)) {
                // Validate decisions
                let decisionsResult = executor.validateDecisions(proposal, threshold);
                switch (decisionsResult) {
                    case (#err(e)) { return #err(e) };
                    case (#ok(_)) {
                        // Execute based on proposal type
                        switch (proposal.action) {
                            case (#Transaction({ amount; to })) { 
                                let tx : Types.Transaction = {
                                    id = proposal.id;
                                    amount = amount;
                                    to = { owner = to; subaccount = null };
                                    created_at_time = proposal.created_at_time;
                                    executed = false;
                                };
                                await executor.executeTransaction(proposal, tx, proposals)
                            };
                            case (#Invite(principalId)) { 
                                let result = executor.executeInvite(proposal, principalId, proposals, invitations);
                                switch (result) {
                                    case (#ok(executedProposal)) {
                                        // Add the new owner to both owners array and isOwner mapping
                                        owners := Array.append(owners, [principalId]);
                                        isOwner := Array.append(isOwner, [(principalId, true)]);
                                        
                                        let tx : Types.Transaction = {
                                            id = proposal.id;
                                            amount = { e8s = 0 : Nat64 };
                                            to = { owner = principalId; subaccount = null };
                                            created_at_time = proposal.created_at_time;
                                            executed = true;
                                        };
                                        Map.set(transactions, nhash, proposal.id, tx);
                                        #ok(executedProposal)
                                    };
                                    case (#err(e)) { #err(e) };
                                }
                            };
                        }
                    };
                }
            };
        }
    };
};
