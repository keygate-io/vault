import Map "mo:map/Map";
import Array "mo:base/Array";
import { nhash } "mo:map/Map";
import ManagerTypes "manager_types";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Vault "vault";

actor Manager {
    private stable var COUNTER : Nat = 0;
    private stable let vaults = Map.make<Nat, ManagerTypes.Vault>(nhash, 1, {
        name = "Placeholder Vault";
        canister_id = Principal.fromText("bkyz2-fmaaa-aaaaa-qaaaq-cai");
    });

    private stable let owners = Map.make<Nat, [Nat]>(nhash, 1,  [1,2,3,4,5]);

    public func createVault(name: Text) : async () {
        // Deploy
        let vault_canister = await Vault.Vault();
        let canister_id = Principal.fromActor(vault_canister);
        let vault: ManagerTypes.Vault = {
            name = name;
            canister_id = canister_id;
        };

        ignore Map.put(vaults, nhash, COUNTER, vault);
        COUNTER += 1;
    };

    public func getUser() : async ManagerTypes.User {
        return { id = 1; name = "Travis" };
    };

    public func getUsers(_: Nat) : async [ManagerTypes.User] {
        let users = [
            { id = 1; name = "Travis" },
            { id = 2; name = "Bob" },
            { id = 3; name = "Charlie" },
            { id = 4; name = "Dave" },
            { id = 5; name = "Eve" },
            { id = 6; name = "Mallory" },
            { id = 7; name = "Trent" },
            { id = 8; name = "Wendy" }
        ];

        return users;
    };

    public func getVaults() : async [ManagerTypes.Vault] {
        let kv = Map.toArray<Nat, ManagerTypes.Vault>(vaults);
        let f = func (vault: (Nat, ManagerTypes.Vault)) : ManagerTypes.Vault {
            vault.1;
        };

        return Array.map(kv, f);
    };

    public func getUserById(user_id: Nat) : async ManagerTypes.User {
        let users = [
            { id = 1; name = "Travis" },
            { id = 2; name = "Bob" },
            { id = 3; name = "Charlie" },
            { id = 4; name = "Dave" },
            { id = 5; name = "Eve" },
            { id = 6; name = "Mallory" },
            { id = 7; name = "Trent" },
            { id = 8; name = "Wendy" }
        ];

        switch user_id {
            case 1 { users[0] };
            case 2 { users[1] };
            case 3 { users[2] };
            case 4 { users[3] };
            case 5 { users[4] };
            case 6 { users[5] };
            case 7 { users[6] };
            case 8 { users[7] };
            case _ { { id = 0; name = "Unknown" } };
        }
    };

    public func getOwners(vault_id: Nat) : async [ManagerTypes.User] {
        let owners_for_vault = Map.get<Nat, [Nat]>(owners, nhash, vault_id);
        switch (owners_for_vault) {
            case null { [] };
            case (?owner_ids) {
                var users : [ManagerTypes.User] = [];
                for (owner in owner_ids.vals()) {
                    let user = await getUserById(owner);
                    users := Array.append(users, [user]);
                };
                users
            };
        }
    };

    public func getVault(_: Nat) : async ?ManagerTypes.Vault {
        let vault = Map.get<Nat, ManagerTypes.Vault>(vaults, nhash, 0);
        if (vault == null) {
            return null;
        };

        return vault;
    };

    public func getSigners(_: Nat) : async [ManagerTypes.User] {
        return [
            { id = 1; name = "Travis" },
            { id = 2; name = "Bob" },
            { id = 3; name = "Charlie" },
            { id = 4; name = "Dave" },
            { id = 5; name = "Eve" }
        ];
    };
}