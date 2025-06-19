const { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } = require('@solana/web3.js');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

async function main() {
    console.log("🎫 TicketToken Event Creator\n");
    
    // Connect to devnet
    const connection = new Connection(process.env.RPC_URL, 'confirmed');
    console.log("✅ Connected to Solana Devnet");
    
    // Load your wallet
    const walletPath = `${os.homedir()}/.config/solana/id.json`;
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(walletData));
    console.log("👛 Wallet:", wallet.publicKey.toString());
    
    // Check balance
    const balance = await connection.getBalance(wallet.publicKey);
    console.log("💰 Balance:", balance / 1e9, "SOL\n");
    
    // Program ID
    const programId = new PublicKey(process.env.PROGRAM_ID);
    console.log("📄 Program ID:", programId.toString());
    
    // Event details
    const eventName = "Miami Music Fest";
    const venue = "Bayfront Park";
    const eventDate = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
    const totalTickets = 1000;
    const generalPrice = 1000000000; // 1 SOL
    const vipPrice = 3000000000; // 3 SOL
    
    console.log("\n🎪 Creating Event:");
    console.log("  Name:", eventName);
    console.log("  Venue:", venue);
    console.log("  Date:", new Date(eventDate * 1000).toLocaleDateString());
    console.log("  Capacity:", totalTickets);
    console.log("  GA Price:", generalPrice / 1e9, "SOL");
    console.log("  VIP Price:", vipPrice / 1e9, "SOL");
    
    // Derive the event PDA
    const [eventPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("event"), Buffer.from(eventName)],
        programId
    );
    console.log("\n📍 Event Account:", eventPDA.toString());
    
    // NOTE: To actually create the event, we'd need to:
    // 1. Build the instruction data (serialize the parameters)
    // 2. Create the transaction
    // 3. Send it
    
    // For now, let's just check if the program exists
    const programInfo = await connection.getAccountInfo(programId);
    if (programInfo) {
        console.log("\n✅ Program is deployed and ready!");
        console.log("   Executable:", programInfo.executable);
        console.log("   Owner:", programInfo.owner.toString());
        console.log("   Size:", programInfo.data.length, "bytes");
    }
}

main().catch(console.error);
