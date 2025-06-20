const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");
const crypto = require("crypto");
const BN = require("bn.js");

const PROGRAM_ID = new PublicKey("EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm");

const wallet = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json", "utf-8")))
);

function getDiscriminator(name) {
    const hash = crypto.createHash("sha256").update(`global:${name}`).digest();
    return hash.slice(0, 8);
}

async function test() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    console.log("Wallet:", wallet.publicKey.toString());
    
    const balance = await connection.getBalance(wallet.publicKey);
    console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");
    
    console.log("✅ Connection works!");
}

test().catch(console.error);
