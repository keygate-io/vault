export const idlFactory = ({ IDL }) => {
  const User = IDL.Record({ 'name' : IDL.Text });
  const Vault = IDL.Record({
    'name' : IDL.Text,
    'canister_id' : IDL.Principal,
  });
  return IDL.Service({
    'getOwners' : IDL.Func([IDL.Nat], [IDL.Vec(User)], []),
    'getSigners' : IDL.Func([IDL.Nat], [IDL.Vec(User)], []),
    'getUser' : IDL.Func([], [User], []),
    'getUserById' : IDL.Func([IDL.Nat], [User], []),
    'getUsers' : IDL.Func([IDL.Nat], [IDL.Vec(User)], []),
    'getVault' : IDL.Func([IDL.Nat], [IDL.Opt(Vault)], []),
    'getVaults' : IDL.Func([], [IDL.Vec(Vault)], []),
  });
};
export const init = ({ IDL }) => { return []; };
