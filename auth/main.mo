import Hash

persistent actor AuthRegistry {
    let users: Map<String, Principal> = Map.new();

    public func register(googleId: String): Principal {
        let publicKey = ic.ecdsa_public_key({
            canister_id = null;
            derivation_path = [ caller ];
            key_id = { curve = #secp256k1; name = "dfx_test_key" }; // TODO: change this to a real key
        });

        let principal = Principal.fromPublicKey(publicKey);
        users.put(googleId, principal);
        principal
    }
}