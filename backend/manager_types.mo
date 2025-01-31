import Principal "mo:base/Principal";

module ManagerTypes {
    public type User = {
        name: Text;
    };

    public type Vault = {
        name: Text;
        canister_id: Principal;
    };
}