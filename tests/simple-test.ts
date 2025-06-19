import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

describe("ticket-core", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("Creates an event", async () => {
    console.log("Starting test...");
    
    // Your program ID from lib.rs
    const programId = new PublicKey("2GDYBKrhJppXYgUs78iGDVwdDoQ8G9tCPXVjEjEDWeWd");
    
    const eventName = "Miami Music Fest";
    const [eventPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), Buffer.from(eventName)],
      programId
    );

    console.log("Program ID:", programId.toString());
    console.log("Event PDA:", eventPDA.toString());
    console.log("Test completed!");
  });
});
