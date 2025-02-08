import { Container } from "inversify";
import { SESSION_REPOSITORY, ICPSessionRepository } from "@/repository/session";
import { VAULTS_REPOSITORY, ICPVaultsRepository } from "@/repository/vaults";
import { SIGNER_REPOSITORY, ICPSignerRepository } from "@/repository/signers";
import { TRANSACTIONS_REPOSITORY, ICPTransactionRepository } from "@/repository/transactions";
import { USER_REPOSITORY, ICPUserRepository } from "@/repository/users";

const container = new Container();
container.bind(SIGNER_REPOSITORY).to(ICPSignerRepository).inSingletonScope();
container.bind(SESSION_REPOSITORY).to(ICPSessionRepository).inSingletonScope();
container.bind(VAULTS_REPOSITORY).to(ICPVaultsRepository).inSingletonScope();
container.bind(TRANSACTIONS_REPOSITORY).to(ICPTransactionRepository).inSingletonScope();
container.bind(USER_REPOSITORY).to(ICPUserRepository).inSingletonScope();

export { container };