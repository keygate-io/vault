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
  avatarUrl: faker.image.avatarGitHub(),
};

export function getMockedCurrentUser() {
  return mockedCurrentUser;
}

// Initialize lastUserId to be higher than the current user's ID
let lastUserId = mockedCurrentUser.id;
export function generateMockUserId() {
  return ++lastUserId;
}

const generatedMockUsers = [];
export function generateMockUsers() {
  if (generatedMockUsers.length > 0) {
    return generatedMockUsers;
  }

  // Add mocked current user first
  generatedMockUsers.push(getMockedCurrentUser());

  for (let i = 0; i < 9; i++) {
    generatedMockUsers.push({
      id: generateMockUserId(),
      name: faker.person.firstName(),
      avatarUrl: faker.image.avatarGitHub(),
    });
  }
  return generatedMockUsers;
}

let generatedMockSigners = {};
export function generateMockSigners() {
  if (generatedMockSigners.length > 0) {
    return generatedMockSigners;
  }

  let signers = {};
  const currentUser = getMockedCurrentUser();
  const users = generateMockUsers();

  for (let vault of generatedMockVaults) {
    // select mocked users at random
    const index_start = faker.number.int({ min: 0, max: users.length - 1 });
    const index_end = faker.number.int({
      min: index_start + 1,
      max: users.length,
    });

    const signers_for_vault = users
      .slice(index_start, index_end)
      .map((user) => user.id);

    // Add current user if not already included
    if (!signers_for_vault.includes(currentUser.id)) {
      signers_for_vault.push(currentUser.id);
    }

    signers[vault.id] = signers_for_vault;
  }

  // Ensure each vault has at least one signer
  for (let vault of generatedMockVaults) {
    if (!signers[vault.id] || signers[vault.id].length === 0) {
      console.warn("Mocked vault has no signers", vault.id);
    }
  }

  generatedMockSigners = signers;

  return signers;
}

let lastTransactionId = 0;
export function generateMockTransactionId() {
  return lastTransactionId++;
}

let lastVaultId = 0;
export function generateMockVault() {
  return {
    id: lastVaultId++,
    balance: faker.number.float({ min: 0, max: 1000, precision: 0.01 }),
    threshold: faker.number.int({ min: 1, max: 5 }),
  };
}

let generatedMockVaults = [];
export function generateMockVaults(numberOfVaults = 3) {
  if (generatedMockVaults.length > 0) {
    return generatedMockVaults;
  }

  const vaults = [];
  for (let i = 0; i < numberOfVaults; i++) {
    vaults.push(generateMockVault());
  }
  generatedMockVaults = vaults;
  return vaults;
}

let mockedCurrentVault = {
  id: 1,
  name: "Vault 1",
};

export function getMockedCurrentVault() {
  return mockedCurrentVault;
}
