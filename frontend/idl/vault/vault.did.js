export const idlFactory = ({ IDL }) => {
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const ProposalAction = IDL.Variant({
    'Transaction' : IDL.Record({ 'to' : IDL.Principal, 'amount' : Tokens }),
    'Invite' : IDL.Principal,
  });
  const Proposal = IDL.Record({
    'id' : IDL.Nat,
    'confirmations' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Bool)),
    'action' : ProposalAction,
    'executed' : IDL.Bool,
    'created_at_time' : IDL.Int,
  });
  const ApiError = IDL.Record({
    'code' : IDL.Nat,
    'message' : IDL.Text,
    'details' : IDL.Opt(IDL.Text),
  });
  const Result = IDL.Variant({ 'ok' : Proposal, 'err' : ApiError });
  const Transaction = IDL.Record({
    'id' : IDL.Nat,
    'to' : IDL.Principal,
    'executed' : IDL.Bool,
    'created_at_time' : IDL.Opt(IDL.Int),
    'amount' : Tokens,
  });
  const TransactionDetails = IDL.Record({
    'id' : IDL.Nat,
    'threshold' : IDL.Nat,
    'transaction' : Transaction,
    'decisions' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Bool)),
    'required' : IDL.Nat,
  });
  const Result_1 = IDL.Variant({ 'ok' : TransactionDetails, 'err' : ApiError });
  const Vault = IDL.Service({
    'confirm' : IDL.Func([IDL.Nat], [Result], []),
    'execute' : IDL.Func([IDL.Nat], [Result_1], []),
    'executeProposal' : IDL.Func([IDL.Nat], [Result], []),
    'getOwners' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getTransactionDetails' : IDL.Func([IDL.Nat], [Result_1], ['query']),
    'getTransactions' : IDL.Func([], [IDL.Vec(TransactionDetails)], ['query']),
    'invite' : IDL.Func([IDL.Principal], [Result], []),
    'isConfirmed' : IDL.Func([IDL.Nat], [IDL.Bool], ['query']),
    'propose' : IDL.Func([ProposalAction], [Result], []),
    'proposeTransaction' : IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
  });
  return Vault;
};
export const init = ({ IDL }) => { return [IDL.Vec(IDL.Principal), IDL.Nat]; };
