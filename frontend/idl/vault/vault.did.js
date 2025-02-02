export const idlFactory = ({ IDL }) => {
  const ApiError = IDL.Record({
    'code' : IDL.Nat,
    'message' : IDL.Text,
    'details' : IDL.Opt(IDL.Text),
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : ApiError });
  const AccountIdentifier = IDL.Vec(IDL.Nat8);
  const Time = IDL.Int;
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat });
  const Transaction = IDL.Record({
    'to' : AccountIdentifier,
    'created_at_time' : IDL.Opt(Time),
    'amount' : Tokens,
  });
  const TransactionDetails = IDL.Record({
    'id' : IDL.Nat,
    'confirmations' : IDL.Nat,
    'threshold' : IDL.Nat,
    'transaction' : Transaction,
    'required' : IDL.Nat,
    'executed' : IDL.Bool,
  });
  const Result_2 = IDL.Variant({ 'ok' : TransactionDetails, 'err' : ApiError });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : ApiError });
  return IDL.Service({
    'addOwner' : IDL.Func([IDL.Principal], [Result], []),
    'changeThreshold' : IDL.Func([IDL.Nat], [Result], []),
    'confirmTransaction' : IDL.Func([IDL.Nat], [Result], []),
    'disableModule' : IDL.Func([IDL.Principal], [Result], []),
    'enableModule' : IDL.Func([IDL.Principal], [Result], []),
    'executeTransaction' : IDL.Func([IDL.Nat], [Result], []),
    'getOwners' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getTransactionDetails' : IDL.Func([IDL.Nat], [Result_2], ['query']),
    'init' : IDL.Func([IDL.Vec(IDL.Principal), IDL.Nat], [Result], []),
    'isConfirmed' : IDL.Func([IDL.Nat], [IDL.Bool], ['query']),
    'proposeTransaction' : IDL.Func([IDL.Principal, IDL.Nat], [Result_1], []),
    'removeOwner' : IDL.Func([IDL.Principal], [Result], []),
    'setGuard' : IDL.Func([IDL.Principal], [Result], []),
    'swapOwner' : IDL.Func([IDL.Principal, IDL.Principal], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
