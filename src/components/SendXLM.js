import React, { useState } from 'react'
import { retrievePublicKey, userSignTransaction } from './Freighter'
import * as StellarSdk from '@stellar/stellar-sdk'

const SendXLM = ({ publicKey: propPublicKey, onBack }) => {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [memo, setMemo] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);
    const [transactionHash, setTransactionHash] = useState("");
    const [transactionComplete, setTransactionComplete] = useState(false);

    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    const networkPassphrase = 'Test SDF Network ; September 2015';

    // Validation Logic
    const validateForm = () => {
        const newErrors = {};

        if (!recipient.trim()) {
            newErrors.recipient = 'Recipient address is required';
        } else if (recipient.length !== 56 || !recipient.startsWith('G')) {
            newErrors.recipient = 'Invalid Stellar address';
        } else if (!StellarSdk.StrKey.isValidEd25519PublicKey(recipient)) {
            newErrors.recipient = 'Invalid Stellar address format';
        }

        if (!amount.trim()) {
            newErrors.amount = 'Amount is required';
        } else {
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                newErrors.amount = 'Amount must be positive';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendPayment = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setLoading(true);
            setAlert(null);
            
            let senderAddress = propPublicKey || await retrievePublicKey();
            if (!senderAddress) throw new Error("Wallet not connected");

            setAlert({ type: 'info', message: 'Initializing account...' });
            const account = await server.loadAccount(senderAddress);

            const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: networkPassphrase,
            });

            transactionBuilder.addOperation(
                StellarSdk.Operation.payment({
                    destination: recipient,
                    asset: StellarSdk.Asset.native(),
                    amount: parseFloat(amount).toFixed(7),
                })
            );

            if (memo?.trim()) {
                transactionBuilder.addMemo(StellarSdk.Memo.text(memo.substring(0, 28)));
            }

            const transaction = transactionBuilder.setTimeout(180).build();
            const xdr = transaction.toEnvelope().toXDR('base64');
            
            setAlert({ type: 'info', message: 'Awaiting wallet signature...' });
            const signedXdr = await userSignTransaction(xdr, networkPassphrase, senderAddress);
            
            if (!signedXdr) throw new Error('Signing failed');

            setAlert({ type: 'info', message: 'Broadcasting to network...' });
            
            let transactionToSubmit;
            if (typeof StellarSdk.TransactionBuilder?.fromXDR === 'function') {
                transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
            } else {
                transactionToSubmit = new StellarSdk.Envelope(StellarSdk.xdr.TransactionEnvelope.fromXDR(signedXdr, 'base64'), networkPassphrase);
            }

            const result = await server.submitTransaction(transactionToSubmit);
            setTransactionHash(result.hash);
            setTransactionComplete(true);
            setAlert({ type: 'success', message: 'Transmission successful' });

        } catch (error) {
            console.error(error);
            setAlert({ type: 'error', message: error.message || "Transmission failed" });
        } finally {
            setLoading(false);
        }
    };

    const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${transactionHash}`;

    return (
        <div className="flex flex-col w-full animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-[#00ff88]/20 bg-[#00ff88]/5 flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="neon-text font-bold text-xl">TRANSACTION_INTERFACE</h2>
                    <p className="text-[#00ff88]/40 text-[10px] tracking-widest uppercase mt-1">
                        {transactionComplete ? 'SECURE_CONFIRMATION' : 'DATA_INPUT_REQUIRED'}
                    </p>
                </div>
                <button onClick={onBack} className="text-[#00ff88] hover:bg-[#00ff88]/10 p-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-8">
                {alert && (
                    <div className={`mb-6 p-4 border ${
                        alert.type === 'error' ? 'border-red-500/50 bg-red-500/10 text-red-400' : 
                        alert.type === 'success' ? 'border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88]' :
                        'border-blue-500/50 bg-blue-500/10 text-blue-400'
                    } font-mono text-[10px] tracking-tighter uppercase animate-pulse`}>
                        >> {alert.message}
                    </div>
                )}

                {!transactionComplete ? (
                    <form onSubmit={sendPayment} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[#00ff88]/60 text-[10px] tracking-widest uppercase block ml-1">RECIPIENT_ADDRESS</label>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className={`w-full cyber-input font-mono text-xs ${errors.recipient ? 'border-red-500/50' : ''}`}
                                placeholder="G..."
                                disabled={loading}
                            />
                            {errors.recipient && <p className="text-red-500 text-[10px] mt-1 ml-1 font-mono">!! {errors.recipient.toUpperCase()}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[#00ff88]/60 text-[10px] tracking-widest uppercase block ml-1">AMOUNT_XLM</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.0000001"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className={`w-full cyber-input font-mono text-xs pr-12 ${errors.amount ? 'border-red-500/50' : ''}`}
                                        placeholder="0.00"
                                        disabled={loading}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00ff88]/40 font-bold text-[10px]">XLM</span>
                                </div>
                                {errors.amount && <p className="text-red-500 text-[10px] mt-1 ml-1 font-mono">!! {errors.amount.toUpperCase()}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[#00ff88]/60 text-[10px] tracking-widest uppercase block ml-1">MEMO_STRING</label>
                                <input
                                    type="text"
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    className="w-full cyber-input font-mono text-xs"
                                    placeholder="OPTIONAL"
                                    disabled={loading}
                                    maxLength="28"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 text-[#00ff88]/40 hover:text-[#00ff88] font-mono text-[10px] tracking-widest transition-colors"
                            >
                                [ ABORT_PROCESS ]
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] cyber-button py-4 disabled:opacity-50"
                            >
                                {loading ? 'TRANSMITTING...' : 'EXECUTE_PAYMENT'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 animate-fade-in text-center">
                        <div className="w-16 h-16 border border-[#00ff88] rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <div className="space-y-4 text-left">
                            <div className="bg-black/40 border border-[#00ff88]/10 p-4 rounded-lg">
                                <span className="text-[#00ff88]/40 text-[10px] tracking-widest uppercase block mb-1">TRANSACTION_HASH</span>
                                <p className="text-[#00ff88]/80 font-mono text-[10px] break-all leading-relaxed">{transactionHash}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/40 border border-[#00ff88]/10 p-4 rounded-lg">
                                    <span className="text-[#00ff88]/40 text-[10px] tracking-widest uppercase block mb-1">AMOUNT</span>
                                    <p className="text-white font-bold text-lg">{amount} XLM</p>
                                </div>
                                <div className="bg-black/40 border border-[#00ff88]/10 p-4 rounded-lg">
                                    <span className="text-[#00ff88]/40 text-[10px] tracking-widest uppercase block mb-1">STATUS</span>
                                    <p className="text-[#00ff88] font-bold text-lg uppercase tracking-tighter">CONFIRMED</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cyber-button py-3 flex items-center justify-center gap-2 text-xs"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                VIEW_ON_EXPLORER
                            </a>
                            <button
                                onClick={onBack}
                                className="text-[#00ff88]/60 hover:text-[#00ff88] font-mono text-[10px] tracking-widest py-2 transition-colors"
                            >
                                [ RETURN_TO_NODE ]
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SendXLM;
