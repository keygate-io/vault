const PendingFilter = {
  value: "pending",
  label: "Pending",
  fn: (tx) => !tx.executed,
};

const ExecutedFilter = {
  value: "executed",
  label: "Executed",
  fn: (tx) => tx.executed,
};

const FailedFilter = {
  value: "failed",
  label: "Failed",
  fn: (tx) => false, // Since we no longer track failures separately
};

export { PendingFilter, ExecutedFilter, FailedFilter };
