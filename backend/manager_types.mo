import Principal "mo:base/Principal";

module ManagerTypes {
    public type User = {
        name: Text;
        principal: Principal;
    };

    public type Vault = {
        name: Text;
        canister_id: Principal;
    };
}