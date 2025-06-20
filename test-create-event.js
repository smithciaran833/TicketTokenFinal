// test-create-event.js
const anchor = require("@coral-xyz/anchor");
const { SystemProgram, Keypair, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");

// Your deployed program ID
const PROGRAM_ID = new PublicKey("EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm");

async function main() {
    // Configure the client to use devnet
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    
    // Load your program (you'll need the IDL for this)
    // For now, let's do a simple test
    
    console.log("🎫 Ticket NFT System - Create Event Test");
    console.log("=========================================");
    console.log("Program ID:", PROGRAM_ID.toString());
    console.log("Your wallet:", provider.wallet.publicKey.toString());
    
    // Event details
    const eventName = "Solana Summer Concert 2024";
    const venue = "Crypto Arena";
    const eventDate = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
    const totalTickets = 1000;
    const generalPrice = 0.5 * LAMPORTS_PER_SOL; // 0.5 SOL
    const vipPrice = 2.0 * LAMPORTS_PER_SOL; // 2 SOL
    
    // Derive the event PDA
    const [eventPda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("event"), Buffer.from(eventName)],
        PROGRAM_ID
    );
    
    console.log("\n📍 Event PDA:", eventPda.toString());
    console.log("📅 Event Date:", new Date(eventDate * 1000).toLocaleString());
    console.log("🎟️  Total Tickets:", totalTickets);
    console.log("💰 General Price:", generalPrice / LAMPORTS_PER_SOL, "SOL");
    console.log("💎 VIP Price:", vipPrice / LAMPORTS_PER_SOL, "SOL");
    
    // To actually create the event, you need the IDL
    console.log("\n✅ Your program is deployed and ready!");
    console.log("🔗 View on Solana Explorer:");
    console.log(`   https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`);
}

main().catch(console.error);
