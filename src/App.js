
import React, { useState } from 'react';
import { checkConnection, retrievePublicKey, getBalance } from './components/Freighter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { QRCodeSVG } from 'qrcode.react';
import SendXLM from './components/SendXLM';
import History from './components/History';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // Connect wallet and fetch info
  const connectWallet = async () => {
    setLoading(true);
    try {
      await checkConnection();
      const pk = await retrievePublicKey();
      setPublicKey(pk);
      const bal = await getBalance();
      setBalance(bal);
      setConnected(true);
    } catch (e) {
      alert('Failed to connect wallet.');
    }
    setLoading(false);
  };

  const disconnectWallet = () => {
    setConnected(false);
    setPublicKey("");
    setBalance("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Landing View */}
      {!connected && (
        <div className="flex flex-col items-center justify-center h-screen w-full">
          <h1 className="text-5xl font-bold text-white mb-8 animate-fade-in">Stellar Dapp</h1>
          <button
            onClick={connectWallet}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-xl shadow-lg text-2xl transition duration-200 disabled:opacity-60"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      )}

      {/* Wallet View */}
      {connected && (
        <div className="flex flex-col items-center justify-center w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-slate-700">
          {/* Header */}
          <div className="w-full h-24 bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-white">Wallet Connected</h2>
          </div>
          
          <div className="p-8 w-full flex flex-col items-center">
            {/* Balance Card */}
            <div className="w-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 mb-6 border border-slate-600">
              <span className="text-slate-400 text-xs tracking-wider uppercase">Your Balance</span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{balance}</span>
                <span className="text-xl text-slate-300">XLM</span>
              </div>
            </div>

            {/* Address Card */}
            <div className="w-full bg-slate-700/50 rounded-xl p-4 mb-6 border border-slate-600">
              <span className="text-slate-400 text-xs tracking-wider uppercase block mb-2">Your Address</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-mono text-xs break-all flex-1">{publicKey}</span>
                <CopyToClipboard text={publicKey} onCopy={() => setCopied(true)}>
                  <button className="text-slate-400 hover:text-blue-400 transition duration-200 flex-shrink-0" title="Copy Address">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </CopyToClipboard>
                <button onClick={() => setShowQR(true)} className="text-slate-400 hover:text-blue-400 transition duration-200 flex-shrink-0" title="Show QR Code">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.636 17.636l-.707-.707M12 20v-1M6.364 17.636l.707-.707M4 12h1M6.364 6.364l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </button>
              </div>
              {copied && <span className="text-green-400 text-xs mt-2 block">✓ Copied!</span>}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full mb-4">
              <button
                onClick={() => setShowSend(true)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </button>
            </div>
            
            <button
              onClick={disconnectWallet}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300 font-semibold py-2.5 px-4 rounded-lg transition duration-200 text-sm"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={() => setShowQR(false)}>
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden w-full max-w-sm" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-6 flex items-center justify-between">
              <h3 className="text-white font-bold text-xl">Stellar Address QR</h3>
              <button onClick={() => setShowQR(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center">
              {/* QR Code Container */}
              <div className="bg-white p-6 rounded-xl mb-6 shadow-lg border-4 border-slate-200">
                <QRCodeSVG value={publicKey} size={300} level="H" />
              </div>
              
              {/* Address Display */}
              <div className="w-full bg-slate-700/50 rounded-lg p-4 mb-6 border border-slate-600">
                <span className="text-slate-400 text-xs tracking-wider uppercase block mb-2">Share Your Address</span>
                <p className="text-slate-300 font-mono text-xs break-all leading-relaxed">{publicKey}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="w-full flex gap-3">
                <CopyToClipboard text={publicKey}>
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 group">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </CopyToClipboard>
                <button onClick={() => setShowQR(false)} className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSend && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowSend(false)}>
          <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <SendXLM onBack={() => setShowSend(false)} />
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowHistory(false)}>
          <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <History onBack={() => setShowHistory(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
