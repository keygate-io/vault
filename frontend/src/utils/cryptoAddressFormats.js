function isValidAccountIdentifier(address) {
  const hexRegex = /^[0-9a-fA-F]{64}$/;
  return hexRegex.test(address);
}

function isValidPrincipal(address) {
  // Principal IDs follow the format: xxxxx-xxxxx-xxxxx-xxxxx-cai
  const principalRegex =
    /^[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-cai$/;
  return principalRegex.test(address);
}

export { isValidAccountIdentifier, isValidPrincipal };
