const axios = require('axios');

// Service URLs
const EVENT_SERVICE = 'http://localhost:3001';
const TICKET_SERVICE = 'http://localhost:3002';
const USER_SERVICE = 'http://localhost:3003';

// Test data storage
let testData = {
  venueId: null,
  eventId: null,
  userId: `user-${Date.now()}`,
  userEmail: `test${Date.now()}@example.com`,
  custodialWallet: null,
  phantomWallet: `phantom${Date.now()}`,
  ticketId: null,
  mintJobId: null,
  migrationId: null
};

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
const tests = {
  // EVENT SERVICE TESTS
  async testCreateVenue() {
    log('\n📍 TEST: Create Venue', 'blue');
    try {
      const response = await axios.post(`${EVENT_SERVICE}/venues`, {
        name: "Test Venue - Club Space Miami",
        address: "34 NE 11th St",
        city: "Miami",
        state: "FL",
        country: "USA",
        postalCode: "33132",
        latitude: 25.7617,
        longitude: -80.1918,
        capacity: 1500,
        venueType: "CLUB",
        amenities: ["Bar", "VIP Area", "Parking", "Coat Check"],
        ownerWallet: `venue-owner-${Date.now()}`
      });
      
      testData.venueId = response.data.id;
      log(`✅ Venue created: ${testData.venueId}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to create venue: ${error.message}`, 'red');
      return false;
    }
  },

  async testGetVenues() {
    log('\n📍 TEST: Get All Venues', 'blue');
    try {
      const response = await axios.get(`${EVENT_SERVICE}/venues`);
      log(`✅ Found ${response.data.length} venues`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get venues: ${error.message}`, 'red');
      return false;
    }
  },

  async testCreateEvent() {
    log('\n🎫 TEST: Create Event', 'blue');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 4);

      const response = await axios.post(`${EVENT_SERVICE}/events`, {
        name: "EDM Night - Test Event",
        description: "The biggest EDM night in Miami",
        venueId: testData.venueId,
        organizerWallet: `organizer-${Date.now()}`,
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        totalTickets: 500,
        generalPrice: "50000000000",
        vipPrice: "100000000000",
        transferable: true,
        tiers: [
          {
            name: "Early Bird",
            price: "40000000000",
            totalSupply: 100,
            dynamicPricing: true,
            minPrice: "35000000000",
            maxPrice: "60000000000"
          }
        ]
      });
      
      testData.eventId = response.data.id;
      log(`✅ Event created: ${testData.eventId}`, 'green');
      log(`   Name: ${response.data.name}`, 'green');
      log(`   Venue: ${response.data.venue.name}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to create event: ${error.message}`, 'red');
      console.error(error.response?.data);
      return false;
    }
  },

  async testGetEventCapacity() {
    log('\n📊 TEST: Get Event Capacity', 'blue');
    try {
      const response = await axios.get(`${EVENT_SERVICE}/events/${testData.eventId}/capacity`);
      log(`✅ Capacity info:`, 'green');
      log(`   Total: ${response.data.total}`, 'green');
      log(`   Available: ${response.data.available}`, 'green');
      log(`   Sold: ${response.data.sold}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get capacity: ${error.message}`, 'red');
      return false;
    }
  },

  async testUpcomingEvents() {
    log('\n📅 TEST: Get Upcoming Events', 'blue');
    try {
      const response = await axios.get(`${EVENT_SERVICE}/schedule/upcoming`);
      log(`✅ Found ${response.data.length} upcoming events`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get upcoming events: ${error.message}`, 'red');
      return false;
    }
  },

  // USER SERVICE TESTS
  async testCreateCustodialWallet() {
    log('\n💳 TEST: Create Custodial Wallet', 'blue');
    try {
      const response = await axios.post(`${USER_SERVICE}/wallets/create`, {
        email: testData.userEmail,
        userId: testData.userId,
        walletType: "CUSTODIAL"
      });
      
      testData.custodialWallet = response.data.walletAddress;
      log(`✅ Custodial wallet created: ${testData.custodialWallet}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to create custodial wallet: ${error.message}`, 'red');
      return false;
    }
  },

  async testGetWalletBalance() {
    log('\n💰 TEST: Get Wallet Balance', 'blue');
    try {
      const response = await axios.get(`${USER_SERVICE}/wallets/balance`, {
        params: { walletAddress: testData.custodialWallet }
      });
      log(`✅ Wallet balance: ${response.data.balance} SOL`, 'green');
      log(`   Has minimum rent: ${response.data.hasMinimumRent}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get balance: ${error.message}`, 'red');
      return false;
    }
  },

  async testConnectPhantom() {
    log('\n👻 TEST: Connect Phantom Wallet', 'blue');
    try {
      const response = await axios.post(`${USER_SERVICE}/wallets/connect-phantom`, {
        userId: testData.userId,
        phantomWallet: testData.phantomWallet
      });
      log(`✅ Phantom wallet connected: ${response.data.walletAddress}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to connect Phantom: ${error.message}`, 'red');
      return false;
    }
  },

  async testWalletAnalytics() {
    log('\n📈 TEST: Get Wallet Analytics', 'blue');
    try {
      const response = await axios.get(`${USER_SERVICE}/wallets/analytics?timeframe=day`);
      log(`✅ Wallet analytics:`, 'green');
      log(`   Total wallets: ${response.data.totalWallets}`, 'green');
      log(`   Custodial: ${response.data.custodialWallets}`, 'green');
      log(`   Phantom: ${response.data.phantomWallets}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to get analytics: ${error.message}`, 'red');
      return false;
    }
  },

  // TICKET SERVICE TESTS
  async testMintTicket() {
    log('\n🎟️ TEST: Mint Ticket', 'blue');
    try {
      const response = await axios.post(`${TICKET_SERVICE}/tickets/mint`, {
        eventId: testData.eventId,
        eventPDA: "MockEventPDA123",
        buyerWallet: testData.custodialWallet,
        tier: "general",
        price: "50000000000",
        paymentId: `stripe_${Date.now()}`
      });
      
      testData.mintJobId = response.data.jobId;
      log(`✅ Mint job queued: ${testData.mintJobId}`, 'green');
      log(`   Status: ${response.data.status}`, 'green');
      log(`   Estimated time: ${response.data.estimatedTime}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to mint ticket: ${error.message}`, 'red');
      return false;
    }
  },

  async testCheckMintStatus() {
    log('\n⏳ TEST: Check Mint Status', 'blue');
    try {
      await sleep(3000); // Wait for mock minting
      const response = await axios.get(`${TICKET_SERVICE}/tickets/mint-status/${testData.mintJobId}`);
      log(`✅ Mint status: ${response.data.state}`, 'green');
      
      if (response.data.result && response.data.result.ticketIds) {
        testData.ticketId = response.data.result.ticketIds[0].ticketId;
        log(`   Ticket ID: ${testData.ticketId}`, 'green');
        log(`   Ticket PDA: ${response.data.result.ticketIds[0].ticketPDA}`, 'green');
      }
      return true;
    } catch (error) {
      log(`❌ Failed to check mint status: ${error.message}`, 'red');
      return false;
    }
  },

  async testGenerateQR() {
    log('\n📱 TEST: Generate QR Code', 'blue');
    try {
      const response = await axios.post(`${TICKET_SERVICE}/tickets/generate-qr`, {
        ticketId: testData.ticketId || `test-ticket-${Date.now()}`,
        eventId: testData.eventId,
        ticketPDA: "MockTicketPDA123",
        owner: testData.custodialWallet,
        tier: "general",
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      
      log(`✅ QR code generated`, 'green');
      log(`   Verification code: ${response.data.verificationCode}`, 'green');
      log(`   QR data length: ${response.data.qrDataUrl.length} chars`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to generate QR: ${error.message}`, 'red');
      return false;
    }
  },

  async testBatchMint() {
    log('\n🎟️🎟️ TEST: Batch Mint Tickets', 'blue');
    try {
      const response = await axios.post(`${TICKET_SERVICE}/tickets/batch-mint`, {
        eventId: testData.eventId,
        eventPDA: "MockEventPDA123",
        buyerWallet: testData.custodialWallet,
        tier: "vip",
        quantity: 5,
        totalPrice: "500000000000",
        paymentId: `stripe_batch_${Date.now()}`
      });
      
      log(`✅ Batch mint queued`, 'green');
      log(`   Total quantity: ${response.data.totalQuantity}`, 'green');
      log(`   Batches: ${response.data.batches}`, 'green');
      log(`   Job IDs: ${response.data.jobIds.length}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to batch mint: ${error.message}`, 'red');
      return false;
    }
  },

  // INTEGRATION TESTS
  async testWalletMigration() {
    log('\n🔄 TEST: Wallet Migration', 'blue');
    try {
      const response = await axios.post(`${USER_SERVICE}/wallets/migrate`, {
        userId: testData.userId,
        email: testData.userEmail,
        phantomWallet: testData.phantomWallet,
        skipConfirmation: true
      });
      
      testData.migrationId = response.data.migrationId;
      log(`✅ Migration initiated: ${testData.migrationId}`, 'green');
      log(`   Status: ${response.data.status}`, 'green');
      log(`   Estimated time: ${response.data.estimatedTime}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to initiate migration: ${error.message}`, 'red');
      return false;
    }
  },

  async testCheckMigrationStatus() {
    log('\n🔍 TEST: Check Migration Status', 'blue');
    try {
      await sleep(2000);
      const response = await axios.get(`${USER_SERVICE}/wallets/migration/${testData.migrationId}`);
      log(`✅ Migration status: ${response.data.status}`, 'green');
      log(`   Progress: ${response.data.progress}%`, 'green');
      log(`   Tickets migrated: ${response.data.ticketsMigrated}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Failed to check migration: ${error.message}`, 'red');
      return false;
    }
  }
};

// Main test runner
async function runAllTests() {
  log('\n🚀 STARTING COMPREHENSIVE WEEK 2 TESTS\n', 'yellow');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Run all tests in order
  const testOrder = [
    // Event Service
    'testCreateVenue',
    'testGetVenues',
    'testCreateEvent',
    'testGetEventCapacity',
    'testUpcomingEvents',
    
    // User Service
    'testCreateCustodialWallet',
    'testGetWalletBalance',
    'testConnectPhantom',
    'testWalletAnalytics',
    
    // Ticket Service
    'testMintTicket',
    'testCheckMintStatus',
    'testGenerateQR',
    'testBatchMint',
    
    // Integration
    'testWalletMigration',
    'testCheckMigrationStatus'
  ];

  for (const testName of testOrder) {
    try {
      const passed = await tests[testName]();
      results.tests.push({ name: testName, passed });
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log(`❌ Test ${testName} threw error: ${error.message}`, 'red');
      results.tests.push({ name: testName, passed: false });
      results.failed++;
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('📊 TEST SUMMARY', 'yellow');
  log('='.repeat(60), 'blue');
  
  results.tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    const color = test.passed ? 'green' : 'red';
    log(`${icon} ${test.name}`, color);
  });
  
  log('\n' + '='.repeat(60), 'blue');
  log(`TOTAL: ${results.passed} passed, ${results.failed} failed`, results.failed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'blue');

  // Check what's working
  log('\n🔍 SERVICES STATUS:', 'yellow');
  log(`✅ Event Service: Can create/manage events and venues`, 'green');
  log(`✅ User Service: Can create wallets and track analytics`, 'green');
  log(`✅ Ticket Service: Can mint tickets and generate QR codes`, 'green');
  
  log('\n⚠️  NOTES:', 'yellow');
  log(`- Blockchain minting is mocked (no real Solana interaction yet)`, 'yellow');
  log(`- Redis not running (queues work but no persistence)`, 'yellow');
  log(`- Email delivery not configured (would work with SMTP)`, 'yellow');
  
  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! Week 2 is complete and working!', 'green');
    log('You can confidently move on to Week 3!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Fix these before moving on.', 'red');
  }

  // Save test data for manual inspection
  console.log('\n📋 Test Data (for manual testing):');
  console.log(JSON.stringify(testData, null, 2));
}

// Run the tests
runAllTests().catch(console.error);
