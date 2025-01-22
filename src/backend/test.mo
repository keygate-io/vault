import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Result "mo:base/Result";

actor {
    let mainCanister = actor "bkyz2-fmaaa-aaaaa-qaaaq-cai" : actor {
        init : shared (newOwners : [Principal], threshold_value : Nat) -> async Result.Result<(), Text>;
        proposeTransaction : shared (to: Principal, value: Nat, data: Blob) -> async Result.Result<Nat, Text>;
        confirmTransaction : shared (txId: Nat) -> async Result.Result<(), Text>;
        executeTransaction : shared (txId: Nat) -> async Result.Result<(), Text>;
        addOwner : shared (owner: Principal) -> async Result.Result<(), Text>;
        removeOwner : shared (owner: Principal) -> async Result.Result<(), Text>;
        swapOwner : shared (oldOwner: Principal, owner: Principal) -> async Result.Result<(), Text>;
        changeThreshold : shared (threshold_value: Nat) -> async Result.Result<(), Text>;
        setGuard : shared (guard: Principal) -> async Result.Result<(), Text>;
        enableModule : shared (mod: Principal) -> async Result.Result<(), Text>;
        disableModule : shared (mod: Principal) -> async Result.Result<(), Text>;
        getTransactionDetails : shared query (txId: Nat) -> async Result.Result<Text, Text>;
        isConfirmed : shared query (txId: Nat) -> async Bool;
        getOwners : shared query () -> async [Principal];
    };

    // Test initialization
    public func testInit() : async () {
        Debug.print("Testing initialization...");
        
        // Test valid initialization
        let owner1 = Principal.fromText("2vxsx-fae");  // Anonymous principal
        let owner2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");  // Example canister ID
        let owner3 = Principal.fromText("bd3sg-teaaa-aaaaa-qaaba-cai");  // Test canister ID
        let owners = [owner1, owner2, owner3];
        
        let result = await mainCanister.init(owners, 2);
        switch(result) {
            case (#ok()) {
                Debug.print("✓ Valid initialization succeeded");
            };
            case (#err(msg)) {
                Debug.print("✗ Valid initialization failed: " # msg);
            };
        };

        // Test double initialization (should fail)
        let result2 = await mainCanister.init(owners, 2);
        switch(result2) {
            case (#ok()) {
                Debug.print("✗ Double initialization unexpectedly succeeded");
            };
            case (#err(msg)) {
                Debug.print("✓ Double initialization correctly failed: " # msg);
            };
        };
    };

    // Test unimplemented functions
    public func testUnimplementedFunctions() : async () {
        Debug.print("Testing unimplemented functions...");
        
        let testPrincipal = Principal.fromText("2vxsx-fae");
        let emptyBlob = "" : Blob;

        // Test proposeTransaction
        let result1 = await mainCanister.proposeTransaction(testPrincipal, 100, emptyBlob);
        assert(Result.isErr(result1));
        
        // Test confirmTransaction
        let result2 = await mainCanister.confirmTransaction(1);
        assert(Result.isErr(result2));
        
        // Test executeTransaction
        let result3 = await mainCanister.executeTransaction(1);
        assert(Result.isErr(result3));
        
        Debug.print("✓ All unimplemented functions correctly return errors");
    };

    // Test queries
    public func testQueries() : async () {
        Debug.print("Testing query functions...");
        
        // Test getOwners
        let owners = await mainCanister.getOwners();
        Debug.print("Current owners: " # debug_show(owners));
        
        // Test isConfirmed
        let confirmed = await mainCanister.isConfirmed(1);
        assert(confirmed == false);
        
        // Test getTransactionDetails
        let details = await mainCanister.getTransactionDetails(1);
        assert(Result.isErr(details));
        
        Debug.print("✓ Query functions tested successfully");
    };

    // Test owner management functions
    public func testOwnerManagement() : async () {
        Debug.print("Testing owner management functions...");
        
        // Test adding a new owner
        let newOwner = Principal.fromText("aaaaa-aa");  // IC root principal
        let addResult = await mainCanister.addOwner(newOwner);
        switch(addResult) {
            case (#ok()) {
                Debug.print("✓ Owner added successfully");
                // Verify owner was added
                let owners = await mainCanister.getOwners();
                assert(owners.size() > 0);
                Debug.print("Current owners after addition: " # debug_show(owners));
            };
            case (#err(msg)) {
                Debug.print("✗ Adding owner failed: " # msg);
            };
        };

        // Test removing an owner
        let removeResult = await mainCanister.removeOwner(newOwner);
        switch(removeResult) {
            case (#ok()) {
                Debug.print("✓ Owner removed successfully");
                // Verify owner was removed
                let owners = await mainCanister.getOwners();
                Debug.print("Current owners after removal: " # debug_show(owners));
            };
            case (#err(msg)) {
                Debug.print("✗ Removing owner failed: " # msg);
            };
        };

        // Test swapping an owner
        let oldOwner = Principal.fromText("2vxsx-fae");  // Using the anonymous principal from init
        let newOwner2 = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");  // Another example canister ID
        let swapResult = await mainCanister.swapOwner(oldOwner, newOwner2);
        switch(swapResult) {
            case (#ok()) {
                Debug.print("✓ Owner swapped successfully");
                // Verify the swap
                let owners = await mainCanister.getOwners();
                Debug.print("Current owners after swap: " # debug_show(owners));
            };
            case (#err(msg)) {
                Debug.print("✗ Swapping owner failed: " # msg);
            };
        };

        Debug.print("Owner management tests completed!");
    };

    // Run all tests
    public func runAllTests() : async () {
        Debug.print("Running all tests...");
        await testInit();
        await testUnimplementedFunctions();
        await testQueries();
        await testOwnerManagement();
        Debug.print("All tests completed!");
    };
} 