export const idlFactory = ({ IDL }) => {
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const ProposalAction = IDL.Variant({
    'Transaction' : IDL.Record({ 'to' : IDL.Principal, 'amount' : Tokens }),
    'Invite' : IDL.Principal,
  });
  const Proposal = IDL.Record({
    'id' : IDL.Nat,
    'action' : ProposalAction,
    'threshold' : IDL.Nat,
    'decisions' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Bool)),
    'required' : IDL.Nat,
    'executed' : IDL.Bool,
    'created_at_time' : IDL.Opt(IDL.Int),
  });
  const ApiError = IDL.Record({
    'code' : IDL.Nat,
    'message' : IDL.Text,
    'details' : IDL.Opt(IDL.Text),
  });
  const Result = IDL.Variant({ 'ok' : Proposal, 'err' : ApiError });
  const Vault = IDL.Service({
    'confirm' : IDL.Func([IDL.Nat], [Result], []),
    'execute' : IDL.Func([IDL.Nat], [Result], []),
    'executeProposal' : IDL.Func([IDL.Nat], [Result], []),
    'getInvitations' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'getOwners' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getTransactionDetails' : IDL.Func([IDL.Nat], [Result], ['query']),
    'getTransactions' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'isConfirmed' : IDL.Func([IDL.Nat], [IDL.Bool], ['query']),
    'propose' : IDL.Func([ProposalAction], [Result], []),
  });
  return Vault;
};
export const init = ({ IDL }) => { return [IDL.Vec(IDL.Principal), IDL.Nat]; };
