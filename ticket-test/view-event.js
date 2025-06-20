const { Connection, PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey("EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function viewEvent() {
    // Derive the PDA for "Summer Concert 2024"
    const [eventPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("event"), Buffer.from("Summer Concert 2024")],
        PROGRAM_ID
    );
    
    console.log("🎫 VIEWING EVENT DATA");
    console.log("====================");
    console.log("Event PDA:", eventPda.toString());
    
    // Fetch the account
    const accountInfo = await connection.getAccountInfo(eventPda);
    
    if (accountInfo) {
        console.log("\n✅ Event exists on-chain!");
        console.log("Owner Program:", accountInfo.owner.toString());
        console.log("Data size:", accountInfo.data.length, "bytes");
        console.log("Lamports:", accountInfo.lamports);
        
        // The data is encoded, but we can see some info
        const data = accountInfo.data;
        
        // Skip discriminator (8 bytes) and read some data
        console.log("\n📊 Raw data preview (hex):");
        console.log(data.slice(0, 64).toString('hex'));
        
        // The event name starts after discriminator + authority (8 + 32 = 40)
        // First 4 bytes are string length
        const nameLen = data.readUInt32LE(40);
        const name = data.slice(44, 44 + nameLen).toString();
        console.log("\n📍 Event name from data:", name);
        
    } else {
        console.log("❌ Event not found");
    }
}

viewEvent().catch(console.error);
