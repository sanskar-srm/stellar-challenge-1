import React, { useState } from 'react'
import { checkConnection, retrievePublicKey, getBalance } from './Freighter'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { QRCodeSVG } from 'qrcode.react';


const Header = ({ onNavigate, onConnect }) => {

    const [connected, setConnected] = useState(false);
    const [publicKey, setPublicKey] = useState("");
    const [balance, setBalance] = useState("");
    const [showQR, setShowQR] = useState(false);
    const [copied, setCopied] = useState(false);


    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    const connectWallet = async () => {
        try {
            const allowed = await checkConnection();

            if (!allowed) return alert("Please allow access to Freighter in order to connect your wallet.");

            const key = await retrievePublicKey();
            setPublicKey(key);

            const bal = await getBalance();
            setBalance(bal);

            setConnected(true);
            onConnect?.(true);
        } catch (error) {
            console.log(error);
        }
    }

    const disconnectWallet = () => {
        setConnected(false);
        setPublicKey("");
        setBalance("");
        onConnect?.(false);
    }

    const truncateAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }

  return (
    <>
    <nav className="bg-slate-900/80 backdrop-blur-sm shadow-lg border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Left Side - Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate?.('home')}>
            <div className="bg-blue-500 rounded-lg p-2 shadow-md">
              <span className="text-white font-bold text-2xl">✦</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Stellar dApp</h1>
            </div>
          </div>

          {/* Right Side - Wallet Info */}
          <div className="flex items-center space-x-4">
            {connected ? (
              <>
                {/* Wallet Balance */}
                <div className="hidden md:flex flex-col items-end">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Balance</p>
                  <p className="text-xl font-semibold text-yellow-400 tracking-wider">{balance} XLM</p>
                </div>

                {/* Wallet Address & Actions */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-2 space-x-3">
                    <p className="text-sm font-mono text-slate-300 px-2">
                        {truncateAddress(publicKey)}
                    </p>
                    <CopyToClipboard text={publicKey} onCopy={handleCopy}>
                        <button className="text-slate-400 hover:text-white transition duration-150" title="Copy Address">
                            {copied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </CopyToClipboard>
                    <button onClick={() => setShowQR(true)} className="text-slate-400 hover:text-white transition duration-150" title="Show QR Code">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M17.636 17.636l-.707-.707M12 20v-1M6.364 17.636l.707-.707M4 12h1M6.364 6.364l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onNavigate?.('history')}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
                  >
                    History
                  </button>
                  <button
                    onClick={() => onNavigate?.('send')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
                  >
                    Send
                  </button>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-400 font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
                >
                  Disconnect
                </button>
              </>
            ) : (
              /* Connect Button */
              <button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>

    {showQR && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowQR(false)}>
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-white text-center font-bold text-lg mb-2">Your Stellar Address</h3>
                <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG value={publicKey} size={256} />
                </div>
                <p className="text-slate-400 text-xs font-mono text-center mt-4 break-all max-w-xs">{publicKey}</p>
                <button onClick={() => setShowQR(false)} className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                    Close
                </button>
            </div>
        </div>
    )}
    </>
  )
}

export default Header
