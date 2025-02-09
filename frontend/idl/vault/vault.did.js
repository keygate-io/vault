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
    'id' : IDL.Nat,
    'to' : AccountIdentifier,
    'created_at_time' : IDL.Opt(Time),
    'amount' : Tokens,
  });
  const TransactionDetails = IDL.Record({
    'id' : IDL.Nat,
    'threshold' : IDL.Nat,
    'transaction' : Transaction,
    'decisions' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Bool)),
    'required' : IDL.Nat,
    'executed' : IDL.Bool,
  });
  const Result_2 = IDL.Variant({ 'ok' : TransactionDetails, 'err' : ApiError });
  const Result_1 = IDL.Variant({ 'ok' : Transaction, 'err' : ApiError });
  const Vault = IDL.Service({
    'addOwner' : IDL.Func([IDL.Principal], [Result], []),
    'changeThreshold' : IDL.Func([IDL.Nat], [Result], []),
    'confirmTransaction' : IDL.Func([IDL.Nat], [Result], []),
    'disableModule' : IDL.Func([IDL.Principal], [Result], []),
    'enableModule' : IDL.Func([IDL.Principal], [Result], []),
    'executeTransaction' : IDL.Func([IDL.Nat], [Result], []),
    'getCanisterId' : IDL.Func([], [IDL.Principal], ['query']),
    'getOwners' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'getTransactionDetails' : IDL.Func([IDL.Nat], [Result_2], ['query']),
    'getTransactions' : IDL.Func([], [IDL.Vec(TransactionDetails)], ['query']),
    'isConfirmed' : IDL.Func([IDL.Nat], [IDL.Bool], ['query']),
    'proposeTransaction' : IDL.Func([IDL.Principal, IDL.Nat], [Result_1], []),
    'removeOwner' : IDL.Func([IDL.Principal], [Result], []),
    'setGuard' : IDL.Func([IDL.Principal], [Result], []),
    'swapOwner' : IDL.Func([IDL.Principal, IDL.Principal], [Result], []),
  });
  return Vault;
};
export const init = ({ IDL }) => { return [IDL.Vec(IDL.Principal), IDL.Nat]; };
