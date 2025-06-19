const { 
    Connection, 
    Keypair, 
    PublicKey, 
    SystemProgram, 
    Transaction, 
    TransactionInstruction,
    sendAndConfirmTransaction 
} = require('@solana/web3.js');
const fs = require('fs');
const os = require('os');
const BN = require('bn.js');
require('dotenv').config();

// Simple serialization for our instruction
function serializeCreateEventInstruction(name, venue, eventDate, totalTickets, generalPrice, vipPrice) {
    // This is a simplified version - in production you'd use Borsh
    const nameBytes = Buffer.from(name);
    const venueBytes = Buffer.from(venue);
    
    // Create a buffer with our data
    // Format: [discriminator(8)] [name_len(4)] [name] [venue_len(4)] [venue] [date(8)] [tickets(4)] [general(8)] [vip(8)]
    const discriminator = Buffer.from([140, 209, 208, 104, 175, 126, 6, 88]); // create_event discriminator
    
    const buffer = Buffer.concat([
        discriminator,
        Buffer.from(new BN(nameBytes.length).toArray('le', 4)),
        nameBytes,
        Buffer.from(new BN(venueBytes.length).toArray('le', 4)),
        venueBytes,
        Buffer.from(new BN(eventDate).toArray('le', 8)),
        Buffer.from(new BN(totalTickets).toArray('le', 4)),
        Buffer.from(new BN(generalPrice).toArray('le', 8)),
        Buffer.from(new BN(vipPrice).toArray('le', 8))
    ]);
    
    return buffer;
}

async function createEvent() {
    console.log("🎫 Creating Event on TicketToken\n");
    
    // Connect
    const connection = new Connection(process.env.RPC_URL, 'confirmed');
    
    // Load wallet
    const walletPath = `${os.homedir()}/.config/solana/id.json`;
    const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(walletData));
    
    // Program ID
    const programId = new PublicKey(process.env.PROGRAM_ID);
    
    // Event details
    const eventName = "Test Event " + Date.now(); // Unique name
    const venue = "Test Venue";
    const eventDate = Math.floor(Date.now() / 1000) + 86400 * 30;
    const totalTickets = 100;
    const generalPrice = 100000000; // 0.1 SOL
    const vipPrice = 300000000; // 0.3 SOL
    
    // Derive PDA
    const [eventPDA, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("event"), Buffer.from(eventName)],
        programId
    );
    
    console.log("Creating event:", eventName);
    console.log("Event PDA:", eventPDA.toString());
    
    // Build instruction
    const instructionData = serializeCreateEventInstruction(
        eventName,
        venue,
        eventDate,
        totalTickets,
        generalPrice,
        vipPrice
    );
    
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: eventPDA, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId,
        data: instructionData,
    });
    
    // Create and send transaction
    const transaction = new Transaction().add(instruction);
    
    try {
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet]
        );
        
        console.log("\n✅ Event created successfully!");
        console.log("Transaction signature:", signature);
        console.log("View on explorer:");
        console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        
    } catch (error) {
        console.error("\n❌ Error creating event:", error.message);
        if (error.logs) {
            console.log("\nProgram logs:");
            error.logs.forEach(log => console.log(log));
        }
    }
}

createEvent().catch(console.error);
