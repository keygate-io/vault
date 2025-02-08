export const idlFactory = ({ IDL }) => {
  const Result_3 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Vault = IDL.Record({
    'name' : IDL.Text,
    'canister_id' : IDL.Principal,
  });
  const Result_1 = IDL.Variant({ 'ok' : Vault, 'err' : IDL.Text });
  const User = IDL.Record({ 'principal' : IDL.Principal, 'name' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : User, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Vec(User), 'err' : IDL.Text });
  const Manager = IDL.Service({
    'addOwner' : IDL.Func([IDL.Nat, IDL.Principal], [Result_3], []),
    'createVault' : IDL.Func([IDL.Text], [Result_1], []),
    'executeTransaction' : IDL.Func([IDL.Nat, IDL.Nat], [Result_3], []),
    'getOrCreateUser' : IDL.Func([], [Result], []),
    'getOwners' : IDL.Func([IDL.Nat], [Result_2], ['query']),
    'getUser' : IDL.Func([], [Result], []),
    'getUsers' : IDL.Func([], [IDL.Vec(User)], ['query']),
    'getVault' : IDL.Func([IDL.Nat], [Result_1], ['query']),
    'getVaults' : IDL.Func([], [IDL.Vec(Vault)], ['query']),
    'registerUser' : IDL.Func([IDL.Text], [Result], []),
    'registerUserWithPrincipal' : IDL.Func(
        [IDL.Principal, IDL.Text],
        [Result],
        [],
      ),
  });
  return Manager;
};
export const init = ({ IDL }) => { return []; };
