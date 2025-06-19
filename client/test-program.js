const { Connection, PublicKey } = require('@solana/web3.js');

async function testProgram() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const programId = new PublicKey('EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm');
    
    console.log("🎫 TicketToken Program Test\n");
    
    // Get program info
    const programInfo = await connection.getAccountInfo(programId);
    
    if (programInfo && programInfo.executable) {
        console.log("✅ Program Status: DEPLOYED AND READY");
        console.log("📍 Program ID:", programId.toString());
        console.log("💾 Program Size:", programInfo.data.length, "bytes");
        console.log("👤 Owner:", programInfo.owner.toString());
        console.log("\n📝 Available Functions:");
        console.log("  • create_event(name, venue, date, tickets, prices)");
        console.log("  • update_event(venue, date, prices)");
        console.log("  • cancel_event()");
        console.log("  • mint_ticket(tier)");
        console.log("  • batch_mint(tier, quantity)");
        console.log("  • reserve_tickets(quantity)");
        console.log("  • mint_whitelist(tier, proof)");
        console.log("\n🚀 Your smart contract is live on Solana Devnet!");
        console.log("🔗 Explorer: https://explorer.solana.com/address/" + programId.toString() + "?cluster=devnet");
    } else {
        console.log("❌ Program not found");
    }
}

testProgram().catch(console.error);
