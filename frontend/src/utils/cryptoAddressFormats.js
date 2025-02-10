import { Principal } from "@dfinity/principal";

function isValidPrincipal(principal) {
  try {
    if (!principal) return false;
    Principal.fromText(principal);
    return true;
  } catch (_) {
    // Any error means the principal is invalid
    return false;
  }
}

// We're removing the AccountIdentifier validation since we're moving to principal-based addressing
export { isValidPrincipal };
