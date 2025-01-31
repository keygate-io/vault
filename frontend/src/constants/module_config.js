import { InMemoryTransactionRepository } from "@/repository/transactions";
import { InMemorySignerRepository } from "@/repository/signers";
import { InMemoryVaultRepository } from "@/repository/vaults";
import { InMemorySessionRepository, ICPSessionRepository } from "@/repository/session";
import { InMemoryUserRepository } from "@/repository/users";
import { InMemoryDecisionRepository } from "@/repository/decisions";
import { GlobalSettings } from "@/constants/global_config";

const SingletonRepositories = {};

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
    icp: ICPSessionRepository,
  },
  users: {
    mock: InMemoryUserRepository,
  },
  decisions: {
    mock: InMemoryDecisionRepository,
  },
};

const getRepository = (module) => {
  if (!SingletonRepositories[module]) {
    const source = GlobalSettings[module].source;
    const Repository = SourceToRepository[module]?.[source];

    if (!Repository) {
      throw new Error(`Repository ${module}/${source} not found`);
    }

    SingletonRepositories[module] = new Repository();
  }
  return SingletonRepositories[module];
};

export { SourceToRepository, getRepository }; 