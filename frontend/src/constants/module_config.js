import { InMemoryTransactionRepository } from "@/repository/transactions";
import { InMemorySignerRepository } from "@/repository/signers";
import { InMemoryVaultRepository } from "@/repository/vault";
import { GlobalSettings } from "@/constants/global_config";

const SourceToRepository = {
  transactions: {
    mock: InMemoryTransactionRepository,
  },
  signers: {
    mock: InMemorySignerRepository,
  },
  vault: {
    mock: InMemoryVaultRepository,
  },
};

const getRepository = (module) => {
  const source = GlobalSettings[module].source;
  return SourceToRepository[module][source];
};

export { SourceToRepository, getRepository };
