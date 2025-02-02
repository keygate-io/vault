export const idlFactory = ({ IDL }) => {
  const User = IDL.Record({ 'name' : IDL.Text });
  const Vault = IDL.Record({
    'name' : IDL.Text,
    'canister_id' : IDL.Principal,
  });
  return IDL.Service({
    'getSigners' : IDL.Func([IDL.Nat], [IDL.Vec(User)], []),
    'getUser' : IDL.Func([], [User], []),
    'getUsers' : IDL.Func([IDL.Nat], [IDL.Vec(User)], []),
    'getVault' : IDL.Func([IDL.Nat], [IDL.Opt(Vault)], []),
  });
};
export const init = ({ IDL }) => { return []; };
