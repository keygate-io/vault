import { faker } from "@faker-js/faker"; // You'd need to install this package

export function generateDefaultTransactionTraits() {
  return {
    isExecuted: false,
    isSuccessful: false,
    approvals: 0,
  };
}

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
      isExecuted: false,
      isSuccessful: false,
    });
  }

  // Fill remaining slots with random transactions
  const remaining = count - transactions.length;
  for (let i = 0; i < remaining; i++) {
    const isExecuted = faker.datatype.boolean();
    if (isExecuted) {
      transactions.push({
        id: transactions.length + 1,
        recipient: faker.string.hexadecimal({ length: 64, prefix: "" }),
        amount: `${faker.number.float({
          min: 0.1,
          max: 10,
          precision: 0.1,
        })} ICP`,
        approvals: faker.number.int({ min: 0, max: 3 }),
        isExecuted: true,
        isSuccessful: faker.datatype.boolean(),
      });
    }
  }

  return transactions;
}

export function generateMockThreshold(minimum = 1, maximum = 5) {
  return faker.number.int({ min: minimum, max: maximum });
}

let mockedCurrentUser = {
  id: 1,
  name: "Travis",
  address: `${faker.string.hexadecimal({ length: 40, prefix: "" })}`,
  avatarUrl:
    "https://static.wikia.nocookie.net/charactercommunity/images/3/32/Piplup_%28Pokémon%29.png",
};

export function getMockedCurrentUser() {
  return mockedCurrentUser;
}

export function generateMockSigners() {
  // first one is current user
  const minimumSigners = 1;
  const maximumSigners = 5;
  const count = faker.number.int({
    min: minimumSigners,
    max: maximumSigners,
  });

  const signers = [
    {
      ...mockedCurrentUser,
      isCurrentUser: true,
    },
  ];

  // Generate additional signers
  for (let i = 1; i < count; i++) {
    signers.push({
      id: i + 1,
      name: faker.person.firstName(),
      address: `${faker.string.hexadecimal({ length: 40, prefix: "" })}`,
      avatarUrl: faker.datatype.boolean() ? faker.image.avatar() : null,
      isCurrentUser: false,
    });
  }

  return signers;
}


let lastTransactionId = 0;
export function generateMockTransactionId() {
  return lastTransactionId++;
}

export function generateMockVault() {
  return {
    balance: faker.number.float({ min: 0, max: 1000, precision: 0.01 }),
  };
}
