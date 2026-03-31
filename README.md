Stellar Wallet Connect 🌟

A sleek web app to manage your Stellar (XLM) assets, connect your wallet, and perform transactions smoothly. Built using React and styled with Tailwind CSS for a modern look.



✨ Highlights
Wallet Integration: Connect to Freighter instantly
Live Balance: Displays your current XLM balance
Send Payments: Transfer XLM to any valid Stellar address
Transaction Records: View recent activity directly from the network
QR Code Support: Share your address quickly
Quick Copy: Copy wallet address with one click
Secure by Design: No private key storage, signing handled via Freighter
Clean UI: Responsive layout with smooth transitions
Dark Theme: Comfortable viewing experience
🚀 Getting Started
Requirements
Node.js (v16 or above)
npm
Freighter Wallet extension
Setup
git clone https://github.com/sanskar-srm/stellar-challenge-1.git
cd stellar-challenge-1

npm install
npm start


App runs on:
http://localhost:3000

Production Build
npm run build

📖 Usage Guide
Connect Wallet

Click Connect, approve the request in Freighter, and your wallet will be linked.

Check Balance

Your XLM balance is shown automatically once connected.

Copy / Share Address
Use copy button for clipboard
Use QR icon to generate shareable code
Send XLM
Enter recipient address
Add amount
Confirm and sign via Freighter
View Transactions

Open History to see recent transactions including details like hash and timestamp.

Disconnect

Click Disconnect Wallet to clear session data.

📸 Screens
Landing page with connect option
Wallet dashboard showing balance
Transaction confirmation screen
✅ Transaction Example
Transaction ID : 55a5956b65290f3a1f8051e6e02f80055d7a57129e40a13a612eee5c9a096dd3
Time           : 2026-03-31 12:28:43 UTC

📁 Folder Structure
stellar-challenge-1/
├── src/
│   ├── components/
│   │   ├── Freighter.js
│   │   ├── SendXLM.js
│   │   ├── History.js
│   │   └── Header.js
│   ├── App.js
│   ├── styles
│   └── index.js
├── public/
├── package.json
├── tailwind.config.js
└── README.md

🛠️ Tech Used
React
Tailwind CSS
Stellar SDK
Freighter API
QR Code (qrcode.react)
Clipboard utility
⚙️ Core Modules

Freighter Integration

Connect wallet
Fetch public key
Retrieve balance
Sign transactions

Send Component

Input validation
Transaction creation
User confirmation

History Component

Fetch recent transactions
Display useful metadata
🌐 Network Info

This project uses Stellar Testnet

Horizon: https://horizon-testnet.stellar.org
Passphrase: Test SDF Network

You can get free test XLM from Friendbot.

🔐 Security Notes
Private keys are never stored
All transactions are signed via wallet
Uses secure API calls
Fully client-side (no backend)
🎨 UI Details
Responsive across devices
Dark mode interface
Smooth animations
Modal-based interactions
Loading indicators and error feedback
🌍 Browser Support
Chrome / Edge
Firefox
Safari
🧭 Freighter Setup
Install extension
Create or import wallet
Switch to Testnet
Fund account using Friendbot
Connect to the app
🐛 Common Issues

Wallet not connecting

Check extension is installed and enabled

Invalid address

Must start with G and be 56 characters

Balance not loading

Ensure account has testnet XLM
📚 Useful Links
Stellar Docs
Freighter Wallet
Horizon API
Tailwind CSS
React
🤝 Contributions

Want to improve this project?

Fork the repo
Create a new branch
Commit changes
Push and open PR
📄 License

MIT License

👨‍💻 Author

Built for learning and exploring Stellar ecosystem.

⭐ Show Support

If this helped you:

Star the repo
Share it
Suggest improvements

Built with React and Stellar 🚀