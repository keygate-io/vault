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

    public func getUser() : async ManagerTypes.User {
        return { name = "Travis" };
    };

    public func getUsers(_: Nat) : async [ManagerTypes.User] {
        let users = [
            { name = "Travis" },
            { name = "Bob" },
            { name = "Charlie" },
            { name = "Dave" },
            { name = "Eve" },
            { name = "Mallory" },
            { name = "Trent" },
            { name = "Wendy" }
        ];

        return users;
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
