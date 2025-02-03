export const idlFactory = ({ IDL }) => {
  const Test = IDL.Service({
    'runAllTests' : IDL.Func([], [], []),
    'testConfirmTransaction' : IDL.Func([], [], []),
    'testGetTransactions' : IDL.Func([], [], []),
    'testInit' : IDL.Func([], [], []),
    'testOwnerManagement' : IDL.Func([], [], []),
    'testQueries' : IDL.Func([], [], []),
    'testThresholdConfiguration' : IDL.Func([], [], []),
    'testTransactionProposal' : IDL.Func([], [], []),
  });
  return Test;
};
export const init = ({ IDL }) => { return []; };
