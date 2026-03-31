import { signTransaction , setAllowed , getAddress } from "@stellar/freighter-api";

import * as StellarSdk from '@stellar/stellar-sdk'

const Server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');


const checkConnection = async () =>{
    try {
        const result = await setAllowed();
        return result;
    } catch (error) {
        console.error("Connection check failed:", error);
        throw new Error("Failed to check Freighter connection");
    }
}  

const retrievePublicKey = async () =>{
    try {
        const {address} = await getAddress();
        if (!address) {
            throw new Error("No address returned from Freighter");
        }
        return address;
    } catch (error) {
        console.error("retrievePublicKey error:", error);
        throw new Error("Failed to retrieve public key from Freighter: " + error.message);
    }
}

const getBalance = async () =>{
    try {
        await setAllowed();
        
        const {address} = await getAddress();
        if (!address) {
            throw new Error("No address from Freighter");
        }

        const account = await Server.loadAccount(address);
        const xlm = account.balances.find((balance) => balance.asset_type === "native");

        return xlm?.balance || "0";
    } catch (error) {
        console.error("getBalance error:", error);
        throw new Error("Failed to retrieve balance: " + error.message);
    }
}

const userSignTransaction = async (xdr, network, signWith) => {
    try {
        const result = await signTransaction(xdr,{
            network,
            accountToSign:signWith
        });
        return result;
    } catch (error) {
        console.error("userSignTransaction error:", error);
        throw new Error("Failed to sign transaction with Freighter: " + error.message);
    }
};

export {checkConnection, retrievePublicKey, getBalance, userSignTransaction};