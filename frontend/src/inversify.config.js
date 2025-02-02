import { Container } from "inversify";
import { SIGNER_REPOSITORY, InMemorySignerRepository } from "@/repository/signers";
import { SESSION_REPOSITORY, ICPSessionRepository } from "@/repository/session";
import { VAULTS_REPOSITORY, ICPVaultsRepository } from "@/repository/vaults";

const container = new Container();
container.bind(SIGNER_REPOSITORY).to(InMemorySignerRepository);
container.bind(SESSION_REPOSITORY).to(ICPSessionRepository);
container.bind(VAULTS_REPOSITORY).to(ICPVaultsRepository);

export { container };