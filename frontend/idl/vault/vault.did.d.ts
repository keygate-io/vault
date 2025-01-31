import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AccountIdentifier = Uint8Array | number[];
export interface ApiError {
  'code' : bigint,
  'message' : string,
  'details' : [] | [string],
}
export type Result = { 'ok' : null } |
  { 'err' : ApiError };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : ApiError };
export type Result_2 = { 'ok' : TransactionDetails } |
  { 'err' : ApiError };
export type Time = bigint;
export interface Tokens { 'e8s' : bigint }
export interface Transaction {
  'to' : AccountIdentifier,
  'created_at_time' : [] | [Time],
  'amount' : Tokens,
}
export interface TransactionDetails {
  'id' : bigint,
  'confirmations' : bigint,
  'threshold' : bigint,
  'transaction' : Transaction,
  'required' : bigint,
  'executed' : boolean,
}
export interface _SERVICE {
  'addOwner' : ActorMethod<[Principal], Result>,
  'changeThreshold' : ActorMethod<[bigint], Result>,
  'confirmTransaction' : ActorMethod<[bigint], Result>,
  'disableModule' : ActorMethod<[Principal], Result>,
  'enableModule' : ActorMethod<[Principal], Result>,
  'executeTransaction' : ActorMethod<[bigint], Result>,
  'getOwners' : ActorMethod<[], Array<Principal>>,
  'getTransactionDetails' : ActorMethod<[bigint], Result_2>,
  'init' : ActorMethod<[Array<Principal>, bigint], Result>,
  'isConfirmed' : ActorMethod<[bigint], boolean>,
  'proposeTransaction' : ActorMethod<[Principal, bigint], Result_1>,
  'removeOwner' : ActorMethod<[Principal], Result>,
  'setGuard' : ActorMethod<[Principal], Result>,
  'swapOwner' : ActorMethod<[Principal, Principal], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
