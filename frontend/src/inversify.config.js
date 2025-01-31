import { Container } from "inversify";
import { SIGNER_REPOSITORY, InMemorySignerRepository } from "@/repository/signers";

const container = new Container();
container.bind(SIGNER_REPOSITORY).to(InMemorySignerRepository);

export { container };