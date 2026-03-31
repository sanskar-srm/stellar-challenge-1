import React, { useState, useEffect } from 'react'
import { retrievePublicKey } from './Freighter'
import * as StellarSdk from '@stellar/stellar-sdk'

const History = ({ publicKey: propPublicKey, onBack }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const Server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

    useEffect(() => {
        fetchTransactionHistory();
    }, [propPublicKey]);

    const fetchTransactionHistory = async () => {
        try {
            setLoading(true);
            setError("");

            let address = propPublicKey || await retrievePublicKey();
            if (!address) {
                setError("WALLET_NOT_FOUND");
                setLoading(false);
                return;
            }

            const response = await Server.transactions()
                .forAccount(address)
                .limit(20)
                .order("desc")
                .call();

            const formattedTransactions = response.records.map((tx) => ({
                id: tx.hash,
                date: new Date(tx.created_at).toLocaleString(),
                hash: tx.hash,
                type: tx.type,
                sourceAccount: tx.source_account,
                memo: tx.memo || "N/A",
            }));

            setTransactions(formattedTransactions);
        } catch (err) {
            console.error(err);
            setError("FETCH_ERROR_NODE_OFFLINE");
        } finally {
            setLoading(false);
        }
    }

    const truncateHash = (hash) => `${hash.slice(0, 8)}...${hash.slice(-8)}`;

    return (
        <div className="flex flex-col w-full animate-fade-in max-h-[80vh]">
            {/* Header */}
            <div className="p-6 border-b border-[#00ff88]/20 bg-[#00ff88]/5 flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="neon-text font-bold text-xl">LEDGER_HISTORY</h2>
                    <p className="text-[#00ff88]/40 text-[10px] tracking-widest uppercase mt-1">
                        Viewing last 20 operations
                    </p>
                </div>
                <button onClick={onBack} className="text-[#00ff88] hover:bg-[#00ff88]/10 p-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-0 overflow-y-auto">
                {error && (
                    <div className="m-8 p-4 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-xs uppercase animate-pulse">
                        >> !! {error} !!
                    </div>
                )}

                {loading ? (
                    <div className="py-20 flex flex-col items-center space-y-4">
                        <div className="w-10 h-10 border-2 border-t-[#00ff88] border-r-transparent border-b-[#00ff88]/30 border-l-transparent rounded-full animate-spin"></div>
                        <p className="text-[#00ff88]/40 font-mono text-[10px] tracking-[0.2em]">SYNCING_WITH_NETWORK...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-[#00ff88]/40 font-mono text-xs">NO_DATA_ENTRIES_FOUND</p>
                    </div>
                ) : (
                    <div className="w-full">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-[#00ff88]/10 bg-black/20">
                                    <th className="px-6 py-4 text-left text-[#00ff88]/60 text-[10px] tracking-widest uppercase font-bold">HASH</th>
                                    <th className="px-6 py-4 text-left text-[#00ff88]/60 text-[10px] tracking-widest uppercase font-bold">TIMESTAMP</th>
                                    <th className="px-6 py-4 text-left text-[#00ff88]/60 text-[10px] tracking-widest uppercase font-bold">MEMO</th>
                                    <th className="px-6 py-4 text-right text-[#00ff88]/60 text-[10px] tracking-widest uppercase font-bold">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#00ff88]/5">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-[#00ff88]/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-[#00ff88]/80 font-mono text-[10px] group-hover:text-[#00ff88] transition-colors">
                                                {truncateHash(tx.hash)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white/60 font-mono text-[10px] uppercase">
                                                {tx.date}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white/40 font-mono text-[10px] italic">
                                                {tx.memo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#00ff88]/60 hover:text-[#00ff88] text-[10px] font-mono tracking-widest"
                                            >
                                                [ VIEW_LOG ]
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <div className="p-6 border-t border-[#00ff88]/20 bg-black/40 text-center">
                <button
                    onClick={onBack}
                    className="text-[#00ff88]/40 hover:text-[#00ff88] font-mono text-[10px] tracking-widest transition-colors uppercase"
                >
                    [ TERMINATE_OVERLAY ]
                </button>
            </div>
        </div>
    );
};

export default History;
