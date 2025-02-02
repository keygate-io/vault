import Map "mo:map/Map";
import Array "mo:base/Array";
import { nhash } "mo:map/Map";
import ManagerTypes "manager_types";
import Principal "mo:base/Principal";

actor Manager {
    private stable let vaults = Map.make<Nat, ManagerTypes.Vault>(nhash, 1, {
        name = "Placeholder Vault";
        canister_id = Principal.fromText("aaaaa-aa");
    });

    private stable let owners = Map.new<Nat, Nat>(nhash, 1,  [1,2,3,4,5]);

    public func getUser() : async ManagerTypes.User {
        return { name = "Travis" };
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
        return Map.values<Nat, ManagerTypes.Vault>(vaults);
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
            { name = "Travis" },
            { name = "Bob" },
            { name = "Charlie" },
            { name = "Dave" },
            { name = "Eve" }
        ];
    };
}
