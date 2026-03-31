import React, { useState } from 'react'
import { retrievePublicKey, userSignTransaction } from './Freighter'
import * as StellarSdk from '@stellar/stellar-sdk'

const SendXLM = ({ publicKey: propPublicKey, onBack }) => {
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success, error, info
    const [transactionHash, setTransactionHash] = useState("");
    const [transactionComplete, setTransactionComplete] = useState(false);

    const Server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    const networkPassphrase = StellarSdk.Networks.TESTNET_NETWORK_PASSPHRASE;

    const sendXLM = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setTransactionHash("");
        setTransactionComplete(false);

        try {
            // Validate inputs
            if (!recipientAddress.trim() || !amount.trim()) {
                setMessageType("error");
                setMessage("Please fill in all fields");
                setLoading(false);
                return;
            }

            // Validate Stellar address format (must be 56 chars and start with G)
            if (recipientAddress.length !== 56 || !recipientAddress.startsWith('G')) {
                setMessageType("error");
                setMessage("Invalid Stellar address (must start with G and be 56 characters)");
                setLoading(false);
                return;
            }

            // Validate with SDK as well
            if (!StellarSdk.StrKey.isValidEd25519PublicKey(recipientAddress)) {
                setMessageType("error");
                setMessage("Invalid Stellar address format");
                setLoading(false);
                return;
            }

            // Validate amount
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                setMessageType("error");
                setMessage("Amount must be a positive number");
                setLoading(false);
                return;
            }

            // Validate minimum amount (1 stroopi = 0.0000001 XLM)
            if (numAmount < 0.0000001) {
                setMessageType("error");
                setMessage("Amount is too small (minimum: 0.0000001 XLM)");
                setLoading(false);
                return;
            }

            // Validate maximum amount (to prevent accidents)
            if (numAmount > 999999999) {
                setMessageType("error");
                setMessage("Amount is too large");
                setLoading(false);
                return;
            }

            setMessageType("info");
            setMessage("Checking account on Stellar Network...");

            // Get sender's public key - use prop first, then retrieve
            let senderAddress = propPublicKey;
            
            if (!senderAddress) {
                try {
                    senderAddress = await retrievePublicKey();
                } catch (error) {
                    setMessageType("error");
                    setMessage("Failed to retrieve your wallet address. Please ensure Freighter is connected and try again.");
                    setLoading(false);
                    return;
                }
            }

            // Validate sender address
            if (!senderAddress || senderAddress.trim() === "") {
                setMessageType("error");
                setMessage("Wallet not connected or address is empty. Please connect your Freighter wallet first.");
                setLoading(false);
                return;
            }

            if (!StellarSdk.StrKey.isValidEd25519PublicKey(senderAddress)) {
                setMessageType("error");
                setMessage("Invalid sender address. Please check your Freighter wallet.");
                setLoading(false);
                return;
            }

            setMessage("Loading account sequence number...");

            // Load sender account with retry logic
            let account;
            try {
                account = await Server.loadAccount(senderAddress);
            } catch (error) {
                console.error("Account load error:", error);
                if (error.response && error.response.status === 404) {
                    setMessageType("error");
                    setMessage("Account not found on Stellar Network. Please fund your account first using Friendbot.");
                    setLoading(false);
                    return;
                } else if (error.response && error.response.status === 400) {
                    setMessageType("error");
                    setMessage("Invalid account address. Please check your Freighter wallet and try again.");
                    setLoading(false);
                    return;
                }
                throw error;
            }

            setMessage("Building transaction...");

            // Create transaction
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: networkPassphrase,
            })
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: recipientAddress,
                        asset: StellarSdk.Asset.native(),
                        amount: numAmount.toFixed(7), // Ensure proper decimal format
                    })
                )
                .setTimeout(300) // 5 minutes timeout
                .build();

            setMessage("Requesting signature from Freighter...");

            // Sign transaction with Freighter
            const xdr = transaction.toEnvelope().toXDR('base64');
            let signedXdr;
            try {
                signedXdr = await userSignTransaction(xdr, networkPassphrase, senderAddress);
            } catch (error) {
                setMessageType("error");
                setMessage("Transaction sign request cancelled or failed. Please try again.");
                setLoading(false);
                return;
            }

            setMessage("Submitting to Stellar Network...");

            // Submit to network
            const transactionToSubmit = StellarSdk.TransactionEnvelope.fromXDR(
                signedXdr,
                networkPassphrase
            );
            
            let result;
            try {
                result = await Server.submitTransaction(transactionToSubmit);
            } catch (error) {
                console.error("Submission error:", error);
                let errorMsg = "Transaction submission failed. ";
                
                if (error.message.includes("insufficient")) {
                    errorMsg = "Insufficient balance. Please check your account balance.";
                } else if (error.message.includes("horizon")) {
                    errorMsg = "Network error. Please check your connection and try again.";
                } else if (error.status === 400 || error.message.includes("bad request")) {
                    errorMsg = "Invalid transaction. Please verify all details and try again.";
                } else {
                    errorMsg += error.message || "Please try again.";
                }
                
                setMessageType("error");
                setMessage(errorMsg);
                setLoading(false);
                return;
            }

            setTransactionHash(result.hash);
            setMessageType("success");
            setMessage(`✅ Transaction Successful!`);
            setTransactionComplete(true);
            
            // Clear form
            setRecipientAddress("");
            setAmount("");
        } catch (error) {
            console.error("Transaction Error:", error);
            let errorMsg = "Transaction failed. ";
            
            if (error?.message) {
                if (error.message.includes("insufficient")) {
                    errorMsg = "Insufficient balance to complete this transaction.";
                } else if (error.message.includes("destination")) {
                    errorMsg = "Invalid destination account. Please verify the recipient address.";
                } else if (error.message.includes("sequence")) {
                    errorMsg = "Account sequence error. Please try again.";
                } else if (error.message.includes("timeout")) {
                    errorMsg = "Transaction timed out. Please check your connection.";
                } else {
                    errorMsg += error.message;
                }
            } else {
                errorMsg += "Please try again.";
            }
            
            setMessageType("error");
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    }

    // If transaction is complete, show success screen
    if (transactionComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-xl border border-slate-700 p-8 text-center">
                        {/* Success Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="bg-green-500/20 border-2 border-green-500 rounded-full p-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-green-400 mb-2">Transaction Sent!</h2>
                        <p className="text-slate-400 mb-6">Your XLM transfer has been submitted to the Stellar Network</p>

                        {/* Details Card */}
                        <div className="bg-slate-700/50 rounded-lg p-4 mb-6 border border-slate-600">
                            <div className="mb-4">
                                <span className="text-slate-400 text-xs uppercase tracking-wider">Transaction Hash</span>
                                <p className="text-slate-200 font-mono text-xs break-all mt-1">{transactionHash}</p>
                            </div>
                            <div>
                                <span className="text-slate-400 text-xs uppercase tracking-wider">Amount Sent</span>
                                <p className="text-blue-400 font-bold text-lg mt-1">{amount} XLM</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <a
                                href={`https://stellar.expert/explorer/testnet/tx/${transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View on Stellar Expert
                            </a>
                            <button
                                onClick={onBack}
                                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-2.5 px-6 rounded-lg transition duration-200"
                            >
                                Back to Wallet
                            </button>
                        </div>

                        <p className="text-slate-400 text-xs mt-6">Transaction will settle within a few seconds on the Stellar Network</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
            <div className="max-w-md mx-auto bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="text-blue-400 hover:text-blue-300 font-semibold mb-4 inline-flex items-center"
                    >
                        ← Back
                    </button>
                    <h2 className="text-3xl font-bold text-white">Send XLM</h2>
                    <p className="text-slate-400 text-sm mt-2">Transfer Stellar Lumens to another address</p>
                </div>

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg font-semibold text-sm ${
                            messageType === "success"
                                ? "bg-green-900 text-green-200 border border-green-700"
                                : messageType === "error"
                                ? "bg-red-900 text-red-200 border border-red-700"
                                : "bg-blue-900 text-blue-200 border border-blue-700"
                        }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={sendXLM} className="space-y-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">
                            Recipient Address
                        </label>
                        <input
                            type="text"
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            placeholder="G..."
                            className="w-full px-4 py-3 bg-slate-700 text-white placeholder-slate-500 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">
                            Amount (XLM)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.0001"
                            min="0"
                            className="w-full px-4 py-3 bg-slate-700 text-white placeholder-slate-500 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-200 mt-6 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Send XLM
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SendXLM
