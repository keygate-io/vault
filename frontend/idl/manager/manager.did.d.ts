import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface User { 'name' : string }
export interface Vault { 'name' : string, 'canister_id' : Principal }
export interface _SERVICE {
  'getSigners' : ActorMethod<[bigint], Array<User>>,
  'getUser' : ActorMethod<[], User>,
  'getUsers' : ActorMethod<[bigint], Array<User>>,
  'getVault' : ActorMethod<[bigint], [] | [Vault]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
