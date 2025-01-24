import { faker } from "@faker-js/faker"; // You'd need to install this package

export function generateMockTransactions(minimum = 0, maximum = 5) {
  const count = faker.number.int({ min: minimum, max: maximum });

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    recipient: faker.string.hexadecimal({ length: 64, prefix: "" }),
    amount: `${faker.number.float({ min: 0.1, max: 10, precision: 0.1 })} ICP`,
    approvals: faker.number.int({ min: 0, max: 3 }),
  }));
}

export function generateMockSigners(minimum = 0, maximum = 5) {
  const count = faker.number.int({ min: minimum, max: maximum });

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: faker.person.firstName(),
    address: `${faker.string.hexadecimal({ length: 40, prefix: "" })}`,
    avatarUrl: faker.datatype.boolean() ? faker.image.avatar() : null,
    isCurrentUser: index === 0,
  }));
}
