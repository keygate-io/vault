import { createSelector } from "reselect";

const selectTransactions = (state) => state.transactions;

const makeSelectApprovalsByTxId = () =>
  createSelector(
    [selectTransactions, (_, txId) => txId], // Input selectors
    (transactions, txId) => {
      const transaction = transactions.transactions_list.find(
        (tx) => tx.id === txId
      );

      console.log("transaction", transaction);
      return transaction ? transaction.approvals || [] : [];
    }
  );

export { makeSelectApprovalsByTxId };
