const PendingFilter = {
  value: "pending",
  label: "Pending",
  fn: (tx) => tx.isExecuted === false,
};

const ExecutedFilter = {
  value: "executed",
  label: "Executed",
  fn: (tx) => tx.isExecuted === true && tx.isSuccessful === true,
};

const FailedFilter = {
  value: "failed",
  label: "Failed",
  fn: (tx) => tx.isSuccessful === false,
};

export { PendingFilter, ExecutedFilter, FailedFilter };
