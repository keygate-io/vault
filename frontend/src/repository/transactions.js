// Transaction model/type definition
export class Transaction {
  constructor(id, recipient, amount, approvals = 0) {
    this.id = id;
    this.recipient = recipient;
    this.amount = amount;
    this.approvals = approvals;
  }
}

// Repository interface (abstract class)
export class TransactionRepository {
  async getAll() {
    throw new Error("Not implemented");
  }
  async getById(id) {
    throw new Error("Not implemented");
  }
  async create(transaction) {
    throw new Error("Not implemented");
  }

  async createMany(transactions) {
    throw new Error("Not implemented");
  }

  async update(id, transaction) {
    throw new Error("Not implemented");
  }

  async delete(id) {
    throw new Error("Not implemented");
  }
}

// In-memory implementation of the repository
class InMemoryTransactionRepository extends TransactionRepository {
  constructor(initialTransactions = []) {
    super();
    this.transactions = new Map();
    initialTransactions.forEach((transaction) =>
      this.transactions.set(transaction.id, transaction)
    );
  }

  async getAll() {
    return Array.from(this.transactions.values());
  }

  async getById(id) {
    return this.transactions.get(id);
  }

  async create(transaction) {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async createMany(transactions) {
    transactions.forEach((transaction) =>
      this.transactions.set(transaction.id, transaction)
    );
  }

  async update(id, transaction) {
    if (!this.transactions.has(id)) return null;
    this.transactions.set(id, { ...transaction, id });
    return this.transactions.get(id);
  }

  async delete(id) {
    return this.transactions.delete(id);
  }
}

export { InMemoryTransactionRepository };
