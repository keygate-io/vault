import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Array "mo:base/Array";

actor class PaymentLedger() = this {
    // Types for transaction management
    type TransactionId = Nat;
    type TransactionStatus = {
        #pending;
        #paid;
        #failed;
    };
    
    type Transaction = {
        id: TransactionId;
        depositAddress: Text;
        network: Text;
        requiredAmount: Nat;
        status: TransactionStatus;
        createdAt: Int;
        updatedAt: ?Int;
    };

    // Response type for createTransaction
    public type CreateTransactionResponse = {
        id: TransactionId;
        depositAddress: Text;
    };
    
    // State variables
    private stable var nextTransactionId: TransactionId = 0;
    private stable var transactions: [Transaction] = [];
    
    // Map to track deposit addresses and their associated transaction IDs
    private stable var addressToTransactionId: [(Text, TransactionId)] = [];

    // Generate a payment address for the user (For a specific Network)
    public shared func generateDepositAddress(network : Text) : async Text {
        return "Payment address for " # network;
    };

    // Create a new transaction with pending status
    public shared func createTransaction(network: Text, requiredAmount: Nat) : async CreateTransactionResponse {
        let depositAddress = "";
        
        let transaction: Transaction = {
            id = nextTransactionId;
            depositAddress = depositAddress;
            network = network;
            requiredAmount = requiredAmount;
            status = #pending;
            createdAt = Time.now();
            updatedAt = null;
        };
        
        transactions := Array.append(transactions, [transaction]);
        addressToTransactionId := Array.append(addressToTransactionId, [(depositAddress, nextTransactionId)]);
        
        let currentId = nextTransactionId;
        nextTransactionId += 1;
        
        return {
            id = currentId;
            depositAddress = depositAddress;
        };
    };
    
    // Check the balance of a deposit address (In a real implementation, this would interface with the blockchain)
    public shared func checkAddressBalance(depositAddress: Text) : async Nat {
        return 100;
    };
    
    // Get transaction details
    public query func getTransaction(transactionId: TransactionId) : async ?Transaction {
        for (transaction in transactions.vals()) {
            if (transaction.id == transactionId) {
                return ?transaction;
            }
        };
        return null;
    };
    
    // Get all transactions
    public query func getAllTransactions() : async [Transaction] {
        return transactions;
    }
}
