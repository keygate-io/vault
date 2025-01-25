import { faker } from "@faker-js/faker"; // You'd need to install this package

export function generateMockTransactions() {
  const minimumSuccessful = 1;
  const minimumExecuted = 1;
  const minimumFailed = 1;
  const minimumPending = 1;
  const maximumTransactions = 5;
  const count = faker.number.int({
    min: minimumSuccessful + minimumExecuted + minimumFailed,
    max: maximumTransactions,
  });

  // Create base transactions array
  const transactions = [];

  const failedTransactionTraits = {
    isExecuted: true,
    isSuccessful: false,
  };

  const successfulTransactionTraits = {
    isExecuted: true,
    isSuccessful: true,
  };

  // Add minimum required successful transactions
  for (let i = 0; i < minimumSuccessful; i++) {
    transactions.push({
      id: transactions.length + 1,
      recipient: faker.string.hexadecimal({ length: 64, prefix: "" }),
      amount: `${faker.number.float({
        min: 0.1,
        max: 10,
        precision: 0.1,
      })} ICP`,
      approvals: faker.number.int({ min: 2, max: 3 }),
      ...successfulTransactionTraits,
    });
  }

  // Add minimum required failed transactions
  for (let i = 0; i < minimumFailed; i++) {
    transactions.push({
      id: transactions.length + 1,
      recipient: faker.string.hexadecimal({ length: 64, prefix: "" }),
      amount: `${faker.number.float({
        min: 0.1,
        max: 10,
        precision: 0.1,
      })} ICP`,
      approvals: faker.number.int({ min: 0, max: 1 }),
      ...failedTransactionTraits,
    });
  }

  // Add minimum required pending transactions
  for (let i = 0; i < minimumPending; i++) {
    transactions.push({
      id: transactions.length + 1,
      recipient: faker.string.hexadecimal({ length: 64, prefix: "" }),
      amount: `${faker.number.float({
        min: 0.1,
        max: 10,
        precision: 0.1,
      })} ICP`,
      approvals: faker.number.int({ min: 0, max: 3 }),
      isExecuted: false,
      isSuccessful: false,
    });
  }

  // Fill remaining slots with random transactions
  const remaining = count - transactions.length;
  for (let i = 0; i < remaining; i++) {
    transactions.push({
      id: transactions.length + 1,
      recipient: faker.string.hexadecimal({ length: 64, prefix: "" }),
      amount: `${faker.number.float({
        min: 0.1,
        max: 10,
        precision: 0.1,
      })} ICP`,
      approvals: faker.number.int({ min: 0, max: 3 }),
      isExecuted: faker.datatype.boolean(),
      isSuccessful: faker.datatype.boolean(),
    });
  }

  return transactions;
}

export function generateMockThreshold(minimum = 1, maximum = 5) {
  return faker.number.int({ min: minimum, max: maximum });
}

export function generateMockSigners() {
  const minimumSigners = 1;
  const maximumSigners = 5;
  const count = faker.number.int({
    min: minimumSigners,
    max: maximumSigners,
  });

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: faker.person.firstName(),
    address: `${faker.string.hexadecimal({ length: 40, prefix: "" })}`,
    avatarUrl: faker.datatype.boolean() ? faker.image.avatar() : null,
    isCurrentUser: index === 0,
  }));
}


let lastTransactionId = 0;
export function generateMockTransactionId() {
  return lastTransactionId++;
}