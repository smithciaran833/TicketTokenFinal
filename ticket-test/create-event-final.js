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
    
    console.log("🎫 CREATING EVENT - WITH CORRECT PDA!");
    console.log("=====================================");
    console.log("Wallet:", wallet.publicKey.toString());
    
    // Event details
    const name = "Summer Concert 2024";
    const venue = "Crypto Arena";
    const eventDate = new BN(Math.floor(Date.now() / 1000) + 86400 * 30); // 30 days from now
    const totalTickets = 1000;
    const generalPrice = new BN(0.5 * LAMPORTS_PER_SOL);
    const vipPrice = new BN(2.0 * LAMPORTS_PER_SOL);
    
    // Derive Event PDA using the event NAME, not an ID!
    const [eventPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("event"), Buffer.from(name)],
        PROGRAM_ID
    );
    
    console.log("Event Name:", name);
    console.log("Event PDA:", eventPda.toString());
    
    // Build instruction data
    const discriminator = getDiscriminator("create_event");
    
    // Encode strings
    const nameBytes = Buffer.from(name);
    const nameLen = Buffer.alloc(4);
    nameLen.writeUInt32LE(nameBytes.length);
    
    const venueBytes = Buffer.from(venue);
    const venueLen = Buffer.alloc(4);
    venueLen.writeUInt32LE(venueBytes.length);
    
    // Build instruction data
    const instructionData = Buffer.concat([
        discriminator,
        nameLen,
        nameBytes,
        venueLen,
        venueBytes,
        eventDate.toArrayLike(Buffer, "le", 8),
        Buffer.from(new Uint32Array([totalTickets]).buffer),
        generalPrice.toArrayLike(Buffer, "le", 8),
        vipPrice.toArrayLike(Buffer, "le", 8)
    ]);
    
    console.log("Instruction data size:", instructionData.length, "bytes");
    
    // Create instruction
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: eventPda, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: PROGRAM_ID,
        data: instructionData
    });
    
    try {
        console.log("\n📤 Sending transaction...");
        const transaction = new Transaction().add(instruction);
        
        const signature = await connection.sendTransaction(transaction, [wallet], {
            skipPreflight: false,
            preflightCommitment: "confirmed"
        });
        
        console.log("Transaction sent:", signature);
        console.log("Waiting for confirmation...");
        
        await connection.confirmTransaction(signature, "confirmed");
        
        console.log("\n✅ EVENT CREATED SUCCESSFULLY!");
        console.log("View on Solana Explorer:");
        console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        
        // Try to fetch the event
        console.log("\n📊 Fetching event data...");
        const accountInfo = await connection.getAccountInfo(eventPda);
        if (accountInfo) {
            console.log("Event account created! Size:", accountInfo.data.length, "bytes");
        }
        
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        if (error.logs) {
            console.log("\nProgram logs:");
            error.logs.forEach(log => console.log(log));
        }
    }
}

createEvent().catch(console.error);
