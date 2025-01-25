import { InMemoryTransactionRepository } from "@/repository/transactions";
import { InMemorySignerRepository } from "@/repository/signers";
import { GlobalSettings } from "@/constants/global_config";

const SourceToRepository = {
  transactions: {
    mock: InMemoryTransactionRepository,
  },
  signers: {
    mock: InMemorySignerRepository,
  },
};

const getRepository = (module) => {
  const source = GlobalSettings[module].source;
  return SourceToRepository[module][source];
};

export { SourceToRepository, getRepository };
