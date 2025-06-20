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

async function createEvent() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    console.log("🎫 Testing minimal instruction...");
    console.log("Wallet:", wallet.publicKey.toString());
    
    // Try with minimal data first
    const discriminator = getDiscriminator("create_event");
    
    // Just send discriminator to see what error we get
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true }
        ],
        programId: PROGRAM_ID,
        data: discriminator
    });
    
    try {
        const transaction = new Transaction().add(instruction);
        const signature = await connection.sendTransaction(transaction, [wallet], {
            skipPreflight: false
        });
        console.log("TX:", signature);
    } catch (error) {
        console.log("\nExpected error - checking program logs:");
        if (error.logs) {
            error.logs.forEach(log => console.log(log));
        }
    }
}

createEvent().catch(console.error);
