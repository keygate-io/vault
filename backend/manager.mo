import Map "mo:map/Map";
import Array "mo:base/Array";
import { nhash; phash } "mo:map/Map";
import Types "types";
import Principal "mo:base/Principal";
import Cycles = "mo:base/ExperimentalCycles";
import Result "mo:base/Result";
import Buffer "mo:base/Buffer";
import Vault "vault";
shared actor class Manager() {
    type VaultCanister = Vault.Vault;

    private stable var nextVaultId : Nat = 0;
    private stable let vaults = Map.new<Nat, Types.Vault>();
    private stable let vaultOwners = Map.new<Nat, [Principal]>();

    // User management
    private stable let users = Map.new<Principal, Types.User>();

    // Public API
    public shared ({ caller }) func createVault(name : Text) : async Result.Result<Types.Vault, Text> {
        Cycles.add(80_000_000_000);
        
        let vaultId = nextVaultId;

        let vault_canister = await Vault.Vault([caller], 1);
        let canister_id = Principal.fromActor(vault_canister);

        let newVault : Types.Vault = {
            name = name;
            canister_id = canister_id;
        };

        switch (Map.get(users, phash, caller)) {
            case (?user) {
                Map.set(vaults, nhash, vaultId, newVault);
                Map.set(vaultOwners, nhash, vaultId, [caller]);
                nextVaultId += 1;
                #ok(newVault)
            };
            case null #err("User not registered");
        }

    };

    public query func getVault(vaultId : Nat) : async Result.Result<Types.Vault, Text> {
        switch (Map.get(vaults, nhash, vaultId)) {
            case (?vault) #ok(vault);
            case null #err("Vault not found");
        }
    };

    public query func getVaults() : async [Types.Vault] {
        let vaultEntries = Map.toArray(vaults);
        Array.map(vaultEntries, func ((id, vault) : (Nat, Types.Vault)) : Types.Vault { vault })
    };

    public shared ({ caller }) func addOwner(vaultId : Nat, newOwner : Principal) : async Result.Result<(), Text> {
        switch (Map.get(vaultOwners, nhash, vaultId)) {
            case (?owners) {
                if (Array.find<Principal>(owners, func x = Principal.equal(x, newOwner)) != null) {
                    return #err("User already an owner");
                };
                let newOwners = Array.append(owners, [newOwner]);
                Map.set(vaultOwners, nhash, vaultId, newOwners);
                #ok
            };
            case null #err("Vault not found");
        }
    };

    public shared ({ caller }) func registerUser(name : Text) : async Result.Result<Types.User, Text> {
        let newUser : Types.User = {
            name = name;
            principal = caller;
        };

        ignore Map.put(users, phash, caller, newUser);
        #ok(newUser)
    };

    public func registerUserWithPrincipal(principal : Principal, name : Text) : async Result.Result<Types.User, Text> {
        let newUser : Types.User = {
            name = name;
            principal = principal;
        };

        ignore Map.put(users, phash, principal, newUser);
        #ok(newUser)
    };

    public shared ({ caller }) func getOrCreateUser() : async Result.Result<Types.User, Text> {
        switch (Map.get(users, phash, caller)) {
            case (?user) #ok(user);
            case null {
                let result = await registerUserWithPrincipal(caller, "Alex");
                result
            };
        }
    };

    public shared ({ caller }) func getUser() : async Result.Result<Types.User, Text> {
        switch (Map.get(users, phash, caller)) {
            case (?user) #ok(user);
            case null #err("User not found");
        };
    };

    public query func getUsers() : async [Types.User] {
        let userEntries = Map.toArray(users);
        Array.map(userEntries, func ((principal, user) : (Principal, Types.User)) : Types.User { user })
    };

    public query func getOwners(vaultId : Nat) : async Result.Result<[Types.User], Text> {
        switch (Map.get(vaultOwners, nhash, vaultId)) {
            case (?ownerPrincipals) {
                let owners = Array.mapFilter<Principal, Types.User>(
                    ownerPrincipals,
                    func (principal) = Map.get(users, phash, principal)
                );
                #ok(owners)
            };
            case null #err("Vault not found");
        }
    };
}
