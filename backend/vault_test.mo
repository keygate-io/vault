import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Types "types";
import Array "mo:base/Array";
actor class Test() = self {
    let mainCanister = actor "bkyz2-fmaaa-aaaaa-qaaaq-cai" : actor {
        init : shared (newOwners : [Principal], threshold_value : Nat) -> async Result.Result<(), Types.ApiError>;
        proposeTransaction : shared (to: Principal, value: Nat) -> async Result.Result<Nat, Types.ApiError>;
        confirmTransaction : shared (txId: Nat) -> async Result.Result<(), Types.ApiError>;
        executeTransaction : shared (txId: Nat) -> async Result.Result<(), Types.ApiError>;
        addOwner : shared (owner: Principal) -> async Result.Result<(), Types.ApiError>;
        removeOwner : shared (owner: Principal) -> async Result.Result<(), Types.ApiError>;
        swapOwner : shared (oldOwner: Principal, owner: Principal) -> async Result.Result<(), Types.ApiError>;
        changeThreshold : shared (threshold_value: Nat) -> async Result.Result<(), Types.ApiError>;
        setGuard : shared (guard: Principal) -> async Result.Result<(), Types.ApiError>;
        enableModule : shared (mod: Principal) -> async Result.Result<(), Types.ApiError>;
        disableModule : shared (mod: Principal) -> async Result.Result<(), Types.ApiError>;
        getTransactionDetails : shared query (txId: Nat) -> async Result.Result<Types.TransactionDetails, Types.ApiError>;
        isConfirmed : shared query (txId: Nat) -> async Bool;
        getOwners : shared query () -> async [Principal];
        getTransactions : shared query () -> async [Types.TransactionDetails];
    };

    // Test initialization
    public func testInit() : async () {
        Debug.print("Running Init Test: Basic initialization checks...");
        
        // Get test canister's actual principal
        let testPrincipal = Principal.fromActor(self);
        
        // Test valid initialization with test canister as owner
        let owner1 = testPrincipal;
        let owner2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
        let owner3 = Principal.fromText("bd3sg-teaaa-aaaaa-qaaba-cai");
        let owners = [owner1, owner2, owner3];
        
        let result = await mainCanister.init(owners, 2);
        switch(result) {
            case (#ok()) {
                Debug.print("✓ Valid initialization succeeded");
            };
            case (#err(apiErrorPayload)) {
                Debug.print("✗ Valid initialization failed: " # apiErrorPayload.message);
            };
        };

        // Test double initialization (should fail)
        let result2 = await mainCanister.init(owners, 2);
        switch(result2) {
            case (#ok()) {
                Debug.print("✗ Double initialization unexpectedly succeeded");
            };
            case (#err(apiErrorPayload)) {
                Debug.print("✓ Double initialization correctly failed: " # apiErrorPayload.message);
            };
        };
    };

    // Test queries
    public func testQueries() : async () {
        Debug.print("Running Query Test: Owner list and transaction status checks...");
        
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
        Debug.print("Running Owner Management Test: Add/Remove/Swap operations...");
        
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
            case (#err(apiErrorPayload)) {
                Debug.print("✗ Adding owner failed: " # apiErrorPayload.message);
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
            case (#err(apiErrorPayload)) {
                Debug.print("✗ Removing owner failed: " # apiErrorPayload.message);
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
            case (#err(apiErrorPayload)) {
                Debug.print("✗ Swapping owner failed: " # apiErrorPayload.message);
            };
        };

        Debug.print("Owner management tests completed!");
    };

    // Test threshold configuration
    public func testThresholdConfiguration() : async () {
        Debug.print("Running Threshold Test: Valid and invalid threshold changes...");
        
        // Test changing threshold to a valid value
        let validThreshold = 2;
        let result1 = await mainCanister.changeThreshold(validThreshold);
        switch(result1) {
            case (#ok()) {
                Debug.print("✓ Threshold changed successfully to " # debug_show(validThreshold));
            };
            case (#err(apiErrorPayload)) {
                Debug.print("✗ Changing threshold failed: " # apiErrorPayload.message);
            };
        };

        // Test changing threshold to 0 (should fail)
        let result2 = await mainCanister.changeThreshold(0);
        switch(result2) {
            case (#ok()) {
                Debug.print("✗ Setting threshold to 0 unexpectedly succeeded");
            };
            case (#err(apiErrorPayload)) {
                Debug.print("✓ Setting threshold to 0 correctly failed: " # apiErrorPayload.message);
            };
        };

        // Test changing threshold to a number greater than total owners (should fail)
        let owners = await mainCanister.getOwners();
        let invalidThreshold = owners.size() + 1;
        let result3 = await mainCanister.changeThreshold(invalidThreshold);
        switch(result3) {
            case (#ok()) {
                Debug.print("✗ Setting threshold higher than owner count unexpectedly succeeded");
            };
            case (#err(apiErrorPayload)) {
                Debug.print("✓ Setting threshold higher than owner count correctly failed: " # apiErrorPayload.message);
            };
        };

        Debug.print("Threshold configuration tests completed!");
    };

    // Test transaction proposal
    public func testTransactionProposal() : async () {
        Debug.print("Running Transaction Test: Proposal validation and edge cases...");

        // Test case 1: Propose a valid transaction
        let recipient = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
        let amount = 100;

        let result1 = await mainCanister.proposeTransaction(recipient, amount);
        switch(result1) {
            case (#ok(txId)) {
                Debug.print("✓ Transaction proposed successfully with ID: " # debug_show(txId));
                
                // Verify transaction exists
                let details = await mainCanister.getTransactionDetails(txId);
                switch(details) {
                    case (#ok(_)) {
                        Debug.print("✓ Transaction details retrieved successfully");
                    };
                    case (#err(apiErrorPayload)) {
                        Debug.print("✗ Failed to retrieve transaction details: " # apiErrorPayload.message);
                    };
                };

                // Verify initial confirmation status
                let isConfirmed = await mainCanister.isConfirmed(txId);
                assert(isConfirmed == false);
                Debug.print("✓ Initial confirmation status is correct (false)");
            };
            case (#err(apiErrorPayload)) {
                Debug.print("✗ Transaction proposal failed: " # apiErrorPayload.message);
            };
        };

        // Test case 2: Propose transaction with zero amount
        let result2 = await mainCanister.proposeTransaction(recipient, 0);
        switch(result2) {
            case (#ok(_)) {
                Debug.print("✗ Zero amount transaction unexpectedly succeeded");
            };
            case (#err(apiErrorPayload)) {
                Debug.print("✓ Zero amount transaction correctly failed: " # apiErrorPayload.message);
            };
        };

        Debug.print("Transaction proposal tests completed!");
    };

    
    public func testConfirmTransaction() : async () {
        Debug.print("Running Confirmation Test: Single/Duplicate confirmations and error handling...");

        // Propose a valid transaction first
        let recipient = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
        let amount = 100;
        let proposeResult = await mainCanister.proposeTransaction(recipient, amount);
        var txId : Nat = 0;
        switch(proposeResult) {
            case (#ok(id)) {
                txId := id;
                Debug.print("Transaction proposed with ID: " # debug_show(txId));
            };
            case (#err(err)) {
                Debug.print("✗ Failed to propose transaction: " # err.message);
                return;
            };
        };

        // Test confirming a valid transaction
        let confirmResult1 = await mainCanister.confirmTransaction(txId);
        switch(confirmResult1) {
            case (#ok()) {
                Debug.print("✓ First confirmation succeeded");
            };
            case (#err(err)) {
                Debug.print("✗ First confirmation failed: " # err.message);
            };
        };

        // Verify transaction details after confirmation
        let detailsResult = await mainCanister.getTransactionDetails(txId);
        switch(detailsResult) {
            case (#ok(details)) {
                Debug.print("Transaction details: " # debug_show(details));
                // Simply check the number of confirmations
                Debug.print("Current confirmation count: " # debug_show(details.confirmations));
                if (details.confirmations > 0) {
                    Debug.print("✓ Transaction has confirmations");
                } else {
                    Debug.print("✗ Transaction has no confirmations");
                };
            };
            case (#err(err)) {
                Debug.print("✗ Failed to get transaction details: " # err.message);
            };
        };

        // Check if transaction is fully confirmed (threshold is 2)
        let isConfirmed = await mainCanister.isConfirmed(txId);
        if (isConfirmed) {
            Debug.print("✗ Transaction incorrectly marked as fully confirmed");
        } else {
            Debug.print("✓ Transaction not fully confirmed yet (correct)");
        };

        // Test duplicate confirmation by same owner
        let confirmResult2 = await mainCanister.confirmTransaction(txId);
        switch(confirmResult2) {
            case (#ok()) {
                Debug.print("✗ Duplicate confirmation unexpectedly succeeded");
            };
            case (#err(err)) {
                if (err.code == 400) {
                    Debug.print("✓ Duplicate confirmation correctly failed with AlreadyConfirmed");
                } else {
                    Debug.print("✗ Duplicate confirmation failed with unexpected error: " # debug_show(err.code));
                };
            };
        };

        // Test confirming non-existent transaction
        let invalidTxId = 999;
        let confirmInvalidResult = await mainCanister.confirmTransaction(invalidTxId);
        switch(confirmInvalidResult) {
            case (#ok()) {
                Debug.print("✗ Confirming non-existent transaction succeeded");
            };
            case (#err(err)) {
                if (err.code == 404) {
                    Debug.print("✓ Confirming non-existent transaction correctly failed with TxNotFound");
                } else {
                    Debug.print("✗ Confirming non-existent transaction failed with unexpected error: " # debug_show(err.code));
                };
            };
        };

        Debug.print("Confirm transaction tests completed!");
    };

    // Updated test for getTransactions method
    public func testGetTransactions() : async () {
        Debug.print("Running Transaction History Test: Retrieval and ordering verification...");
        
        // First propose a transaction to ensure we have data
        let recipient = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
        let proposeResult = await mainCanister.proposeTransaction(recipient, 100);
        let txId : Nat = switch(proposeResult) {
            case (#ok(id)) id;
            case (#err(err)) {
                Debug.print("✗ Setup failed - could not propose transaction: " # err.message);
                return;
            };
        };

        // Test basic retrieval
        let transactions = await mainCanister.getTransactions();
        Debug.print("Retrieved transactions: " # debug_show(transactions));
        
        // Verify the proposed transaction exists in the list
        if (Array.find<Types.TransactionDetails>(transactions, func x = x.id == txId) != null) {
            Debug.print("✓ New transaction found in list");
        } else {
            Debug.print("✗ New transaction missing from list");
        };

        // Test multiple transactions
        let proposeResult2 = await mainCanister.proposeTransaction(recipient, 200);
        let txId2 : Nat = switch(proposeResult2) {
            case (#ok(id)) id;
            case (#err(err)) {
                Debug.print("✗ Setup failed - could not propose second transaction: " # err.message);
                return;
            };
        };

        let transactions2 = await mainCanister.getTransactions();
        if (transactions2.size() >= 2) {
            Debug.print("✓ Multiple transactions retrieved");
        } else {
            Debug.print("✗ Multiple transactions not found");
        };

        Debug.print("GetTransactions tests completed!");
    };

    // Run all tests
    public func runAllTests() : async () {
        Debug.print("Running all tests...");
        await testInit();
        await testQueries();
        await testOwnerManagement();
        await testThresholdConfiguration();
        await testTransactionProposal();
        await testConfirmTransaction();
        await testGetTransactions();
        Debug.print("All tests completed!");
    };
} 