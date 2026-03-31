import React, { useState } from 'react'
import { retrievePublicKey, userSignTransaction } from './Freighter'
import * as StellarSdk from '@stellar/stellar-sdk'

const SendXLM = ({ onBack }) => {
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // success, error, info

    const Server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    const networkPassphrase = StellarSdk.Networks.TESTNET_NETWORK_PASSPHRASE;

    const sendXLM = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // Validate inputs
            if (!recipientAddress || !amount) {
                setMessageType("error");
                setMessage("Please fill in all fields");
                setLoading(false);
                return;
            }

            // Validate Stellar address
            if (!StellarSdk.StrKey.isValidEd25519PublicKey(recipientAddress)) {
                setMessageType("error");
                setMessage("Invalid Stellar address");
                setLoading(false);
                return;
            }

            // Validate amount
            if (isNaN(amount) || parseFloat(amount) <= 0) {
                setMessageType("error");
                setMessage("Invalid amount");
                setLoading(false);
                return;
            }

            setMessageType("info");
            setMessage("Preparing transaction...");

            // Get sender's public key
            const senderAddress = await retrievePublicKey();

            // Load sender account
            const account = await Server.loadAccount(senderAddress);

            // Create transaction
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: networkPassphrase,
            })
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: recipientAddress,
                        asset: StellarSdk.Asset.native(),
                        amount: amount.toString(),
                    })
                )
                .setTimeout(30)
                .build();

            setMessage("Signing transaction...");

            // Sign transaction with Freighter
            const xdr = transaction.toEnvelope().toXDR('base64');
            const signedXdr = await userSignTransaction(xdr, networkPassphrase, senderAddress);

            setMessage("Submitting transaction...");

            // Submit to network
            const transactionToSubmit = StellarSdk.TransactionEnvelope.fromXDR(
                signedXdr,
                networkPassphrase
            );
            const result = await Server.submitTransaction(transactionToSubmit);

            setMessageType("success");
            setMessage(`Transaction successful! Hash: ${result.hash.substring(0, 10)}...`);
            
            // Clear form
            setRecipientAddress("");
            setAmount("");

            // Clear message after 5 seconds
            setTimeout(() => setMessage(""), 5000);
        } catch (error) {
            console.log(error);
            setMessageType("error");
            setMessage(error.message || "Transaction failed");
        } finally {
            setLoading(false);
        }
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
                        className={`mb-6 p-4 rounded-lg font-semibold ${
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
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-200 mt-6"
                    >
                        {loading ? "Processing..." : "Send XLM"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SendXLM
