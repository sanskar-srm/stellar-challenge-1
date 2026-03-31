
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

  // Disable background scroll when modal is open
  React.useEffect(() => {
    if (showQR || showSend || showHistory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showQR, showSend, showHistory]);

  // Connect wallet and fetch info
  const connectWallet = async () => {
    setLoading(true);
    try {
      await checkConnection();
      const pk = await retrievePublicKey();
      
      if (!pk || pk.trim() === "") {
        throw new Error("No public key returned from Freighter");
      }
      
      setPublicKey(pk);
      const bal = await getBalance();
      setBalance(bal);
      setConnected(true);
    } catch (e) {
      console.error("Connection error:", e);
      const errorMsg = e?.message || "Failed to connect wallet";
      alert(`Connection Failed: ${errorMsg}\n\nPlease ensure:\n1. Freighter wallet is installed\n2. Freighter is unlocked\n3. You're on the Testnet\n4. Try refreshing the page`);
    }
    setLoading(false);
  };

  const disconnectWallet = () => {
    setConnected(false);
    setPublicKey("");
    setBalance("");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      {/* Landing View */}
      {!connected && (
        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <div className="relative">
            <h1 className="text-6xl font-black text-white tracking-tighter neon-text">
              STELLAR<br/>TERMINAL
            </h1>
            <div className="absolute -inset-1 bg-[#00ff88]/20 blur-xl -z-10"></div>
          </div>
          <button
            onClick={connectWallet}
            disabled={loading}
            className="cyber-button py-4 px-12 rounded-none text-xl min-w-[250px]"
          >
            {loading ? 'INITIALIZING...' : 'CONNECT WALLET'}
          </button>
          <p className="text-[#00ff88]/50 font-mono text-sm tracking-widest">SECURE_ENCRYPTION_ACTIVE</p>
        </div>
      )}

      {/* Wallet View */}
      {connected && (
        <div className="w-full max-w-md cyber-card pulse-glow animate-fade-in">
          {/* Header */}
          <div className="w-full p-6 border-b border-[#00ff88]/20 bg-[#00ff88]/5 flex items-center justify-between">
            <h2 className="neon-text font-bold">NODE_CONNECTED</h2>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-[#00ff88]/30"></div>
              <div className="w-2 h-2 rounded-full bg-[#00ff88]/30"></div>
            </div>
          </div>
          
          <div className="p-8 w-full flex flex-col space-y-6">
            {/* Balance Card */}
            <div className="w-full bg-[#00ff88]/5 border border-[#00ff88]/10 p-6 rounded-lg">
              <span className="text-[#00ff88]/60 text-xs tracking-widest uppercase block mb-2">AVAILABLE_CREDITS</span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-white tracking-tighter">{balance}</span>
                <span className="text-xl text-[#00ff88] font-bold">XLM</span>
              </div>
            </div>

            {/* Address Card */}
            <div className="w-full bg-black/40 border border-[#00ff88]/10 p-4 rounded-lg">
              <span className="text-[#00ff88]/60 text-xs tracking-widest uppercase block mb-2">PUBLIC_KEY</span>
              <div className="flex items-center gap-3">
                <span className="text-[#00ff88]/80 font-mono text-[10px] break-all flex-1 leading-relaxed">{publicKey}</span>
                <div className="flex gap-2">
                  <CopyToClipboard text={publicKey} onCopy={() => setCopied(true)}>
                    <button className="text-[#00ff88]/60 hover:text-[#00ff88] transition-colors p-1" title="Copy Address">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </CopyToClipboard>
                  <button onClick={() => setShowQR(true)} className="text-[#00ff88]/60 hover:text-[#00ff88] transition-colors p-1" title="Show QR Code">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.636 17.636l-.707-.707M12 20v-1M6.364 17.636l.707-.707M4 12h1M6.364 6.364l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              {copied && <span className="text-[#00ff88] text-[10px] mt-2 block animate-pulse">>> COPY_SUCCESSFUL</span>}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowSend(true)}
                className="cyber-button py-4 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                SEND
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="cyber-button py-4 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                HISTORY
              </button>
            </div>
            
            <button
              onClick={disconnectWallet}
              className="text-red-500/50 hover:text-red-500 text-[10px] tracking-widest transition-colors font-mono"
            >
              [ TERMINATE_SESSION ]
            </button>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(false)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[#00ff88]/20 flex items-center justify-between">
              <h3 className="neon-text font-bold">QR_ENCODING</h3>
              <button onClick={() => setShowQR(false)} className="text-[#00ff88] hover:bg-[#00ff88]/10 p-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <QRCodeSVG value={publicKey} size={256} level="H" />
              </div>
              
              <div className="w-full bg-black/40 border border-[#00ff88]/10 p-4 rounded-lg">
                <span className="text-[#00ff88]/60 text-xs tracking-widest uppercase block mb-2">SCAN_ADDRESS</span>
                <p className="text-[#00ff88]/80 font-mono text-[10px] break-all leading-relaxed">{publicKey}</p>
              </div>
              
              <button onClick={() => setShowQR(false)} className="cyber-button w-full py-3">
                CLOSE_INTERFACE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSend && (
        <div className="modal-overlay" onClick={() => setShowSend(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <SendXLM publicKey={publicKey} onBack={() => setShowSend(false)} />
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content max-w-4xl" onClick={e => e.stopPropagation()}>
            <History publicKey={publicKey} onBack={() => setShowHistory(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
