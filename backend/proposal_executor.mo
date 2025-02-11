import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Types "types";
import Error "mo:base/Error";
import Map "mo:map/Map";
import { nhash } "mo:map/Map";
import Nat64 "mo:base/Nat64";
import IcpLedger "canister:icp_ledger_canister";
import Debug "mo:base/Debug";
import Time "mo:base/Time";

module {
    public class ProposalExecutor() {
        private func handleTransferError(error: Types.TransferError) : Types.ApiError {
            switch (error) {
                case (#BadFee { expected_fee }) {
                    { code = 500; message = "Invalid fee amount"; details = ?(debug_show(expected_fee)) }
                };
                case (#InsufficientFunds { balance }) {
                    { code = 400; message = "Insufficient funds for transfer"; details = ?(debug_show(balance)) }
                };
                case (#TooOld) {
                    { code = 500; message = "Transaction request is too old"; details = null }
                };
                case (#CreatedInFuture { ledger_time }) {
                    { code = 500; message = "Transaction timestamp is in the future"; details = ?(debug_show(ledger_time)) }
                };
                case (#Duplicate { duplicate_of }) {
                    { code = 500; message = "Transaction is a duplicate"; details = ?(debug_show(duplicate_of)) }
                };
                case (#BadBurn { min_burn_amount }) {
                    { code = 500; message = "Invalid burn amount"; details = ?(debug_show(min_burn_amount)) }
                };
                case (#TemporarilyUnavailable) {
                    { code = 503; message = "Service temporarily unavailable"; details = null }
                };
                case (#GenericError { error_code; message }) {
                    { code = 500; message = message; details = ?(debug_show(error_code)) }
                };
            }
        };

        public func validateExecution(
            caller: Principal,
            proposalId: Nat,
            proposals: Map.Map<Nat, Types.Proposal>,
            isOwnerPrincipal: (Principal) -> Bool
        ) : Result.Result<Types.Proposal, Types.ApiError> {
            if (not isOwnerPrincipal(caller)) {
                return #err({
                    code = 403;
                    message = "Only owners can execute proposals";
                    details = null
                });
            };

            let optProposal = Map.get(proposals, nhash, proposalId);
            switch (optProposal) {
                case null {
                    #err({
                        code = 404;
                        message = "Proposal not found";
                        details = null
                    })
                };
                case (?proposal) {
                    if (proposal.executed) {
                        #err({
                            code = 400;
                            message = "Proposal already executed";
                            details = null
                        })
                    } else {
                        #ok(proposal)
                    }
                };
            }
        };

        public func validateDecisions(
            proposal: Types.Proposal,
            threshold: Nat
        ) : Result.Result<(), Types.ApiError> {
            let decisionCount = Array.foldLeft<(Principal, Bool), Nat>(
                proposal.decisions,
                0,
                func(acc, current) {
                    if (current.1) { acc + 1 } else { acc }
                }
            );

            if (decisionCount < threshold) {
                #err({
                    code = 400;
                    message = "Not enough decisions";
                    details = ?("Got " # Nat.toText(decisionCount) # " but need " # Nat.toText(threshold))
                })
            } else {
                #ok(())
            }
        };

        public func executeTransaction(
            proposal: Types.Proposal,
            transaction: Types.Transaction,
            proposals: Map.Map<Nat, Types.Proposal>
        ) : async Result.Result<Types.Proposal, Types.ApiError> {
            try {
                // Prepare transfer arguments
                let transferArgs : Types.TransferArgs = {
                    to = {
                        owner = transaction.to.owner;
                        subaccount = null;
                    };
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
                            case (#BadBurn(detail)) {
                                #err({
                                    code = 500;
                                    message = "Invalid burn amount";
                                    details = ?(debug_show(detail))
                                })
                            };
                            case (#CreatedInFuture(detail)) {
                                #err({
                                    code = 500;
                                    message = "Transaction timestamp is in the future";
                                    details = ?(debug_show(detail))
                                })
                            };
                            case (#TemporarilyUnavailable) {
                                #err({
                                    code = 503;
                                    message = "Service temporarily unavailable";
                                    details = null;
                                })
                            };
                            case (#TooOld) {
                                #err({
                                    code = 400;
                                    message = "Transaction is too old";
                                    details = null;
                                })
                            };
                            case (#GenericError(detail)) {
                                #err({
                                    code = 500;
                                    message = detail.message;
                                    details = ?(debug_show(detail));
                                })
                            };
                        }
                    };
                    case (#Ok(_)) { 
                        // Update proposal as executed
                        let executedProposal = { proposal with executed = true };
                        Map.set(proposals, nhash, proposal.id, executedProposal);
                        #ok(executedProposal)
                    };
                };
            } catch (error : Error) {
                #err({
                    code = 500;
                    message = "Transfer failed: " # Error.message(error);
                    details = ?(Error.message(error))
                })
            };
        };

        public func executeInvite(
            proposal: Types.Proposal,
            principalId: Principal,
            proposals: Map.Map<Nat, Types.Proposal>,
            invitations: Map.Map<Nat, Principal>
        ) : Result.Result<Types.Proposal, Types.ApiError> {
            // Add principal to invitations
            Map.set(invitations, nhash, proposal.id, principalId);
            
            // Update proposal as executed
            let executedProposal = { proposal with executed = true };
            Map.set(proposals, nhash, proposal.id, executedProposal);
            #ok(executedProposal)
        };
    };
}; 