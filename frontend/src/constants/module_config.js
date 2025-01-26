import { InMemoryTransactionRepository } from "@/repository/transactions";
import { InMemorySignerRepository } from "@/repository/signers";
import { InMemoryVaultRepository } from "@/repository/vaults";
import { InMemorySessionRepository } from "@/repository/session";
import { InMemoryUserRepository } from "@/repository/users";
import { GlobalSettings } from "@/constants/global_config";

const SourceToRepository = {
  transactions: {
    mock: InMemoryTransactionRepository,
  },
  signers: {
    mock: InMemorySignerRepository,
  },
  vaults: {
    mock: InMemoryVaultRepository,
  },
  session: {
    mock: InMemorySessionRepository,
  },
  users: {
    mock: InMemoryUserRepository,
  },
};

const getRepository = (module) => {
  const source = GlobalSettings[module].source;
  return SourceToRepository[module][source];
};

export { SourceToRepository, getRepository };
