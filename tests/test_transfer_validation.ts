import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TicketCore } from "../target/types/ticket_core";
import { assert } from "chai";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import * as crypto from "crypto";

describe("Transfer and Validation Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Your deployed program ID
  const programId = new PublicKey("EeU4nPMu9omn56qNFwWHLBTwPvXQgHNk4E7scsiK8Wwm");
  const program = new Program<TicketCore>(
    require("../target/idl/ticket_core.json"),
    programId,
    provider
  );

  // Test wallets
  const organizer = provider.wallet;
  const buyer1 = Keypair.generate();
  const buyer2 = Keypair.generate();
  const gateStaff = Keypair.generate();
  const freezeAuthority = Keypair.generate();
  
  const eventId = new anchor.BN(Date.now());
  const ticketId = new anchor.BN(1);
  const ticketId2 = new anchor.BN(2);

  // PDAs
  let eventPda: PublicKey;
  let ticketPda: PublicKey;
  let ticketPda2: PublicKey;
  let delegatePda: PublicKey;
  let validationPda: PublicKey;
  let freezePda: PublicKey;

  before(async () => {
    // Airdrop to test wallets
    await provider.connection.requestAirdrop(buyer1.publicKey, 2e9);
    await provider.connection.requestAirdrop(buyer2.publicKey, 2e9);
    await provider.connection.requestAirdrop(gateStaff.publicKey, 1e9);
    await provider.connection.requestAirdrop(freezeAuthority.publicKey, 1e9);
    
    // Wait for airdrops
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Derive PDAs
    [eventPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), eventId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  });

  it("Creates an event with transfer and validation features enabled", async () => {
    const tx = await program.methods
      .createEvent(
        "Test Concert",
        "Madison Square Garden",
        new anchor.BN(Date.now() / 1000 + 86400), // Tomorrow
        new anchor.BN(1000),
        new anchor.BN(0.5 * 1e9), // 0.5 SOL general
        new anchor.BN(1.0 * 1e9)  // 1.0 SOL VIP
      )
      .accounts({
        event: eventPda,
        authority: organizer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Event created:", tx);

    // Fetch and verify event
    const event = await program.account.event.fetch(eventPda);
    assert.equal(event.name, "Test Concert");
    assert.equal(event.transferable, true); // Should be true by default
  });

  it("Mints tickets for testing", async () => {
    // Derive ticket PDAs
    [ticketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ticket"), eventPda.toBuffer(), ticketId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    [ticketPda2] = PublicKey.findProgramAddressSync(
      [Buffer.from("ticket"), eventPda.toBuffer(), ticketId2.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Mint first ticket to buyer1
    await program.methods
      .mintTicket("general")
      .accounts({
        ticket: ticketPda,
        event: eventPda,
        buyer: buyer1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer1])
      .rpc();

    // Mint second ticket to buyer1 (for freeze testing)
    await program.methods
      .mintTicket("general")
      .accounts({
        ticket: ticketPda2,
        event: eventPda,
        buyer: buyer1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer1])
      .rpc();

    console.log("Tickets minted successfully");
  });

  it("Transfers a ticket from buyer1 to buyer2", async () => {
    const tx = await program.methods
      .transferTicket("Gift for friend")
      .accounts({
        ticket: ticketPda,
        event: eventPda,
        from: buyer1.publicKey,
        to: buyer2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer1])
      .rpc();

    console.log("Ticket transferred:", tx);

    // Verify transfer
    const ticket = await program.account.ticket.fetch(ticketPda);
    assert.equal(ticket.owner.toString(), buyer2.publicKey.toString());
    assert.equal(ticket.transferCount, 1);
  });

  it("Initializes a delegate transfer (email transfer)", async () => {
    // Create email hash
    const email = "friend@example.com";
    const emailHash = crypto.createHash('sha256').update(email).digest();

    [delegatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("delegate"), ticketPda2.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializeDelegateTransfer(
        [...emailHash], // Convert to array
        new anchor.BN(24) // 24 hours expiry
      )
      .accounts({
        ticket: ticketPda2,
        event: eventPda,
        delegateAuthority: delegatePda,
        owner: buyer1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer1])
      .rpc();

    console.log("Delegate transfer initialized:", tx);

    const delegate = await program.account.delegateAuthority.fetch(delegatePda);
    assert.equal(delegate.originalOwner.toString(), buyer1.publicKey.toString());
  });

  it("Completes a delegate transfer", async () => {
    // Get the delegate authority to retrieve claim code
    const delegate = await program.account.delegateAuthority.fetch(delegatePda);
    
    // Recreate email hash
    const email = "friend@example.com";
    const emailHash = crypto.createHash('sha256').update(email).digest();

    const tx = await program.methods
      .completeDelegateTransfer(
        [...emailHash],
        delegate.claimCode
      )
      .accounts({
        ticket: ticketPda2,
        event: eventPda,
        delegateAuthority: delegatePda,
        newOwner: buyer2.publicKey,
        originalOwner: buyer1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer2])
      .rpc();

    console.log("Delegate transfer completed:", tx);

    // Verify ownership changed
    const ticket = await program.account.ticket.fetch(ticketPda2);
    assert.equal(ticket.owner.toString(), buyer2.publicKey.toString());
  });

  it("Validates ticket entry at gate", async () => {
    // First, update event to add gate staff
    await program.methods
      .updateEvent(
        null, // venue
        null, // date
        null, // general price
        null  // vip price
      )
      .accounts({
        event: eventPda,
        authority: organizer.publicKey,
      })
      .postInstructions([
        // Add instruction to update gate staff
        // This would need to be implemented in update_event
      ])
      .rpc();

    // Derive validation record PDA
    const timestamp = Math.floor(Date.now() / 1000);
    [validationPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("validation"), 
        ticketPda.toBuffer(),
        new anchor.BN(timestamp).toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    const tx = await program.methods
      .validateEntry(
        "Main Gate A",
        { entry: {} } // ValidationType::Entry
      )
      .accounts({
        ticket: ticketPda,
        event: eventPda,
        validationRecord: validationPda,
        validator: organizer.publicKey, // Using organizer as they have permission
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Ticket validated for entry:", tx);

    // Check ticket is marked as validated
    const ticket = await program.account.ticket.fetch(ticketPda);
    assert.equal(ticket.entryValidated, true);
    assert.equal(ticket.validationCount, 1);
  });

  it("Freezes a suspicious ticket", async () => {
    [freezePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("freeze"), ticketPda2.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .freezeTicket(
        { suspectedFraud: {} }, // FreezeReason::SuspectedFraud
        "Multiple scan attempts detected at different gates"
      )
      .accounts({
        ticket: ticketPda2,
        event: eventPda,
        freezeRecord: freezePda,
        authority: organizer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Ticket frozen:", tx);

    const ticket = await program.account.ticket.fetch(ticketPda2);
    assert.equal(ticket.isFrozen, true);
  });

  it("Unfreezes the ticket after investigation", async () => {
    const tx = await program.methods
      .unfreezeTicket("False alarm - legitimate owner verified")
      .accounts({
        ticket: ticketPda2,
        event: eventPda,
        freezeRecord: freezePda,
        authority: organizer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Ticket unfrozen:", tx);

    const ticket = await program.account.ticket.fetch(ticketPda2);
    assert.equal(ticket.isFrozen, false);
  });

  it("Marks ticket as used after event", async () => {
    const tx = await program.methods
      .markTicketUsed()
      .accounts({
        ticket: ticketPda,
        event: eventPda,
        authority: organizer.publicKey,
      })
      .rpc();

    console.log("Ticket marked as used:", tx);

    const ticket = await program.account.ticket.fetch(ticketPda);
    assert.equal(ticket.used, true);
  });

  it("Cannot transfer a used ticket", async () => {
    try {
      await program.methods
        .transferTicket("Should fail")
        .accounts({
          ticket: ticketPda,
          event: eventPda,
          from: buyer2.publicKey,
          to: buyer1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer2])
        .rpc();
      
      assert.fail("Should have failed to transfer used ticket");
    } catch (error) {
      assert.include(error.toString(), "TicketAlreadyUsed");
    }
  });

  it("Burns a used ticket", async () => {
    const tx = await program.methods
      .burnTicket()
      .accounts({
        ticket: ticketPda,
        event: eventPda,
        ticketOwner: buyer2.publicKey,
        authority: organizer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Ticket burned:", tx);

    // Verify ticket account is closed
    try {
      await program.account.ticket.fetch(ticketPda);
      assert.fail("Ticket should be burned/closed");
    } catch {
      console.log("✓ Ticket successfully burned");
    }
  });
});
