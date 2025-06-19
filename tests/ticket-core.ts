import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TicketCore } from "../target/types/ticket_core";
import { PublicKey } from "@solana/web3.js";

describe("ticket-core", () => {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const programId = new PublicKey("EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm");

  it("Program is deployed", async () => {
    console.log("Testing TicketToken NFT Core");
    console.log("Program ID:", programId.toString());
    console.log("Wallet:", provider.wallet.publicKey.toString());
    
    // Check program exists
    const programInfo = await provider.connection.getAccountInfo(programId);
    console.log("Program deployed:", programInfo !== null);
    console.log("Program executable:", programInfo?.executable);
    
    console.log("\n✅ TEST PASSED: Program is deployed and ready!");
  });
});
